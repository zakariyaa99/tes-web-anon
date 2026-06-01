import { ProxyAgent, fetch as undiciFetch } from 'undici';

/**
 * Fetch wrapper yang meng-route request melalui Fixie proxy (static IP).
 * Gunakan ini untuk semua request server-side ke iPaymu.
 *
 * Menggunakan undici ProxyAgent karena native fetch Node.js 18+
 * tidak mendukung opsi `agent` dari https-proxy-agent.
 *
 * @param {string} url - URL tujuan
 * @param {RequestInit} options - Opsi fetch standar
 * @returns {Promise<Response>}
 */
export function fetchWithProxy(url, options = {}) {
  const proxyUrl = process.env.FIXIE_URL;

  if (proxyUrl) {
    console.log(`[fetchWithProxy] Routing via proxy: ${proxyUrl.replace(/:[^:@]+@/, ':***@')}`);
    const dispatcher = new ProxyAgent(proxyUrl);
    return undiciFetch(url, { ...options, dispatcher });
  }

  console.warn('[fetchWithProxy] FIXIE_URL not set — using direct connection (IP not whitelisted!)');
  return fetch(url, options);
}
