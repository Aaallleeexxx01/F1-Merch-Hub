import { db, collection, getDocs } from "./firebase-config.js";

const productGrid = document.querySelector('.product-grid');

// Function to fetch and display products
async function loadProducts() {
  // 1. Clear the grid (remove any loading text or hardcoded items)
  productGrid.innerHTML = '<p style="color:#fff; text-align:center;">Loading products...</p>';

  try {
    // 2. Fetch data from Firestore
    const querySnapshot = await getDocs(collection(db, "products"));
    
    // 3. Check if we found anything
    if (querySnapshot.empty) {
      productGrid.innerHTML = '<p style="color:#fff; text-align:center;">No products found in the catalog.</p>';
      return;
    }

    // 4. Clear the "Loading..." text
    productGrid.innerHTML = '';

    // 5. Loop through each product and create the HTML card
    querySnapshot.forEach((doc) => {
      const product = doc.data();
      const productId = doc.id; // We will need this next week for the details page

      // Create the HTML string for one card
      const productHTML = `
        <div class="product-card" onclick="location.href='product-details.html?id=${productId}'" style="cursor: pointer;">
          <img src="${product.image}" alt="${product.title}">
          <h3>${product.title}</h3>
          <p>${product.description.substring(0, 50)}...</p> <div class="price">$${product.price}</div>
        </div>
      `;

      // Add it to the grid
      productGrid.innerHTML += productHTML;
    });

  } catch (error) {
    console.error("Error loading products:", error);
    productGrid.innerHTML = '<p style="color:red; text-align:center;">Error loading products. Please try again later.</p>';
  }
}

// Run the function when the page loads
loadProducts();