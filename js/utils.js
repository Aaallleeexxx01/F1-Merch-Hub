export function createProductCard(product, productId) {
  return `
    <div class="product-card" onclick="location.href='product-details.html?id=${productId}'" style="cursor: pointer;">
      <img src="${product.image}" alt="${product.title}" />
      <h3>${product.title}</h3>
      <p>${product.description.substring(0, 45)}...</p> 
      <div class="price">$${product.price}</div>
    </div>
  `;
}