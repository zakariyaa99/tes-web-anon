import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';
import { fetchWithProxy } from '../../../lib/fetchWithProxy';
import crypto from 'crypto';

const IPAYMU_VA      = process.env.IPAYMU_VA;
const IPAYMU_API_KEY = process.env.IPAYMU_API_KEY;
const IS_PRODUCTION  = process.env.IPAYMU_IS_PRODUCTION === 'true';

// Gunakan endpoint All-Payment (bukan /direct) agar iPaymu tampilkan
// halaman pembayaran mereka sendiri (popup/redirect)
const IPAYMU_URL = IS_PRODUCTION
  ? 'https://my.ipaymu.com/api/v2/payment'
  : 'https://sandbox.ipaymu.com/api/v2/payment';

/**
 * Build iPaymu HMAC-SHA256 signature.
 * Formula: HMAC_SHA256("POST:{va}:{SHA256(body)}:{apiKey}", apiKey)
 */
function buildSignature(bodyObj) {
  const bodyStr  = JSON.stringify(bodyObj);
  const bodyHash = crypto.createHash('sha256').update(bodyStr).digest('hex').toLowerCase();
  const toSign   = `POST:${IPAYMU_VA}:${bodyHash}:${IPAYMU_API_KEY}`;
  return crypto.createHmac('sha256', IPAYMU_API_KEY).update(toSign).digest('hex').toLowerCase();
}

/** Format Date → "YYYYMMDDHHmmss" for iPaymu timestamp header */
function isoTimestamp() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
    String(d.getHours()).padStart(2, '0'),
    String(d.getMinutes()).padStart(2, '0'),
    String(d.getSeconds()).padStart(2, '0'),
  ].join('');
}

/**
 * POST /api/ipaymu
 * Body: { cart, shipping }
 * Header: Authorization: Bearer <supabase_access_token>
 * Returns: { payment_url } — frontend opens this as popup
 */
export async function POST(request) {
  try {
    // ── 1. Authenticate ────────────────────────────────────────────────────
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data: { user }, error: authErr } = await supabaseAnon.auth.getUser(token);
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // ── 2. Parse & validate body ───────────────────────────────────────────
    const { cart, shipping } = await request.json();

    if (!cart || cart.length === 0)
      return NextResponse.json({ error: 'Cart kosong' }, { status: 400 });
    if (!shipping?.name || !shipping?.phone || !shipping?.address || !shipping?.city)
      return NextResponse.json({ error: 'Data pengiriman tidak lengkap' }, { status: 400 });

    // ── 3. Totals ──────────────────────────────────────────────────────────
    const totalAmount = cart.reduce((sum, item) => sum + Math.round(item.price) * item.qty, 0);
    const referenceId = `IPAYMU-${Date.now()}-${user.id.slice(0, 8)}`;

    // ── 4. Create order in Supabase ────────────────────────────────────────
    const db = getSupabaseAdmin();

    const { data: order, error: orderErr } = await db
      .from('orders')
      .insert({
        user_id:           user.id,
        status:            'pending',
        total_amount:      totalAmount,
        shipping_name:     shipping.name,
        shipping_phone:    shipping.phone,
        shipping_address:  shipping.address,
        shipping_city:     shipping.city,
        shipping_postal:   shipping.postal || '',
        midtrans_order_id: referenceId,   // reused as generic reference field
        payment_gateway:   'ipaymu',
        payment_method:    'all',
        payment_channel:   'all',
      })
      .select()
      .single();

    if (orderErr) throw new Error(`Order insert failed: ${orderErr.message}`);

    // ── 5. Insert order items ──────────────────────────────────────────────
    const orderItems = cart.map(item => ({
      order_id:   order.id,
      product_id: String(item.id),
      name:       item.name,
      price:      Math.round(item.price),
      qty:        item.qty,
      image:      item.image || '',
    }));

    const { error: itemsErr } = await db.from('order_items').insert(orderItems);
    if (itemsErr) throw new Error(`Order items insert failed: ${itemsErr.message}`);

    // ── 6. Build iPaymu payload ────────────────────────────────────────────
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
      || `https://${request.headers.get('host')}`;

    const ipaymuBody = {
      product:    cart.map(item => item.name?.substring(0, 50) || 'Produk'),
      qty:        cart.map(item => item.qty),
      price:      cart.map(item => Math.round(item.price)),
      amount:     totalAmount,
      returnUrl:  `${baseUrl}/orders?status=success`,
      cancelUrl:  `${baseUrl}/checkout`,
      notifyUrl:  `${baseUrl}/api/ipaymu-webhook`,
      referenceId,
      // Buyer info — kirim kedua versi untuk kompatibilitas
      name:       shipping.name,
      buyerName:  shipping.name,
      phone:      shipping.phone,
      buyerPhone: shipping.phone,
      email:      user.email || '',
      buyerEmail: user.email || '',
    };

    // ── 7. Call iPaymu All-Payment API via Fixie proxy ─────────────────────
    const signature = buildSignature(ipaymuBody);
    const timestamp = isoTimestamp();

    console.log('[/api/ipaymu] Calling iPaymu URL:', IPAYMU_URL);
    console.log('[/api/ipaymu] Payload:', JSON.stringify(ipaymuBody));

    const ipaymuRes = await fetchWithProxy(IPAYMU_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept':       'application/json',
        'va':           IPAYMU_VA,
        'signature':    signature,
        'timestamp':    timestamp,
      },
      body: JSON.stringify(ipaymuBody),
    });

    const ipaymuData = await ipaymuRes.json();
    console.log('[/api/ipaymu] iPaymu response status:', ipaymuRes.status);
    console.log('[/api/ipaymu] iPaymu response body:', JSON.stringify(ipaymuData));

    if (!ipaymuRes.ok || ipaymuData.Status !== 200) {
      throw new Error(ipaymuData.Message || ipaymuData.message || `iPaymu error HTTP ${ipaymuRes.status}`);
    }

    const { SessionID, TransactionId, Url } = ipaymuData.Data;

    // ── 8. Save iPaymu transaction ID to order ─────────────────────────────
    await db
      .from('orders')
      .update({ ipaymu_trx_id: String(TransactionId) })
      .eq('id', order.id);

    // ── 9. Return payment URL to frontend (frontend opens as popup) ─────────
    return NextResponse.json({
      order_id:     order.id,
      trx_id:       TransactionId,
      session_id:   SessionID,
      payment_url:  Url,   // ← iPaymu hosted payment page
    });

  } catch (err) {
    console.error('[/api/ipaymu]', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
