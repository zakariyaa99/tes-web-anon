const CART_KEY = 'anon_cart';

export function getCart() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  // Notify all listeners on the same page
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: items } }));
}

/**
 * Add or increment a product in the cart.
 * @param {{ id, name, price, packSize, image }} product
 * @param {number} qty
 */
export function addToCart(product, qty = 1) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx >= 0) {
    cart[idx].qty = Math.min(99, cart[idx].qty + qty);
  } else {
    cart.push({ ...product, qty });
  }
  saveCart(cart);
  return cart;
}

export function updateQty(id, qty) {
  const cart = getCart().map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i);
  saveCart(cart);
  return cart;
}

export function removeItem(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}

export function cartTotal(cart) {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

/** Total quantity across all items */
export function cartCount(cart) {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

/* ─────────────────────────────────────────────
   Remote (Supabase) cart functions — used when
   a user is authenticated.
───────────────────────────────────────────── */

import { supabase } from './supabaseClient';

/** Map a DB row → cart item shape */
function rowToItem(row) {
  return {
    id:       row.product_id,
    name:     row.name,
    price:    row.price,
    packSize: row.pack_size,
    image:    row.image,
    qty:      row.qty,
  };
}

/** Fetch all cart items for a logged-in user */
export async function getRemoteCart(userId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToItem);
}

/**
 * Add or increment a product in the remote cart.
 * Uses a fetch-then-upsert to honour the max-99 cap.
 */
export async function addToCartRemote(userId, product, qty = 1) {
  const pid = String(product.id);

  const { data: existing } = await supabase
    .from('cart_items')
    .select('qty')
    .eq('user_id', userId)
    .eq('product_id', pid)
    .maybeSingle();

  const newQty = existing ? Math.min(99, existing.qty + qty) : qty;

  const { error } = await supabase
    .from('cart_items')
    .upsert(
      {
        user_id:    userId,
        product_id: pid,
        name:       product.name,
        price:      product.price,
        pack_size:  product.packSize,
        image:      product.image,
        qty:        newQty,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,product_id' }
    );
  if (error) throw error;
}

/** Update the qty of a specific item in the remote cart */
export async function updateQtyRemote(userId, productId, qty) {
  const { error } = await supabase
    .from('cart_items')
    .update({ qty: Math.max(1, qty), updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('product_id', String(productId));
  if (error) throw error;
}

/** Remove a single item from the remote cart */
export async function removeItemRemote(userId, productId) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', String(productId));
  if (error) throw error;
}

/** Delete all items from the remote cart */
export async function clearCartRemote(userId) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}

/**
 * Called right after login.
 * Merges the guest localStorage cart into Supabase, then clears localStorage.
 */
export async function mergeGuestCartOnLogin(userId) {
  const guestCart = getCart();
  if (guestCart.length === 0) return;

  for (const item of guestCart) {
    try {
      await addToCartRemote(userId, item, item.qty);
    } catch (e) {
      console.error('Cart merge error for item', item.id, e);
    }
  }

  // Clear guest localStorage cart after successful merge
  localStorage.removeItem('anon_cart');
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: [] } }));
}
