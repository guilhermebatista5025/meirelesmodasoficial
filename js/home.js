// ==========================================
// PÁGINA INICIAL (HOME)
// ==========================================
function initHomePage() {
  renderHomeProducts();
}

function renderHomeProducts() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  grid.innerHTML = "";

  // Mostra apenas os 4 primeiros produtos (Destaques / Lançamentos) na home
  const featured = PRODUCTS.slice(0, 4);

  featured.forEach(prod => {
    const card = document.createElement("div");
    card.className = "product-card";

    let badgeHtml = "";
    if (prod.badge) {
      badgeHtml = `<span class="product-badge ${prod.badgeClass}">${prod.badge}</span>`;
    }

    card.innerHTML = `
      ${badgeHtml}
      <div class="product-img-wrap" onclick="window.location.href='pages/produto.html?id=${prod.id}'">
        <img class="product-img img-front" src="${pathPrefix}${prod.image}" alt="${prod.name}" loading="lazy">
        <img class="product-img img-back" src="${pathPrefix}${prod.imageBack}" alt="${prod.name} (Verso)" loading="lazy">
        <div class="product-overlay">
          <span class="btn-quick-view" onclick="event.stopPropagation(); openQuickView(${prod.id});">
            <i class="ri-eye-line"></i> Ver Detalhes
          </span>
        </div>
      </div>
      <div class="product-details">
        <span class="product-cat">${prod.category === 'times' ? 'Camisas de Time' : prod.category === 'streetwear' ? 'Streetwear' : 'Moda Casual'}</span>
        <h3 class="product-title" onclick="window.location.href='pages/produto.html?id=${prod.id}'" style="cursor:pointer;">${prod.name}</h3>
        <div class="product-price-row">
          <div class="price-box">
            <span class="price-old">R$ ${prod.oldPrice.toFixed(2).replace('.', ',')}</span>
            <span class="price-current">R$ ${prod.price.toFixed(2).replace('.', ',')}</span>
          </div>
          <button class="btn-add-fast" onclick="fastAddToCart(${prod.id})" aria-label="Adicionar ao carrinho">
            <i class="ri-add-line"></i>
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}
