import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, doc, getDoc } from "./firebase-config.js";

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout-btn');
const navLogin = document.getElementById('nav-login');
const navProfile = document.getElementById('nav-profile');
const navAdmin = document.getElementById('nav-admin');

// --- 1. SIGN UP LOGIC ---
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created! Redirecting...");
      window.location.href = "profile.html";
    } catch (error) {
      alert("Error signing up: " + error.message);
    }
  });
}

// --- 2. LOGIN LOGIC ---
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "profile.html";
    } catch (error) {
      alert("Invalid email or password.");
    }
  });
}

// --- 3. LOGOUT LOGIC (THIS WAS MISSING!) ---
if (logoutBtn) {
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      // Clear all memory on logout
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('isAdmin'); 
      alert("Logged out successfully.");
      window.location.href = "index.html";
    } catch (error) {
      console.error("Logout error", error);
    }
  });
}

// --- 4. AUTH STATE OBSERVER ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in
    localStorage.setItem('isLoggedIn', 'true');
    if (navLogin) navLogin.style.display = 'none';
    if (navProfile) navProfile.style.display = 'inline-block';
    
    const profileEmail = document.getElementById('profile-email');
    if (profileEmail) profileEmail.textContent = user.email;

    // CHECK ADMIN ROLE
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists() && userSnapshot.data().role === 'admin') {
        // SAVE ADMIN STATUS TO MEMORY
        localStorage.setItem('isAdmin', 'true'); 
        if (navAdmin) navAdmin.style.display = 'inline-block';
      } else {
        localStorage.removeItem('isAdmin'); // Not admin? Clear it.
        if (navAdmin) navAdmin.style.display = 'none';
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
    }

  } else {
    // User is signed out
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin'); // Clear admin memory
    if (navLogin) navLogin.style.display = 'inline-block';
    if (navProfile) navProfile.style.display = 'none';
    if (navAdmin) navAdmin.style.display = 'none';
  }
});