// ==========================================
// ESTADO GLOBAL DO CARRINHO (LocalStorage)
// ==========================================
let cart = JSON.parse(localStorage.getItem("meireles_cart")) || [];

// ==========================================
// CONFIGURAÇÕES GERAIS DO WHATSAPP
// ==========================================
const WHATSAPP_PHONE = "5585999998888"; 

// ==========================================
// INICIALIZAÇÃO E EVENTOS DOM
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  updateCartUI();
  setupGlobalEventListeners();
  
  // Detecção automática de qual página está ativa para inicializar lógica específica
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1);

  if (page === "index.html" || page === "") {
    initHomePage();
  } else if (page === "loja.html") {
    initLojaPage();
  } else if (page === "produto.html") {
    initProdutoDetailPage();
  } else if (page === "checkout.html") {
    initCheckoutPage();
  }
});

// ==========================================
// CONFIGURAÇÃO DOS EVENTOS GLOBAIS
// ==========================================
function setupGlobalEventListeners() {
  // Abrir e Fechar Carrinho Lateral
  const cartToggle = document.getElementById("cart-toggle");
  const closeCartBtn = document.getElementById("close-cart");
  const cartOverlay = document.getElementById("cart-overlay");

  if (cartToggle) cartToggle.addEventListener("click", openCart);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

  // Abrir e Fechar Menu Mobile
  const menuToggle = document.getElementById("mobile-menu-toggle");
  const closeMenuBtn = document.getElementById("btn-close-menu");
  const menuOverlay = document.getElementById("mobile-menu-overlay");

  if (menuToggle) menuToggle.addEventListener("click", openMobileMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener("click", closeMobileMenu);
  if (menuOverlay) menuOverlay.addEventListener("click", closeMobileMenu);

  // Lógica do Modal Quick View
  const closeQv = document.getElementById("close-quickview");
  const qvOverlay = document.getElementById("quickview-overlay");
  
  if (closeQv) closeQv.addEventListener("click", closeQuickView);
  if (qvOverlay) {
    qvOverlay.addEventListener("click", (e) => {
      if (e.target === qvOverlay) closeQuickView();
    });
  }

  const qvQtyInput = document.getElementById("qv-qty");
  const qvQtyDec = document.getElementById("qv-qty-dec");
  const qvQtyInc = document.getElementById("qv-qty-inc");

  if (qvQtyInput && qvQtyDec && qvQtyInc) {
    qvQtyDec.addEventListener("click", () => {
      let val = parseInt(qvQtyInput.value) || 1;
      if (val > 1) qvQtyInput.value = val - 1;
    });
    qvQtyInc.addEventListener("click", () => {
      let val = parseInt(qvQtyInput.value) || 1;
      qvQtyInput.value = val + 1;
    });
  }

  const qvAddBtn = document.getElementById("qv-add-btn");
  if (qvAddBtn) {
    qvAddBtn.addEventListener("click", () => {
      if (currentQvProductId) {
        const qty = parseInt(qvQtyInput.value) || 1;
        addToCart(currentQvProductId, currentQvSelectedSize, qty);
        closeQuickView();
      }
    });
  }
}

// ==========================================
// CONTROLE DE TEMA (CLARO/ESCURO)
// ==========================================
function initTheme() {
  // O tema da loja é exclusivamente Escuro (Dark Mode) por padrão
  document.documentElement.setAttribute("data-theme", "dark");
}

// ==========================================
// CONTROLE DO MENU MOBILE (DRAWER)
// ==========================================
function openMobileMenu() {
  const drawer = document.getElementById("mobile-menu-drawer");
  const overlay = document.getElementById("mobile-menu-overlay");
  if (drawer && overlay) {
    drawer.classList.add("open");
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function closeMobileMenu() {
  const drawer = document.getElementById("mobile-menu-drawer");
  const overlay = document.getElementById("mobile-menu-overlay");
  if (drawer && overlay) {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
}

// ==========================================
// GESTÃO DO CARRINHO (LÓGICA E UI)
// ==========================================
function openCart() {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");
  if (drawer && overlay) {
    drawer.classList.add("open");
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function closeCart() {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");
  if (drawer && overlay) {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
}

function updateCartUI() {
  const cartList = document.getElementById("cart-items-list");
  const cartEmpty = document.getElementById("cart-empty");
  const subtotalVal = document.getElementById("subtotal-value");
  const totalVal = document.getElementById("total-value");
  const cartBadgeCount = document.getElementById("cart-badge-count");
  const checkoutBtn = document.getElementById("btn-checkout");
  const deliverySection = document.getElementById("cart-delivery-section");

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  if (cartBadgeCount) {
    cartBadgeCount.textContent = totalItemsCount;
    cartBadgeCount.style.display = totalItemsCount > 0 ? "flex" : "none";
  }

  if (!cartList) return; // Se a página não tiver cart drawer rendering

  if (cart.length === 0) {
    cartList.innerHTML = "";
    cartEmpty.style.display = "flex";
    if (deliverySection) deliverySection.style.display = "none";
    if (subtotalVal) subtotalVal.textContent = "R$ 0,00";
    if (totalVal) totalVal.textContent = "R$ 0,00";
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = 0.5;
    }
    return;
  }

  cartEmpty.style.display = "none";
  if (deliverySection) deliverySection.style.display = "block";
  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.style.opacity = 1;
  }
  cartList.innerHTML = "";

  let subtotal = 0;

  cart.forEach((item, index) => {
    const prodPrice = item.price * item.quantity;
    subtotal += prodPrice;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <div class="cart-item-img-wrap">
        <img class="cart-item-img" src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-info">
        <h4 class="cart-item-title">${item.name}</h4>
        <div class="cart-item-meta">
          <span>Tam: <span>${item.size}</span></span>
        </div>
        <div class="cart-item-controls">
          <div class="qty-control">
            <button class="qty-btn" onclick="adjustQuantity(${index}, -1)" aria-label="Diminuir">
              <i class="ri-subtract-line"></i>
            </button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn" onclick="adjustQuantity(${index}, 1)" aria-label="Aumentar">
              <i class="ri-add-line"></i>
            </button>
          </div>
          <span class="cart-item-price">R$ ${prodPrice.toFixed(2).replace('.', ',')}</span>
          <button class="btn-remove-item" onclick="removeFromCart(${index})" aria-label="Remover produto">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
    `;
    cartList.appendChild(cartItem);
  });

  const isFreeShipping = subtotal >= 250;
  const shippingCost = isFreeShipping ? 0 : 15.00;
  const total = subtotal + shippingCost;

  const shippingElement = document.getElementById("shipping-value");
  if (shippingElement) {
    shippingElement.textContent = isFreeShipping ? "GRÁTIS" : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`;
    shippingElement.style.color = isFreeShipping ? "var(--brand-green)" : "";
  }

  if (subtotalVal) subtotalVal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
  if (totalVal) totalVal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

  // Persistir estado do carrinho no localStorage
  localStorage.setItem("meireles_cart", JSON.stringify(cart));
}

function addToCart(productId, size, quantity) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingItemIndex = cart.findIndex(item => item.id === productId && item.size === size);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: size,
      quantity: quantity
    });
  }

  updateCartUI();
  openCart();
}

function fastAddToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const size = product.sizes.includes("M") ? "M" : product.sizes[0];
  addToCart(productId, size, 1);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function adjustQuantity(index, amount) {
  const newQty = cart[index].quantity + amount;
  if (newQty > 0) {
    cart[index].quantity = newQty;
  } else {
    cart.splice(index, 1);
  }
  updateCartUI();
}

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
      <div class="product-img-wrap" onclick="window.location.href='produto.html?id=${prod.id}'">
        <img class="product-img img-front" src="${prod.image}" alt="${prod.name}" loading="lazy">
        <img class="product-img img-back" src="${prod.imageBack}" alt="${prod.name} (Verso)" loading="lazy">
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
        <img class="product-img img-front" src="${prod.image}" alt="${prod.name}" loading="lazy">
        <img class="product-img img-back" src="${prod.imageBack}" alt="${prod.name} (Verso)" loading="lazy">
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

// ==========================================
// PÁGINA DE DETALHES DO PRODUTO
// ==========================================
let currentDetailSelectedSize = "";
let currentDetailSelectedImage = "";

function initProdutoDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get("id")) || 1;

  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) {
    window.location.href = "loja.html";
    return;
  }

  // Preencher dados na tela
  const titleVal = product.name;
  const catVal = product.category === 'times' ? 'Camisas de Time' : product.category === 'streetwear' ? 'Streetwear' : 'Moda Casual';
  const priceVal = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
  const oldPriceVal = `R$ ${product.oldPrice.toFixed(2).replace('.', ',')}`;

  // Preencher Desktop
  const dTitle = document.getElementById("prod-title");
  if (dTitle) dTitle.textContent = titleVal;
  const dCat = document.getElementById("prod-category");
  if (dCat) dCat.textContent = catVal;
  const dPrice = document.getElementById("prod-price");
  if (dPrice) dPrice.textContent = priceVal;
  const dOldPrice = document.getElementById("prod-old-price");
  if (dOldPrice) dOldPrice.textContent = oldPriceVal;

  // Preencher Mobile
  const mTitle = document.getElementById("prod-title-mobile");
  if (mTitle) mTitle.textContent = titleVal;
  const mCat = document.getElementById("prod-category-mobile");
  if (mCat) mCat.textContent = catVal;
  const mPrice = document.getElementById("prod-price-mobile");
  if (mPrice) mPrice.textContent = priceVal;
  const mOldPrice = document.getElementById("prod-old-price-mobile");
  if (mOldPrice) mOldPrice.textContent = oldPriceVal;

  document.getElementById("prod-description").textContent = product.description;
  
  // Imagem Principal e Miniaturas
  const mainImg = document.getElementById("prod-main-img");
  mainImg.src = product.image;
  currentDetailSelectedImage = product.image;

  const thumbsContainer = document.getElementById("prod-thumbnails");
  if (thumbsContainer) {
    thumbsContainer.innerHTML = `
      <button class="thumbnail-btn active" onclick="setMainDetailImage('${product.image}', this)">
        <img src="${product.image}" alt="Frente do produto">
      </button>
      <button class="thumbnail-btn" onclick="setMainDetailImage('${product.imageBack}', this)">
        <img src="${product.imageBack}" alt="Costas do produto">
      </button>
    `;
  }

  // Configurar Seletor de Tamanhos
  currentDetailSelectedSize = product.sizes[0];
  const sizeContainer = document.getElementById("prod-sizes");
  if (sizeContainer) {
    sizeContainer.innerHTML = "";
    product.sizes.forEach(size => {
      const btn = document.createElement("button");
      btn.className = `size-pill ${size === currentDetailSelectedSize ? 'active' : ''}`;
      btn.textContent = size;
      btn.addEventListener("click", () => {
        sizeContainer.querySelectorAll(".size-pill").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        currentDetailSelectedSize = size;
      });
      sizeContainer.appendChild(btn);
    });
  }

  // Lógica dos botões de Quantidade na página
  const qtyInput = document.getElementById("detail-qty");
  const btnDec = document.getElementById("detail-qty-dec");
  const btnInc = document.getElementById("detail-qty-inc");

  if (qtyInput && btnDec && btnInc) {
    qtyInput.value = 1;
    btnDec.addEventListener("click", () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val > 1) qtyInput.value = val - 1;
    });
    btnInc.addEventListener("click", () => {
      let val = parseInt(qtyInput.value) || 1;
      qtyInput.value = val + 1;
    });
  }

  // Botão de Adicionar ao Carrinho
  const addBtn = document.getElementById("btn-add-detail");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const quantity = parseInt(qtyInput.value) || 1;
      addToCart(product.id, currentDetailSelectedSize, quantity);
    });
  }

  // Renderizar relacionados
  renderRelatedProducts(product);

  // Iniciar slideshow automático das fotos do produto (troca a cada 4s)
  startDetailSlideshow();
}

