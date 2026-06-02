// ==========================================
// ESTADO GLOBAL DO CARRINHO (LocalStorage)
// ==========================================
let cart = JSON.parse(localStorage.getItem("meireles_cart")) || [];

// ==========================================
// CONFIGURAÇÕES GERAIS DO WHATSAPP
// ==========================================
const WHATSAPP_PHONE = "5585999998888";

// ==========================================
// PREFIXO DE CAMINHO PARA IMAGENS
// Páginas em /pages/ precisam de ../ antes dos assets
// ==========================================
const isSubpage = window.location.pathname.includes('/pages/');
const pathPrefix = isSubpage ? '../' : '';

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
      image: `${pathPrefix}${product.image}`,
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
// LÓGICA DO MODAL DE VISUALIZAÇÃO RÁPIDA (QUICK VIEW)
// ==========================================
let currentQvSelectedSize = "";
let currentQvProductId = null;

function openQuickView(productId) {
  const qvOverlay = document.getElementById("quickview-overlay");
  if (!qvOverlay) {
    // Se o modal não existe na página atual, navega diretamente para a página do produto
    window.location.href = `${pathPrefix}pages/produto.html?id=${productId}`;
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

  if (qvImg) qvImg.src = `${pathPrefix}${product.image}`;
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
