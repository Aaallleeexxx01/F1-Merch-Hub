// js/cart.js

// Helper to get cart from storage
export function getCart() {
  const cart = localStorage.getItem('f1-cart');
  return cart ? JSON.parse(cart) : [];
}

// Helper to save cart
function saveCart(cart) {
  localStorage.setItem('f1-cart', JSON.stringify(cart));
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
  
  saveCart(cart);
  alert(`${product.title} added to cart!`);
}

// Update quantity (+ or -)
export function updateQuantity(productId, change) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);

  if (item) {
    item.quantity += change;
    // Prevent quantity from going below 1 (use remove for that)
    if (item.quantity < 1) item.quantity = 1;
    saveCart(cart);
  }
  return cart; // Return updated cart for UI to use
}

// Remove item entirely
export function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  return cart;
}

// Clear cart after purchase
export function clearCart() {
  localStorage.removeItem('f1-cart');
}

// Calculate total
export function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
}