let detailSlideshowInterval = null;

function startDetailSlideshow() {
  if (detailSlideshowInterval) clearInterval(detailSlideshowInterval);
  
  // Inicia o slideshow automático se houver miniaturas disponíveis
  detailSlideshowInterval = setInterval(() => {
    const thumbs = document.querySelectorAll(".thumbnail-btn");
    if (thumbs.length >= 2) {
      let activeIndex = 0;
      thumbs.forEach((btn, index) => {
        if (btn.classList.contains("active")) {
          activeIndex = index;
        }
      });
      const nextIndex = (activeIndex + 1) % thumbs.length;
      const nextThumb = thumbs[nextIndex];
      const img = nextThumb.querySelector("img");
      if (img) {
        const imgSrc = img.getAttribute("src");
        const mainImg = document.getElementById("prod-main-img");
        if (mainImg) {
          mainImg.classList.add("fade-out");
          setTimeout(() => {
            mainImg.src = imgSrc;
            mainImg.classList.remove("fade-out");
          }, 300);
        }
        
        thumbs.forEach(btn => btn.classList.remove("active"));
        nextThumb.classList.add("active");
      }
    }
  }, 6000);
}

function setMainDetailImage(imgSrc, btnElement) {
  const mainImg = document.getElementById("prod-main-img");
  if (mainImg) {
    mainImg.classList.add("fade-out");
    setTimeout(() => {
      mainImg.src = imgSrc;
      mainImg.classList.remove("fade-out");
    }, 300);
  }
  
  document.querySelectorAll(".thumbnail-btn").forEach(btn => btn.classList.remove("active"));
  if (btnElement) btnElement.classList.add("active");
  
  // Reinicia o slideshow de 4s para evitar que mude imediatamente após o clique manual
  startDetailSlideshow();
}

