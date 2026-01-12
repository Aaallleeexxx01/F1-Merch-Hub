import { loadUserCart } from "./cart.js";
import { auth, db, doc, getDoc, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "./firebase-config.js";

// --- 1. CONFIGURATION ---
const navLinks = [
  { name: 'Home', href: 'index.html' },
  { name: 'Shop', href: 'shop.html' },
  { name: 'Cart', href: 'cart.html', id: 'nav-cart', protected: true },
  { name: 'Admin', href: 'admin.html', id: 'nav-admin', protected: true, adminOnly: true },
  { name: 'Profile', href: 'profile.html', id: 'nav-profile', protected: true },
  { name: 'Login', href: 'login.html', id: 'nav-login', guestOnly: true }
];

// --- 2. NAVBAR GENERATOR (Run immediately) ---
function renderNavbar() {
  localStorage.removeItem('isLoggingOut'); 
  const header = document.querySelector('header');
  if (!header) return;

  // Prevent duplicate rendering
  if (document.querySelector('nav')) return;

  const nav = document.createElement('nav');
  
  // Get current page for "active" class
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(link => {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.name;
    if (link.id) a.id = link.id;
    
    // Highlight active page
    if (currentPage === link.href) a.classList.add('active');

    // Initial Visibility Check (Anti-Flicker Logic)
    // We set display based on localStorage immediately as we create the element
    const isLogged = localStorage.getItem('isLoggedIn') === 'true';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (link.protected && !isLogged) a.style.display = 'none';
    if (link.adminOnly && !isAdmin) a.style.display = 'none';
    if (link.guestOnly && isLogged) a.style.display = 'none';

    nav.appendChild(a);
  });

  // Append Logout Button (Hidden by default)
  const logoutBtn = document.createElement('a');
  logoutBtn.href = "#";
  logoutBtn.id = "logout-btn";
  logoutBtn.textContent = "Logout";
  logoutBtn.style.display = localStorage.getItem('isLoggedIn') === 'true' ? 'inline-block' : 'none';
  
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // 1. Set the flag to prevent the race condition glitch
    localStorage.setItem('isLoggingOut', 'true');

    // 2. Clear the "Display Cart" from the browser
    // (Your real cart is safe in the database now!)
    localStorage.removeItem('f1-cart'); 

    // 3. Sign out of Firebase
    await signOut(auth);
    
    // 4. Clear local session helpers
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');

    alert("Logged out successfully.");

    // 5. REDIRECT TO HOME
    window.location.href = "index.html";
  });

  nav.appendChild(logoutBtn);
  header.appendChild(nav);
}

// Call immediately to render nav as soon as this script loads
renderNavbar();

function renderFooter() {
  // Check if a footer already exists to prevent duplicates
  if (document.querySelector('footer')) return;

  const footer = document.createElement('footer');
  const year = new Date().getFullYear(); // Dynamic year
  
  footer.innerHTML = `
    <p>&copy; ${year} F1 Merch Hub. All rights reserved.</p>
  `;
  
  document.body.appendChild(footer);
}

// Call it immediately
renderFooter();

// --- 3. AUTH STATE OBSERVER (The Source of Truth) ---
onAuthStateChanged(auth, async (user) => {
  const navProfile = document.getElementById('nav-profile');
  const navLogin = document.getElementById('nav-login');
  const navAdmin = document.getElementById('nav-admin');
  const logoutBtn = document.getElementById('logout-btn');

  if (user) {
    localStorage.setItem('isLoggedIn', 'true');
    await loadUserCart(user.uid);
    
    // Check Admin Role
    let role = 'user';
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        role = userDoc.data().role || 'user';
      }
    } catch (e) {
      console.error("Error fetching role", e);
    }

    if (role === 'admin') localStorage.setItem('isAdmin', 'true');
    else localStorage.removeItem('isAdmin');

    // Update UI
    if (navLogin) navLogin.style.display = 'none';
    if (navProfile) navProfile.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    if (navAdmin) navAdmin.style.display = (role === 'admin') ? 'inline-block' : 'none';

  } else {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');

    // Update UI
    if (navLogin) navLogin.style.display = 'inline-block';
    if (navProfile) navProfile.style.display = 'none';
    if (navAdmin) navAdmin.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
});

// --- 4. EXPORTED SECURITY CHECK ---
// Use this in admin.js to protect the page
export async function requireAdmin() {
  const user = auth.currentUser;
  
  // Wait a moment if auth isn't ready, or check localStorage as a fast fail
  if (localStorage.getItem('isAdmin') !== 'true') {
     alert("Access Denied: Admins only.");
     window.location.href = "index.html";
     return false;
  }
  return true;
}

export function requireLogin() {
  if (localStorage.getItem('isLoggedIn') !== 'true') {
     // Optional: Alert the user
     alert("Please login to access this page.");
     window.location.href = "login.html";
     return false;
  }
  return true;
}

// --- 5. FORM HANDLERS (Login/Signup) ---
// Kept here so you don't need separate scripts for login/signup pages
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "profile.html";
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  });
}

const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('confirm-password').value;
    
    if (password !== confirm) return alert("Passwords don't match");

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      // Create user doc in Firestore (optional but good practice)
      // await setDoc(doc(db, "users", userCred.user.uid), { role: 'user' });
      alert("Account created!");
      window.location.href = "profile.html";
    } catch (error) {
      alert("Error: " + error.message);
    }
  });
}