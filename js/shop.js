import { createProductCard } from "./utils.js";
import { db, collection, getDocs } from "./firebase-config.js";

const productGrid = document.querySelector('.product-grid');

async function loadProducts() {
  productGrid.innerHTML = '<p style="color:#fff; text-align:center;">Loading products...</p>';

  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    
    if (querySnapshot.empty) {
      productGrid.innerHTML = '<p style="color:#fff; text-align:center;">No products found in the catalog.</p>';
      return;
    }

    productGrid.innerHTML = '';

    querySnapshot.forEach((doc) => {
      const product = doc.data();
      const productId = doc.id; 
      productGrid.innerHTML += createProductCard(product, productId);
    });

  } catch (error) {
    console.error("Error loading products:", error);
    productGrid.innerHTML = '<p style="color:red; text-align:center;">Error loading products. Please try again later.</p>';
  }
}

loadProducts();