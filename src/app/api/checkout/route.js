import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const MIDTRANS_BASE_URL = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

/**
 * POST /api/checkout
 * Body: { cart: [{id, name, price, qty, image, packSize}], shipping: {name, phone, address, city, postal} }
 * Header: Authorization: Bearer <supabase_access_token>
 */
export async function POST(request) {
  try {
    // ── 1. Authenticate the caller ──────────────────────────────────────────
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token with the anon client
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data: { user }, error: authErr } = await supabaseAnon.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── 2. Parse + validate body ────────────────────────────────────────────
    const { cart, shipping } = await request.json();

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'Cart kosong' }, { status: 400 });
    }
    if (!shipping?.name || !shipping?.phone || !shipping?.address || !shipping?.city) {
      return NextResponse.json({ error: 'Data pengiriman tidak lengkap' }, { status: 400 });
    }

    // ── 3. Calculate totals ─────────────────────────────────────────────────
    const totalAmount = cart.reduce((sum, item) => sum + Math.round(item.price) * item.qty, 0);
    const midtransOrderId = `ORDER-${Date.now()}-${user.id.slice(0, 8)}`;

    // ── 4. Create order in Supabase (status: pending) ───────────────────────
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id:          user.id,
        status:           'pending',
        total_amount:     totalAmount,
        shipping_name:    shipping.name,
        shipping_phone:   shipping.phone,
        shipping_address: shipping.address,
        shipping_city:    shipping.city,
        shipping_postal:  shipping.postal || '',
        midtrans_order_id: midtransOrderId,
      })
      .select()
      .single();

    if (orderErr) throw new Error(`Order insert failed: ${orderErr.message}`);

    // ── 5. Insert order items ───────────────────────────────────────────────
    const orderItems = cart.map(item => ({
      order_id:   order.id,
      product_id: String(item.id),
      name:       item.name,
      price:      Math.round(item.price),
      qty:        item.qty,
      image:      item.image || '',
    }));

    const { error: itemsErr } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsErr) throw new Error(`Order items insert failed: ${itemsErr.message}`);

    // ── 6. Create Midtrans Snap transaction ─────────────────────────────────
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const basicAuth = Buffer.from(`${serverKey}:`).toString('base64');

    const midtransPayload = {
      transaction_details: {
        order_id:     midtransOrderId,
        gross_amount: totalAmount,
      },
      customer_details: {
        first_name: shipping.name,
        phone:      shipping.phone,
        email:      user.email,
        shipping_address: {
          first_name:  shipping.name,
          phone:       shipping.phone,
          address:     shipping.address,
          city:        shipping.city,
          postal_code: shipping.postal || '',
          country_code: 'IDN',
        },
      },
      item_details: cart.map(item => ({
        id:       String(item.id),
        price:    Math.round(item.price),
        quantity: item.qty,
        name:     item.name.substring(0, 50), // Midtrans has 50-char limit
      })),
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/orders?success=1`,
      },
    };

    const snapRes = await fetch(MIDTRANS_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify(midtransPayload),
    });

    if (!snapRes.ok) {
      const snapErr = await snapRes.text();
      throw new Error(`Midtrans error ${snapRes.status}: ${snapErr}`);
    }

    const { token: snapToken } = await snapRes.json();

    // ── 7. Save snap_token to order for reference ────────────────────────────
    await supabaseAdmin
      .from('orders')
      .update({ snap_token: snapToken })
      .eq('id', order.id);

    return NextResponse.json({ snap_token: snapToken, order_id: order.id });

  } catch (err) {
    console.error('[/api/checkout]', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
