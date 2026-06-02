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
    window.location.href = "loja.html"; // loja.html está na mesma pasta /pages/
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
  mainImg.src = `${pathPrefix}${product.image}`;
  currentDetailSelectedImage = product.image;

  const thumbsContainer = document.getElementById("prod-thumbnails");
  if (thumbsContainer) {
    thumbsContainer.innerHTML = `
      <button class="thumbnail-btn active" onclick="setMainDetailImage('${pathPrefix}${product.image}', this)">
        <img src="${pathPrefix}${product.image}" alt="Frente do produto">
      </button>
      <button class="thumbnail-btn" onclick="setMainDetailImage('${pathPrefix}${product.imageBack}', this)">
        <img src="${pathPrefix}${product.imageBack}" alt="Costas do produto">
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

  // Iniciar slideshow automático das fotos do produto (troca a cada 6s)
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
  
  // Reinicia o slideshow para evitar que mude imediatamente após o clique manual
  startDetailSlideshow();
}

function renderRelatedProducts(currentProduct) {
  const container = document.getElementById("related-products-grid");
  if (!container) return;

  container.innerHTML = "";

  // Filtra outros produtos da mesma categoria
  const related = PRODUCTS.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id).slice(0, 3);

  if (related.length === 0) {
    container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:var(--text-secondary);">Outros produtos em alta recomendados para você.</p>`;
    return;
  }

  related.forEach(prod => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-img-wrap" onclick="window.location.href='produto.html?id=${prod.id}'">
        <img class="product-img img-front" src="${pathPrefix}${prod.image}" alt="${prod.name}">
        <img class="product-img img-back" src="${pathPrefix}${prod.imageBack}" alt="${prod.name} (Verso)">
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
