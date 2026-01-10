import { db, collection, addDoc } from "./firebase-config.js";
import { requireAdmin } from "./auth.js"; // Import the security check

// 1. Run Security Check
requireAdmin(); 

const productForm = document.getElementById('add-product-form');

// 2. Handle Form
if (productForm) {
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('product-title').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const image = document.getElementById('product-image').value;
    const description = document.getElementById('product-desc').value;

    try {
      await addDoc(collection(db, "products"), {
        title, price, image, description,
        createdAt: new Date()
      });
      alert("Product added!");
      productForm.reset();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add product.");
    }
  });
}