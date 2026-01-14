import { requireLogin } from "./auth.js"; 
import { db, collection, addDoc, auth, onAuthStateChanged } from "./firebase-config.js";
import { getCart, updateQuantity, removeFromCart, getCartTotal, clearCart } from "./cart.js";
  
requireLogin();

const cartList = document.getElementById('cart-list');
const finalTotalEl = document.getElementById('final-total');
const checkoutForm = document.getElementById('checkout-form');

function renderCart() {
  const cart = getCart();
  
  if (cart.length === 0) {
    cartList.innerHTML = '<p>Your cart is empty. <a href="shop.html" style="color:#e10600;">Go Shopping</a></p>';
    finalTotalEl.textContent = '$0.00';
    return;
  }

  cartList.innerHTML = ''; 
  
  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div style="display:flex; align-items:center;">
        <img src="${item.image}" alt="${item.title}">
        <div class="item-info">
          <h4>${item.title}</h4>
          <p>$${item.price} x ${item.quantity}</p>
        </div>
      </div>
      <div class="item-controls">
        <button class="qty-btn" data-id="${item.id}" data-action="minus">-</button>
        <span>${item.quantity}</span>
        <button class="qty-btn" data-id="${item.id}" data-action="plus">+</button>
        <button class="remove-btn" data-id="${item.id}">Remove</button>
      </div>
    `;
    cartList.appendChild(div);
  });

  finalTotalEl.textContent = `$${getCartTotal()}`;
  attachListeners();
}

function attachListeners() {
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const action = e.target.dataset.action;
      const change = action === 'plus' ? 1 : -1;
      updateQuantity(id, change);
      renderCart(); 
    });
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      removeFromCart(id);
      renderCart();
    });
  });
}

checkoutForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to checkout.");
    window.location.href = "login.html";
    return;
  }

  const cart = getCart();
  if (cart.length === 0) return alert("Cart is empty!");

  const name = document.getElementById('full-name').value;
  const address = document.getElementById('address').value;
  const phone = document.getElementById('phone').value;

  try {
    const orderData = {
      userId: user.uid,
      userEmail: user.email,
      items: cart,
      totalAmount: parseFloat(getCartTotal()),
      shippingInfo: { name, address, phone },
      createdAt: new Date(),
      status: "Processing"
    };

    await addDoc(collection(db, "orders"), orderData);

    alert("Order placed successfully!");
    clearCart();
    window.location.href = "profile.html"; 
  } catch (error) {
    console.error("Order error:", error);
    alert("Failed to place order: " + error.message);
  }
});

renderCart();