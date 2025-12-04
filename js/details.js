import { db, doc, getDoc, deleteDoc, updateDoc } from "./firebase-config.js";

// 1. Get the Product ID from the URL (e.g., product-details.html?id=12345)
const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

const imgEl = document.getElementById('detail-img');
const titleEl = document.getElementById('detail-title');
const priceEl = document.getElementById('detail-price');
const descEl = document.getElementById('detail-desc');
const adminControls = document.getElementById('admin-controls'); // We will add this container in HTML

async function loadProductDetails() {
  if (!productId) {
    window.location.href = "shop.html"; // No ID? Go back to shop
    return;
  }

  try {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const product = docSnap.data();

      // Display Data
      imgEl.src = product.image;
      titleEl.textContent = product.title;
      priceEl.textContent = `$${product.price}`;
      descEl.textContent = product.description;

      // === CHECK IF ADMIN ===
      const isAdmin = localStorage.getItem('isAdmin');
      if (isAdmin === 'true') {
        // Show Admin Buttons
        adminControls.innerHTML = `
          <button id="edit-btn" style="background-color: #333; color: #fff; margin-right: 10px;">Edit Product</button>
          <button id="delete-btn" style="background-color: #e10600; color: #fff;">Delete Product</button>
        `;
        
        // Attach Listeners
        document.getElementById('delete-btn').addEventListener('click', deleteProduct);
        document.getElementById('edit-btn').addEventListener('click', () => editProduct(product));
      }

    } else {
      titleEl.textContent = "Product not found";
    }
  } catch (error) {
    console.error("Error loading details:", error);
  }
}

// --- DELETE FUNCTION ---
async function deleteProduct() {
  if (confirm("Are you sure you want to delete this product? This cannot be undone.")) {
    try {
      await deleteDoc(doc(db, "products", productId));
      alert("Product deleted!");
      window.location.href = "shop.html";
    } catch (error) {
      alert("Error deleting: " + error.message);
    }
  }
}

// --- EDIT FUNCTION (Simple Prompt Version) ---
async function editProduct(currentProduct) {
  // Simple prompts for quick editing. For a pro version, we'd use a modal form.
  const newTitle = prompt("Edit Title:", currentProduct.title);
  const newPrice = prompt("Edit Price:", currentProduct.price);
  const newDesc = prompt("Edit Description:", currentProduct.description);

  if (newTitle && newPrice && newDesc) {
    try {
      await updateDoc(doc(db, "products", productId), {
        title: newTitle,
        price: parseFloat(newPrice),
        description: newDesc
      });
      alert("Product updated!");
      location.reload(); // Refresh to see changes
    } catch (error) {
      alert("Error updating: " + error.message);
    }
  }
}

loadProductDetails();