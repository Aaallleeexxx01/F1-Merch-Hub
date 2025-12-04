import { db, collection, getDocs, query, orderBy, limit } from "./firebase-config.js";

const featuredGrid = document.querySelector('.product-grid');

async function loadFeaturedProducts() {
  featuredGrid.innerHTML = '<p style="color:#fff; text-align:center;">Loading latest gear...</p>';

  try {
    // QUERY: Get products, Sort by 'createdAt' (newest first), Stop after 3
    const q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc"), 
      limit(3)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      featuredGrid.innerHTML = '<p>No featured products yet.</p>';
      return;
    }

    featuredGrid.innerHTML = ''; // Clear loading text

    querySnapshot.forEach((doc) => {
      const product = doc.data();
      const productId = doc.id;

      // Create simple card
      const html = `
        <div class="product" onclick="location.href='product-details.html?id=${productId}'" style="cursor: pointer;">
          <img src="${product.image}" alt="${product.title}" />
          <h3>${product.title}</h3>
          <p>${product.description.substring(0, 40)}...</p>
          <div class="price">$${product.price}</div>
        </div>
      `;
      featuredGrid.innerHTML += html;
    });

  } catch (error) {
    console.error("Error loading featured items:", error);
    // Fallback if index is missing or error occurs
    featuredGrid.innerHTML = '<p>Check out our full catalog in the Shop!</p>';
  }
}

loadFeaturedProducts();