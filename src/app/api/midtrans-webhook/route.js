import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

/**
 * POST /api/midtrans-webhook
 * Called by Midtrans to notify us of payment status changes.
 * Verifies signature, updates order status, decrements stock, clears cart.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key,
      transaction_id,
    } = body;

    // ── 1. Verify Midtrans signature ────────────────────────────────────────
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const expectedSig = createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (signature_key !== expectedSig) {
      console.warn('[webhook] Invalid signature for order', order_id);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // ── 2. Determine new status ─────────────────────────────────────────────
    let newStatus = null;

    if (transaction_status === 'capture') {
      newStatus = fraud_status === 'challenge' ? 'pending' : 'paid';
    } else if (transaction_status === 'settlement') {
      newStatus = 'paid';
    } else if (['cancel', 'expire', 'deny'].includes(transaction_status)) {
      newStatus = 'cancelled';
    } else if (transaction_status === 'pending') {
      newStatus = 'pending';
    }

    if (!newStatus) {
      // Unknown status — acknowledge and ignore
      return NextResponse.json({ received: true });
    }

    // ── 3. Fetch the order ──────────────────────────────────────────────────
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, status')
      .eq('midtrans_order_id', order_id)
      .maybeSingle();

    if (orderErr || !order) {
      console.error('[webhook] Order not found:', order_id);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Idempotency: skip if already in this state (or already paid)
    if (order.status === 'paid' && newStatus !== 'cancelled') {
      return NextResponse.json({ received: true });
    }

    // ── 4. Update order status ──────────────────────────────────────────────
    await supabaseAdmin
      .from('orders')
      .update({
        status: newStatus,
        midtrans_transaction_id: transaction_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    // ── 5. On successful payment: decrement stock & clear cart ──────────────
    if (newStatus === 'paid') {
      // Fetch order items
      const { data: items } = await supabaseAdmin
        .from('order_items')
        .select('product_id, qty')
        .eq('order_id', order.id);

      if (items?.length > 0) {
        // Decrement stock for each product (using RPC or individual updates)
        for (const item of items) {
          // Fetch current stock
          const { data: product } = await supabaseAdmin
            .from('products')
            .select('stok')
            .eq('id', item.product_id)
            .maybeSingle();

          if (product) {
            const newStok = Math.max(0, (product.stok || 0) - item.qty);
            await supabaseAdmin
              .from('products')
              .update({ stok: newStok })
              .eq('id', item.product_id);
          }
        }
      }

      // Clear the user's cart in Supabase
      if (order.user_id) {
        await supabaseAdmin
          .from('cart_items')
          .delete()
          .eq('user_id', order.user_id);
      }
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error('[/api/midtrans-webhook]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
