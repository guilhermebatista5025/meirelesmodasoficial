// ==========================================
// PÁGINA DE CATÁLOGO (LOJA)
// ==========================================
let activeLojaCategory = "all";
let activeLojaSearch = "";
let activeLojaSort = "default";

function initLojaPage() {
  renderLojaProducts();
  setupLojaEventListeners();
}

function setupLojaEventListeners() {
  // Filtros de Categoria (tanto na barra lateral quanto nas abas horizontais)
  const sidebarLinks = document.querySelectorAll(".sidebar-link, .filter-btn");
  sidebarLinks.forEach(link => {
    link.addEventListener("click", () => {
      sidebarLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      activeLojaCategory = link.getAttribute("data-category");
      renderLojaProducts();
    });
  });

  // Busca do catálogo
  const searchInput = document.getElementById("loja-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      activeLojaSearch = e.target.value;
      renderLojaProducts();
    });
  }

  // Ordenação do catálogo
  const sortSelect = document.getElementById("loja-sort");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      activeLojaSort = e.target.value;
      renderLojaProducts();
    });
  }
}

function renderLojaProducts() {
  const grid = document.getElementById("loja-products-grid");
  if (!grid) return;

  grid.innerHTML = "";

  // Filtragem
  let filtered = PRODUCTS.filter(prod => {
    const matchesCategory = activeLojaCategory === "all" || prod.category === activeLojaCategory;
    const matchesSearch = prod.name.toLowerCase().includes(activeLojaSearch.toLowerCase()) || 
                          prod.description.toLowerCase().includes(activeLojaSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Ordenação
  if (activeLojaSort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (activeLojaSort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (activeLojaSort === "alpha") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Verificar se está vazio
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
        <i class="ri-search-line" style="font-size: 3rem; color: var(--text-muted); display: block; margin-bottom: 16px;"></i>
        <h3 style="font-size: 1.25rem; font-weight: 700;">Nenhum produto encontrado</h3>
        <p style="margin-top: 8px;">Tente ajustar seus filtros de pesquisa.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(prod => {
    const card = document.createElement("div");
    card.className = "product-card";

    let badgeHtml = "";
    if (prod.badge) {
      badgeHtml = `<span class="product-badge ${prod.badgeClass}">${prod.badge}</span>`;
    }

    card.innerHTML = `
      ${badgeHtml}
      <div class="product-img-wrap" onclick="window.location.href='produto.html?id=${prod.id}'">
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
        <h3 class="product-title" onclick="window.location.href='produto.html?id=${prod.id}'" style="cursor:pointer;">${prod.name}</h3>
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
