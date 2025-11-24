import { db, collection, addDoc, auth, onAuthStateChanged, doc, getDoc } from "./firebase-config.js";

const productForm = document.getElementById('add-product-form');

// 1. STRICT SECURITY CHECK: User must be logged in AND be an admin
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Case 1: Not logged in at all
    alert("You must be logged in to access the admin panel.");
    window.location.href = "login.html";
  } else {
    // Case 2: Logged in, but are they an admin?
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userDocRef);

      // Check if document exists AND the role is exactly 'admin'
      if (!userSnapshot.exists() || userSnapshot.data().role !== 'admin') {
        alert("ACCESS DENIED: You do not have permission to view this page.");
        window.location.href = "index.html"; // Kick them back to home
      } 
      // If they ARE admin, do nothing (let them stay on the page)
      
    } catch (error) {
      console.error("Security check failed:", error);
      alert("Error verifying permissions.");
      window.location.href = "index.html";
    }
  }
});

// 2. Handle the "Add Product" form submission
productForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Stop the page from reloading

  // Get values from the inputs
  const title = document.getElementById('product-title').value;
  const price = parseFloat(document.getElementById('product-price').value);
  const image = document.getElementById('product-image').value;
  const description = document.getElementById('product-desc').value;

  try {
    // Add a new document to the "products" collection in Firestore
    const docRef = await addDoc(collection(db, "products"), {
      title: title,
      price: price,
      image: image,
      description: description,
      createdAt: new Date() // Timestamp is useful for sorting later
    });

    console.log("Document written with ID: ", docRef.id);
    alert("Product added successfully!");
    
    // Clear the form
    productForm.reset();
    
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Error adding product: " + error.message);
  }
});