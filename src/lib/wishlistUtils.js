const WL_KEY = 'anon_wishlist';

export function getWishlist() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(WL_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveWishlist(items) {
  localStorage.setItem(WL_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { wishlist: items } }));
}

export function addToWishlist(product) {
  const wl = getWishlist();
  if (wl.find(i => i.id === product.id)) return wl; // already in list
  const updated = [...wl, product];
  saveWishlist(updated);
  return updated;
}

export function removeFromWishlist(id) {
  const updated = getWishlist().filter(i => i.id !== id);
  saveWishlist(updated);
  return updated;
}

export function toggleWishlist(product) {
  const wl = getWishlist();
  if (wl.find(i => i.id === product.id)) {
    return { list: removeFromWishlist(product.id), added: false };
  } else {
    return { list: addToWishlist(product), added: true };
  }
}

export function isWishlisted(id) {
  return getWishlist().some(i => i.id === id);
}

export function wishlistCount(wl) {
  return wl.length;
}

/* ─────────────────────────────────────────────
   Remote (Supabase) wishlist functions — used
   when a user is authenticated.
───────────────────────────────────────────── */

import { supabase } from './supabaseClient';

/** Map a DB row → wishlist item shape */
function rowToWlItem(row) {
  return {
    id:       row.product_id,
    name:     row.name,
    price:    row.price,
    image:    row.image,
    category: row.category,
    packSize: row.pack_size,
  };
}

/** Fetch all wishlist items for a logged-in user */
export async function getRemoteWishlist(userId) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToWlItem);
}

/** Check if a product is in the remote wishlist */
export async function isWishlistedRemote(userId, productId) {
  const { data } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', String(productId))
    .maybeSingle();
  return !!data;
}

/** Add a product to the remote wishlist (idempotent) */
export async function addToWishlistRemote(userId, product) {
  const { error } = await supabase
    .from('wishlist_items')
    .upsert(
      {
        user_id:    userId,
        product_id: String(product.id),
        name:       product.name,
        price:      product.price,
        image:      product.image,
        category:   product.category,
        pack_size:  product.packSize,
      },
      { onConflict: 'user_id,product_id' }
    );
  if (error) throw error;
}

/** Remove a product from the remote wishlist */
export async function removeFromWishlistRemote(userId, productId) {
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', String(productId));
  if (error) throw error;
}

/**
 * Toggle wishlist state remotely.
 * Returns { added: boolean }
 */
export async function toggleWishlistRemote(userId, product) {
  const already = await isWishlistedRemote(userId, product.id);
  if (already) {
    await removeFromWishlistRemote(userId, product.id);
    return { added: false };
  } else {
    await addToWishlistRemote(userId, product);
    return { added: true };
  }
}

/**
 * Called right after login.
 * Merges guest localStorage wishlist into Supabase, then clears localStorage.
 */
export async function mergeGuestWishlistOnLogin(userId) {
  const guestWl = getWishlist();
  if (guestWl.length === 0) return;

  for (const item of guestWl) {
    try {
      await addToWishlistRemote(userId, item);
    } catch (e) {
      console.error('Wishlist merge error for item', item.id, e);
    }
  }

  localStorage.removeItem('anon_wishlist');
  window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { wishlist: [] } }));
}
