import { auth, db, doc, getDoc, setDoc } from "./firebase-config.js";

export function getCart() {
  const cart = localStorage.getItem('f1-cart');
  return cart ? JSON.parse(cart) : [];
}

async function saveCart(cart) {
  localStorage.setItem('f1-cart', JSON.stringify(cart));

  const user = auth.currentUser;
  if (user) {
    try {
      await setDoc(doc(db, "carts", user.uid), { items: cart });
    } catch (e) {
      console.error("Error saving cart to cloud:", e);
    }
  }
}

export async function loadUserCart(userId) {
  try {
    const docRef = doc(db, "carts", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      localStorage.setItem('f1-cart', JSON.stringify(data.items || []));
    } else {
      localStorage.setItem('f1-cart', JSON.stringify([]));
    }
  } catch (error) {
    console.error("Error loading cart:", error);
  }
}

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

export function updateQuantity(productId, change) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);

  if (item) {
    item.quantity += change;
    if (item.quantity < 1) item.quantity = 1;
    saveCart(cart); 
  }
  return cart;
}

export function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart); 
  return cart;
}

export function clearCart() {
  localStorage.removeItem('f1-cart');
  const user = auth.currentUser;
  if (user) {
    setDoc(doc(db, "carts", user.uid), { items: [] });
  }
}

export function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
}