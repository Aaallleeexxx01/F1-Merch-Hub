import { auth, db, collection, query, where, getDocs, onAuthStateChanged } from "./firebase-config.js";

const ordersContainer = document.getElementById('orders-container');
const reviewsContainer = document.getElementById('reviews-container'); // NEW
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is logged in: Show their data
    if (profileEmail) profileEmail.textContent = user.email;
    if (profileName) profileName.textContent = user.displayName || "F1 Fan";
    
    await loadOrders(user.uid);
    await loadMyReviews(user.uid); 

  } else {
    // User is NOT logged in

    // 1. Check if the "Logout" button was just pressed. 
    // If yes, do nothing here (let auth.js handle the redirect to home)
    if (localStorage.getItem('isLoggingOut') === 'true') {
        return; 
    }

    // 2. If they are NOT logging out, they shouldn't be here. 
    // Redirect them to login immediately.
    window.location.href = "login.html";
  }
});

// --- LOAD ORDERS (Kept from previous step) ---
async function loadOrders(userId) {
  // ... (Your existing loadOrders code here - no changes needed) ...
  // If you need me to paste it again, let me know, otherwise keep the one from before!
  // I'll assume you kept the previous working version of this function.
  try {
    const q = query(collection(db, "orders"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      ordersContainer.innerHTML = '<p style="color:#ccc;">No orders yet.</p>';
      return;
    }

    ordersContainer.innerHTML = ''; 
    querySnapshot.forEach((doc) => {
       const order = doc.data();
       const total = order.totalAmount || "0.00";
       const status = order.status || "Processing";
       // Simplified Order Card for brevity
       const html = `
        <div class="order-card" style="background:#222; padding:15px; margin-bottom:10px; border-left:4px solid #e10600; border-radius:8px;">
           <div style="display:flex; justify-content:space-between; color:#fff; font-weight:bold;">
             <span>Order #${doc.id.slice(0,6)}</span>
             <span style="color:#e10600">${status}</span>
           </div>
           <p style="color:#aaa; font-size:0.9rem; margin-top:5px;">Total: $${total}</p>
        </div>`;
       ordersContainer.innerHTML += html;
    });
  } catch (e) { console.error(e); }
}

// --- NEW: LOAD REVIEWS ---
async function loadMyReviews(userId) {
  try {
    const q = query(collection(db, "reviews"), where("userId", "==", userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      reviewsContainer.innerHTML = '<p style="color:#ccc;">You haven\'t rated any products yet.</p>';
      return;
    }

    reviewsContainer.innerHTML = '';

    snapshot.forEach(doc => {
      const review = doc.data();
      // Generate Stars String (e.g., "★★★★☆")
      const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
      
      const html = `
        <div class="review-item" onclick="location.href='product-details.html?id=${review.productId}'">
          <img src="${review.productImage || 'https://via.placeholder.com/60'}" alt="Product">
          <div class="review-info">
            <h4 style="color:#fff; margin-bottom:5px;">${review.productTitle || 'Product'}</h4>
            <span style="color:#ffd700; font-size:1.1rem;">${stars}</span>
          </div>
        </div>
      `;
      reviewsContainer.innerHTML += html;
    });

  } catch (error) {
    console.error("Error loading reviews:", error);
    reviewsContainer.innerHTML = '<p style="color:red;">Error loading reviews.</p>';
  }
}