import { db, collection, addDoc, auth, onAuthStateChanged, doc, getDoc } from "./firebase-config.js";
const productForm = document.getElementById('add-product-form');

// 1. Check if user is logged in. If not, kick them out.
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("You must be logged in to access the admin panel.");
    window.location.href = "login.html";
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