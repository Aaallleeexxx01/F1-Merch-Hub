import { createProductCard } from "./utils.js";
import { db, collection, getDocs, query, orderBy, limit } from "./firebase-config.js";

const featuredGrid = document.querySelector('.product-grid');

async function loadFeaturedProducts() {
  featuredGrid.innerHTML = '<p style="color:#fff; text-align:center;">Loading latest gear...</p>';

  try {
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

    featuredGrid.innerHTML = ''; 

    querySnapshot.forEach((doc) => {
      const product = doc.data();
      const productId = doc.id;
      featuredGrid.innerHTML += createProductCard(product, productId);
    });

  } catch (error) {
    console.error("Error loading featured items:", error);
    featuredGrid.innerHTML = '<p>Check out our full catalog in the Shop!</p>';
  }
}

loadFeaturedProducts();