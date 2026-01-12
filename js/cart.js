// js/cart.js
import { auth, db, doc, getDoc, setDoc } from "./firebase-config.js";

// Helper to get cart from storage (Reads from local browser cache for speed)
export function getCart() {
  const cart = localStorage.getItem('f1-cart');
  return cart ? JSON.parse(cart) : [];
}

// Helper to save cart (Writes to LocalStorage AND Firebase)
async function saveCart(cart) {
  // 1. Save to LocalStorage (Instant UI update)
  localStorage.setItem('f1-cart', JSON.stringify(cart));

  // 2. Save to Firebase (Permanent Cloud Backup)
  const user = auth.currentUser;
  if (user) {
    try {
      // Saves the cart under the User's ID in a "carts" collection
      await setDoc(doc(db, "carts", user.uid), { items: cart });
    } catch (e) {
      console.error("Error saving cart to cloud:", e);
    }
  }
}

// NEW FUNCTION: Call this when the user logs in to restore their cart
export async function loadUserCart(userId) {
  try {
    const docRef = doc(db, "carts", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // User has a saved cart in the cloud -> Overwrite local cart
      const data = docSnap.data();
      localStorage.setItem('f1-cart', JSON.stringify(data.items || []));
    } else {
      // User has no saved cart -> Start with an empty one
      localStorage.setItem('f1-cart', JSON.stringify([]));
    }
  } catch (error) {
    console.error("Error loading cart:", error);
  }
}

// Add item to cart
export function addToCart(product) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }
  
  saveCart(cart); // This now saves to Cloud too!
  alert(`${product.title} added to cart!`);
}

// Update quantity
export function updateQuantity(productId, change) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);

  if (item) {
    item.quantity += change;
    if (item.quantity < 1) item.quantity = 1;
    saveCart(cart); // Saves to Cloud
  }
  return cart;
}

// Remove item
export function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart); // Saves to Cloud
  return cart;
}

// Clear cart
export function clearCart() {
  localStorage.removeItem('f1-cart');
  // Optional: If you want to clear the Cloud cart after purchase too:
  const user = auth.currentUser;
  if (user) {
    setDoc(doc(db, "carts", user.uid), { items: [] });
  }
}

// Calculate total
export function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
}