function renderRelatedProducts(currentProduct) {
  const container = document.getElementById("related-products-grid");
  if (!container) return;

  container.innerHTML = "";

  // Filtra outros produtos da mesma categoria
  const related = PRODUCTS.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id).slice(0, 3);

  if (related.length === 0) {
    // Se não houver da mesma categoria, pega outros quaisquer
    container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:var(--text-secondary);">Outros produtos em alta recomendados para você.</p>`;
    return;
  }

  related.forEach(prod => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-img-wrap" onclick="window.location.href='produto.html?id=${prod.id}'">
        <img class="product-img img-front" src="${prod.image}" alt="${prod.name}">
        <img class="product-img img-back" src="${prod.imageBack}" alt="${prod.name} (Verso)">
        <div class="product-overlay">
          <span class="btn-quick-view" onclick="event.stopPropagation(); openQuickView(${prod.id});"><i class="ri-eye-line"></i> Espiar</span>
        </div>
      </div>
      <div class="product-details">
        <h3 class="product-title" onclick="window.location.href='produto.html?id=${prod.id}'" style="cursor:pointer;">${prod.name}</h3>
        <div class="product-price-row">
          <span class="price-current">R$ ${prod.price.toFixed(2).replace('.', ',')}</span>
          <button class="btn-add-fast" onclick="fastAddToCart(${prod.id})"><i class="ri-add-line"></i></button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==========================================
// PÁGINA DE CHECKOUT INTERATIVO (PAGAMENTO)
// ==========================================
let currentStep = 1;
let appliedCouponCode = "";

function initCheckoutPage() {
  renderCheckoutOrderSummary();
  setupCheckoutEventListeners();
  updateWizardUI();
}

function renderCheckoutOrderSummary() {
  const summaryTableBody = document.getElementById("checkout-summary-table-body");
  if (!summaryTableBody) return;

  if (cart.length === 0) {
    summaryTableBody.innerHTML = `<tr><td colspan="5" style="color:var(--text-muted); text-align:center; padding: 30px 0;">Seu carrinho está vazio. Adicione produtos antes de finalizar.</td></tr>`;
    calculateCheckoutTotals();
    return;
  }

  summaryTableBody.innerHTML = "";
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="width: 70px;">
        <img src="${item.image}" class="summary-item-img" alt="${item.name}">
      </td>
      <td>
        <h4 style="font-size:0.95rem; font-weight:700; margin-bottom:4px;">${item.name}</h4>
      </td>
      <td>
        <span style="font-weight: 600;">${item.size}</span>
      </td>
      <td style="text-align: center;">
        <span>${item.quantity}x</span>
      </td>
      <td style="text-align: right; font-weight:700; color:var(--brand-yellow);">
        R$ ${itemTotal.toFixed(2).replace('.', ',')}
      </td>
    `;
    summaryTableBody.appendChild(tr);
  });

  calculateCheckoutTotals();
}

function calculateCheckoutTotals() {
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
  });

  let shippingCost = subtotal >= 250 ? 0 : 15.00;
  let discountAmount = 0;

  if (appliedCouponCode) {
    if (appliedCouponCode === "MEIRELES10") {
      discountAmount = subtotal * 0.10;
    } else if (appliedCouponCode === "BEMVINDO5") {
      discountAmount = subtotal * 0.05;
    } else if (appliedCouponCode === "FRETEGRATIS") {
      discountAmount = shippingCost;
      shippingCost = 0;
    }
  }

  const total = subtotal + shippingCost - (appliedCouponCode === "FRETEGRATIS" ? 0 : discountAmount);

  const checkoutSubtotal = document.getElementById("checkout-subtotal");
  const checkoutShipping = document.getElementById("checkout-shipping");
  const checkoutDiscountRow = document.getElementById("checkout-discount-row");
  const checkoutDiscount = document.getElementById("checkout-discount");
  const checkoutTotal = document.getElementById("checkout-total");

  if (checkoutSubtotal) checkoutSubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
  
  if (checkoutShipping) {
    if (shippingCost === 0) {
      checkoutShipping.textContent = "GRÁTIS";
      checkoutShipping.style.color = "var(--brand-green)";
    } else {
      checkoutShipping.textContent = `R$ ${shippingCost.toFixed(2).replace('.', ',')}`;
      checkoutShipping.style.color = "";
    }
  }

  if (checkoutDiscountRow && checkoutDiscount) {
    if (discountAmount > 0 && appliedCouponCode !== "FRETEGRATIS") {
      checkoutDiscountRow.style.display = "flex";
      checkoutDiscount.textContent = `- R$ ${discountAmount.toFixed(2).replace('.', ',')}`;
    } else {
      checkoutDiscountRow.style.display = "none";
    }
  }

  if (checkoutTotal) checkoutTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

  return { subtotal, shippingCost, discountAmount, total };
}

function handleApplyCoupon() {
  const input = document.getElementById("coupon-code-input");
  const msgElement = document.getElementById("coupon-status-msg");
  if (!input || !msgElement) return;

  const code = input.value.trim().toUpperCase();
  if (!code) {
    msgElement.textContent = "Por favor, digite um cupom.";
    msgElement.className = "coupon-message error";
    return;
  }

  const validCoupons = ["MEIRELES10", "BEMVINDO5", "FRETEGRATIS"];

  if (validCoupons.includes(code)) {
    appliedCouponCode = code;
    
    let subtotal = 0;
    cart.forEach(item => subtotal += item.price * item.quantity);
    
    let descText = "";
    if (code === "MEIRELES10") {
      descText = "Cupom MEIRELES10 aplicado! 10% de desconto no subtotal.";
    } else if (code === "BEMVINDO5") {
      descText = "Cupom BEMVINDO5 aplicado! 5% de desconto no subtotal.";
    } else if (code === "FRETEGRATIS") {
      if (subtotal >= 250) {
        descText = "Cupom FRETEGRATIS aplicado! (Seu frete já era grátis).";
      } else {
        descText = "Cupom FRETEGRATIS aplicado! Frete grátis garantido.";
      }
    }

    msgElement.textContent = descText;
    msgElement.className = "coupon-message success";
    
    calculateCheckoutTotals();
  } else {
    msgElement.textContent = "Cupom inválido ou expirado.";
    msgElement.className = "coupon-message error";
    appliedCouponCode = "";
    calculateCheckoutTotals();
  }
}

function goToStep(step) {
  if (step > currentStep) {
    if (currentStep === 1) {
      if (!validateStep1()) return;
    }
    if (currentStep <= 2 && step > 2) {
      if (!validateStep1()) return;
      if (!validateStep2()) return;
    }
    if (step >= 3) {
      if (cart.length === 0) {
        alert("Adicione itens ao carrinho antes de continuar!");
        return;
      }
    }
  }
  currentStep = step;
  updateWizardUI();
}

function nextStep() {
  if (currentStep === 1) {
    if (!validateStep1()) return;
  }
  if (currentStep === 2) {
    if (!validateStep2()) return;
  }
  if (currentStep === 3) {
    if (cart.length === 0) {
      alert("Adicione itens ao carrinho antes de continuar!");
      return;
    }
  }
  if (currentStep < 4) {
    currentStep++;
    updateWizardUI();
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateWizardUI();
  }
}

function validateStep1() {
  const nome = document.getElementById("ch-nome");
  const phone = document.getElementById("ch-phone");

  let isValid = true;
  const fields = [nome, phone];
  
  fields.forEach(field => {
    if (!field) return;
    if (!field.value.trim()) {
      field.style.borderColor = "#ff4a4a";
      isValid = false;
    } else {
      field.style.borderColor = "";
    }
  });

  if (!isValid) {
    alert("Por favor, preencha seu Nome e WhatsApp.");
  }
  return isValid;
}

function validateStep2() {
  const rua = document.getElementById("ch-rua");
  const numero = document.getElementById("ch-numero");
  const bairro = document.getElementById("ch-bairro");
  const cidade = document.getElementById("ch-cidade");

  let isValid = true;
  const fields = [rua, numero, bairro, cidade];
  
  fields.forEach(field => {
    if (!field) return;
    if (!field.value.trim()) {
      field.style.borderColor = "#ff4a4a";
      isValid = false;
    } else {
      field.style.borderColor = "";
    }
  });

  if (!isValid) {
    alert("Por favor, preencha todos os campos obrigatórios (*) do endereço de entrega.");
  }
  return isValid;
}

function updateWizardUI() {
  document.querySelectorAll(".step-panel").forEach((panel, index) => {
    if (index + 1 === currentStep) {
      panel.classList.add("active");
    } else {
      panel.classList.remove("active");
    }
  });

  document.querySelectorAll(".step-node").forEach((node, index) => {
    const stepNum = index + 1;
    if (stepNum < currentStep) {
      node.classList.add("completed");
      node.classList.remove("active");
    } else if (stepNum === currentStep) {
      node.classList.add("active");
      node.classList.remove("completed");
    } else {
      node.classList.remove("active", "completed");
    }
  });

  const progressLine = document.getElementById("step-progress-line");
  if (progressLine) {
    const percentage = ((currentStep - 1) / 3) * 100;
    progressLine.style.width = `${percentage}%`;
  }
  
  const wizardContainer = document.querySelector(".checkout-steps-container");
  if (wizardContainer) {
    wizardContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function setupCheckoutEventListeners() {
  // Troca de Abas de Pagamento (PIX, Cartão, Dinheiro)
  const tabButtons = document.querySelectorAll(".payment-tab-btn");
  const panels = document.querySelectorAll(".payment-panel");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPanelId = `${btn.getAttribute("data-method")}-panel`;
      document.getElementById(targetPanelId).classList.add("active");
    });
  });

  // Botão Copiar Chave PIX
  const btnCopyPix = document.getElementById("btn-copy-pix");
  if (btnCopyPix) {
    btnCopyPix.addEventListener("click", () => {
      const pixInput = document.getElementById("pix-key-val");
      if (pixInput) {
        pixInput.select();
        navigator.clipboard.writeText(pixInput.value);
        btnCopyPix.innerHTML = '<i class="ri-checkbox-circle-line"></i> Copiado!';
        setTimeout(() => {
          btnCopyPix.innerHTML = '<i class="ri-file-copy-line"></i> Copiar';
        }, 2000);
      }
    });
  }

  // ==========================================
  // LÓGICA DO CARTÃO DE CRÉDITO INTERATIVO 3D
  // ==========================================
  const cardElement = document.getElementById("credit-card-3d");
  
  const inputNum = document.getElementById("card-num-input");
  const inputName = document.getElementById("card-name-input");
  const inputExpiry = document.getElementById("card-expiry-input");
  const inputCvv = document.getElementById("card-cvv-input");

  const displayNum = document.getElementById("card-display-number");
  const displayName = document.getElementById("card-display-name");
  const displayExpiry = document.getElementById("card-display-expiry");
  const displayCvv = document.getElementById("card-display-cvv");

  // Atualizar Número do Cartão
  if (inputNum && displayNum) {
    inputNum.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, '');
      val = val.substring(0, 16);
      let formatted = val.match(/.{1,4}/g)?.join(' ') || "";
      e.target.value = formatted;
      displayNum.textContent = formatted || "•••• •••• •••• ••••";
    });
  }

  // Atualizar Nome do Cartão
  if (inputName && displayName) {
    inputName.addEventListener("input", (e) => {
      let val = e.target.value.toUpperCase();
      displayName.textContent = val || "NOME DO TITULAR";
    });
  }

  // Atualizar Validade
  if (inputExpiry && displayExpiry) {
    inputExpiry.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2, 4);
      }
      e.target.value = val;
      displayExpiry.textContent = val || "MM/AA";
    });
  }

  // Atualizar CVV e Girar Cartão 3D no Focus/Blur
  if (inputCvv && displayCvv) {
    inputCvv.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      e.target.value = val;
      displayCvv.textContent = val || "•••";
    });

    inputCvv.addEventListener("focus", () => {
      if (cardElement) cardElement.classList.add("flipped");
    });

    inputCvv.addEventListener("blur", () => {
      if (cardElement) cardElement.classList.remove("flipped");
    });
  }

  // Submissão do Checkout
  const checkoutForm = document.getElementById("checkout-main-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      processCheckoutOrder();
    });
  }
}

function processCheckoutOrder() {
  if (cart.length === 0) {
    alert("Adicione itens ao carrinho antes de finalizar a compra!");
    return;
  }

  const nome = document.getElementById("ch-nome").value.trim();
  const telefone = document.getElementById("ch-phone").value.trim();
  const rua = document.getElementById("ch-rua").value.trim();
  const numero = document.getElementById("ch-numero").value.trim();
  const bairro = document.getElementById("ch-bairro").value.trim();
  const cidade = document.getElementById("ch-cidade").value.trim();
  const obs = document.getElementById("ch-obs").value.trim();

  // Método de pagamento selecionado
  const activeTab = document.querySelector(".payment-tab-btn.active");
  const paymentMethod = activeTab ? activeTab.getAttribute("data-method") : "pix";

  let paymentText = "";
  if (paymentMethod === "pix") {
    paymentText = "PIX (Aguardando comprovante)";
  } else if (paymentMethod === "card") {
    const cardNum = document.getElementById("card-num-input").value.trim();
    const cardName = document.getElementById("card-name-input").value.trim();
    const cardExpiry = document.getElementById("card-expiry-input").value.trim();
    const cardCvv = document.getElementById("card-cvv-input").value.trim();

    if (!cardNum || !cardName || !cardExpiry || !cardCvv) {
      alert("Por favor, preencha todos os dados do cartão de crédito.");
      return;
    }
    paymentText = `Cartão de Crédito (Final de número: ${cardNum.slice(-4)}) - Titular: ${cardName}`;
  } else {
    paymentText = "Dinheiro / Cartão na Entrega";
  }

  // Gerar mensagem de WhatsApp estruturada
  let msg = `⚡ *NOVO PEDIDO CONFIRMADO - MEIRELES MODAS* ⚡\n\n`;
  msg += `👤 *Cliente:* ${nome}\n`;
  if (telefone) msg += `📞 *WhatsApp:* ${telefone}\n`;
  msg += `📍 *Endereço de Entrega:*\n`;
  msg += `   Rua ${rua}, Nº ${numero}\n`;
  msg += `   Bairro: ${bairro} | Cidade: ${cidade}\n`;
  msg += `💳 *Método de Pagamento:* ${paymentText}\n`;
  if (obs) msg += `📝 *Observação:* ${obs}\n`;
  msg += `\n🛒 *PRODUTOS ADQUIRIDOS:*\n`;
  msg += `-------------------------------------------\n`;

  let subtotal = 0;
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    msg += `🔹 *${item.quantity}x* ${item.name}\n`;
    msg += `   Tam: *${item.size}* | R$ ${item.price.toFixed(2).replace('.', ',')} cada\n`;
    msg += `   Subtotal: *R$ ${itemTotal.toFixed(2).replace('.', ',')}*\n\n`;
  });

  const totals = calculateCheckoutTotals();

  msg += `-------------------------------------------\n`;
  msg += `💵 *Subtotal:* R$ ${totals.subtotal.toFixed(2).replace('.', ',')}\n`;
  
  if (appliedCouponCode) {
    if (appliedCouponCode === "FRETEGRATIS") {
      msg += `🎫 *Cupom:* ${appliedCouponCode} (Frete Grátis)\n`;
    } else {
      msg += `🎫 *Cupom:* ${appliedCouponCode} (- R$ ${totals.discountAmount.toFixed(2).replace('.', ',')})\n`;
    }
  }

  msg += `🚚 *Frete:* ${totals.shippingCost === 0 ? 'GRÁTIS' : 'R$ ' + totals.shippingCost.toFixed(2).replace('.', ',')}\n`;
  msg += `🔥 *TOTAL DO PEDIDO:* *R$ ${totals.total.toFixed(2).replace('.', ',')}*\n\n`;
  msg += `✨ *Obrigado pela preferência! Aguardando o processamento do envio.*`;

  // Limpar Carrinho
  cart = [];
  localStorage.setItem("meireles_cart", JSON.stringify(cart));
  updateCartUI();

  // Abrir WhatsApp API
  const encodedMsg = encodeURIComponent(msg);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodedMsg}`;
  
  // Limpar formulário e redirecionar
  document.getElementById("checkout-main-form").reset();
  alert("Pedido finalizado com sucesso! Direcionando para o WhatsApp do vendedor para confirmar seu pagamento.");
  
  window.open(whatsappUrl, "_blank");
  window.location.href = "index.html"; // Retorna para Home
}

// ==========================================
// LÓGICA DO MODAL DE VISUALIZAÇÃO RÁPIDA (QUICK VIEW)
// ==========================================
let currentQvSelectedSize = "";
let currentQvProductId = null;

function openQuickView(productId) {
  const qvOverlay = document.getElementById("quickview-overlay");
  if (!qvOverlay) {
    // Se o modal não existe na página atual, navega diretamente para a página do produto
    window.location.href = `produto.html?id=${productId}`;
    return;
  }

  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  currentQvProductId = productId;
  
  // Atualizar DOM do modal
  const qvImg = document.getElementById("qv-main-img");
  const qvCategory = document.getElementById("qv-category");
  const qvTitle = document.getElementById("qv-title");
  const qvPrice = document.getElementById("qv-price");
  const qvDescription = document.getElementById("qv-description");
  const qvQty = document.getElementById("qv-qty");

  if (qvImg) qvImg.src = product.image;
  if (qvCategory) {
    qvCategory.textContent = product.category === 'times' ? 'Camisas de Time' : product.category === 'streetwear' ? 'Streetwear' : 'Moda Casual';
  }
  if (qvTitle) qvTitle.textContent = product.name;
  if (qvPrice) qvPrice.textContent = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
  if (qvDescription) qvDescription.textContent = product.description;
  if (qvQty) qvQty.value = 1;

  // Renderizar tamanhos
  currentQvSelectedSize = product.sizes[0];
  const sizesContainer = document.getElementById("qv-sizes");
  if (sizesContainer) {
    sizesContainer.innerHTML = "";
    product.sizes.forEach(size => {
      const btn = document.createElement("button");
      btn.className = `size-pill ${size === currentQvSelectedSize ? 'active' : ''}`;
      btn.textContent = size;
      btn.addEventListener("click", () => {
        sizesContainer.querySelectorAll(".size-pill").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        currentQvSelectedSize = size;
      });
      sizesContainer.appendChild(btn);
    });
  }

  // Abrir o modal
  qvOverlay.classList.add("open");
  qvOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeQuickView() {
  const qvOverlay = document.getElementById("quickview-overlay");
  if (qvOverlay) {
    qvOverlay.classList.remove("open");
    qvOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  currentQvProductId = null;
}

// ==========================================
// PRELOADER / SPLASH SCREEN DE CARREGAMENTO
// ==========================================
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add("fade-out");
    }, 850); // 850ms para um efeito suave e marcante
  }
});

