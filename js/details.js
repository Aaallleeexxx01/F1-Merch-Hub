import { db, doc, getDoc, deleteDoc, updateDoc, setDoc, collection, query, where, getDocs, auth, onAuthStateChanged } from "./firebase-config.js";
import { addToCart } from "./cart.js";

const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

// UI Elements
const imgEl = document.getElementById('detail-img');
const titleEl = document.getElementById('detail-title');
const priceEl = document.getElementById('detail-price');
const descEl = document.getElementById('detail-desc');
const adminControls = document.getElementById('admin-controls');
const starBox = document.getElementById('star-box');
const avgDisplay = document.querySelector('#avg-display span');
const rateMsg = document.getElementById('rate-msg');

let currentProduct = {}; // Store product data for the review

// 1. LOAD PRODUCT DATA
async function loadProductDetails() {
  if (!productId) return window.location.href = "shop.html";

  try {
    const docSnap = await getDoc(doc(db, "products", productId));

    if (docSnap.exists()) {
      currentProduct = docSnap.data();
      currentProduct.id = docSnap.id;

      imgEl.src = currentProduct.image;
      titleEl.textContent = currentProduct.title;
      priceEl.textContent = `$${currentProduct.price}`;
      descEl.textContent = currentProduct.description;

      setupAddToCart(currentProduct);
      setupAdminControls();
      
      // Load Ratings Logic
      loadRatings(); 
      checkUserRating();

    } else {
      titleEl.textContent = "Product not found";
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// 2. SETUP STAR LISTENERS
function setupStarListeners() {
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => {
    star.addEventListener('click', async () => {
      const user = auth.currentUser;
      if (!user) {
        alert("Please login to rate products.");
        window.location.href = "login.html";
        return;
      }

      const rating = parseInt(star.dataset.value);
      await submitRating(user, rating);
    });
  });
}

// 3. SUBMIT RATING (One per user logic)
async function submitRating(user, rating) {
  try {
    // Composite ID: userId_productId ensures uniqueness
    const reviewId = `${user.uid}_${productId}`;
    
    await setDoc(doc(db, "reviews", reviewId), {
      userId: user.uid,
      productId: productId,
      rating: rating,
      // Save snapshot of product info for the Profile page
      productTitle: currentProduct.title,
      productImage: currentProduct.image,
      createdAt: new Date()
    });

    alert(`You rated this ${rating} stars!`);
    highlightStars(rating); // Update UI visually
    loadRatings(); // Recalculate average immediately
  } catch (error) {
    console.error("Rating error:", error);
    alert("Error saving rating.");
  }
}

// 4. CHECK IF USER ALREADY RATED
function checkUserRating() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const reviewId = `${user.uid}_${productId}`;
      const docSnap = await getDoc(doc(db, "reviews", reviewId));
      if (docSnap.exists()) {
        const myRating = docSnap.data().rating;
        highlightStars(myRating);
        rateMsg.textContent = `You rated this ${myRating} stars`;
      }
    }
  });
}

// 5. CALCULATE AVERAGE
async function loadRatings() {
  const q = query(collection(db, "reviews"), where("productId", "==", productId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    avgDisplay.textContent = "--";
    return;
  }

  let total = 0;
  snapshot.forEach(doc => total += doc.data().rating);
  const avg = (total / snapshot.size).toFixed(1);
  
  avgDisplay.textContent = avg;
}

// Helper: Visually select stars
function highlightStars(rating) {
  const stars = document.querySelectorAll('.star');
  stars.forEach(s => {
    // row-reverse logic: Highlight stars with value <= rating
    if (parseInt(s.dataset.value) <= rating) {
      s.style.color = "#ffd700";
    } else {
      s.style.color = "#555";
    }
  });
}

// --- STANDARD HELPERS ---
function setupAddToCart(product) {
  const btn = document.querySelector('.add-cart-btn');
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  newBtn.addEventListener('click', () => {
    if (!auth.currentUser) {
      alert("Please login to add items to your cart.");
      window.location.href = "login.html"; // Redirects them to login
      return;
    }

    addToCart(product);
  });
}

function setupAdminControls() {
  if (localStorage.getItem('isAdmin') === 'true') {
    adminControls.innerHTML = `
      <button id="edit-btn" style="background:#333; color:#fff; padding:10px; margin-right:10px;">Edit</button>
      <button id="delete-btn" style="background:#e10600; color:#fff; padding:10px;">Delete</button>
    `;
    document.getElementById('delete-btn').addEventListener('click', async () => {
      if(confirm("Delete?")) {
        await deleteDoc(doc(db, "products", productId));
        window.location.href = "shop.html";
      }
    });
    // Edit logic (simplified)
    document.getElementById('edit-btn').addEventListener('click', async () => {
       const newPrice = prompt("New Price:", currentProduct.price);
       if(newPrice) {
         await updateDoc(doc(db, "products", productId), { price: parseFloat(newPrice) });
         location.reload();
       }
    });
  }
}

// Init
setupStarListeners();
loadProductDetails();