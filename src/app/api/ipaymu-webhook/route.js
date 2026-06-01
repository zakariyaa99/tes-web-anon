import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

/**
 * POST /api/ipaymu-webhook
 * Dipanggil oleh iPaymu saat status transaksi berubah.
 * Selalu kembalikan 200 agar iPaymu tidak retry berulang.
 *
 * Payload iPaymu (contoh):
 * {
 *   "trx_id": "12345",
 *   "status": "Berhasil",       // Berhasil | Pending | Expired | Gagal
 *   "status_code": "00",
 *   "amount": "100000",
 *   "reference_id": "IPAYMU-xxx-yyy"
 * }
 */
export async function POST(request) {
  try {
    let body;
    const contentType = request.headers.get('content-type') || '';

    // iPaymu bisa kirim JSON atau form-urlencoded
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const text = await request.text();
      body = Object.fromEntries(new URLSearchParams(text));
    }

    const { trx_id, status } = body;

    if (!trx_id) {
      console.warn('[/api/ipaymu-webhook] Missing trx_id, ignoring.');
      return new Response('OK', { status: 200 });
    }

    // Map status iPaymu → status internal
    const statusMap = {
      berhasil: 'paid',
      success:  'paid',
      pending:  'pending',
      expired:  'expired',
      gagal:    'failed',
      failed:   'failed',
    };
    const orderStatus = statusMap[(status || '').toLowerCase()] || 'pending';

    const db = getSupabaseAdmin();
    const { error } = await db
      .from('orders')
      .update({ status: orderStatus })
      .eq('ipaymu_trx_id', String(trx_id));

    if (error) {
      console.error('[/api/ipaymu-webhook] DB update error:', error.message);
    } else {
      console.log(`[/api/ipaymu-webhook] trx_id=${trx_id} → ${orderStatus}`);
    }

  } catch (err) {
    // Selalu 200 agar iPaymu tidak retry
    console.error('[/api/ipaymu-webhook] Unexpected error:', err);
  }

  return new Response('OK', { status: 200 });
}
