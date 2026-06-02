// ==========================================
// BANCO DE DADOS UNIFICADO DE PRODUTOS
// ==========================================
const PRODUCTS = [
  {
    id: 1,
    name: "Camisa do Brasil Oficial - Copa 2026",
    category: "times",
    price: 289.90,
    oldPrice: 349.90,
    image: "assets/images/jersey_brasil.png",
    imageBack: "assets/images/jersey_brasil_back.png",
    sizes: ["P", "M", "G", "GG"],
    badge: "Novidade",
    badgeClass: "novidade",
    description: "A nova armadura oficial da Seleção Brasileira. Confeccionada com tecido tecnológico antissuor e detalhes em verde e amarelo vibrantes, trazendo alta respirabilidade e conforto máximo para a torcida rumo ao Hexa."
  },
  {
    id: 2,
    name: "Camisa Flamengo Oficial I - 26/27",
    category: "times",
    price: 299.90,
    oldPrice: 359.90,
    image: "assets/images/jersey_flamengo.png",
    imageBack: "assets/images/jersey_flamengo_back.png",
    sizes: ["P", "M", "G", "GG"],
    badge: "Mais Vendido",
    badgeClass: "",
    description: "O Manto Sagrado do Mengão para a temporada! Design clássico com as icônicas listras horizontais rubro-negras, gola em V moderna, tecido leve de secagem rápida e o escudo oficial bordado com extrema precisão no peito."
  },
  {
    id: 3,
    name: "Camiseta Oversized Streetwear Preta",
    category: "streetwear",
    price: 99.90,
    oldPrice: 139.90,
    image: "assets/images/streetwear_oversized.png",
    imageBack: "assets/images/streetwear_oversized_back.png",
    sizes: ["M", "G", "GG"],
    badge: "Premium",
    badgeClass: "novidade",
    description: "Desenvolvida com algodão 100% penteado de altíssima gramatura (heavyweight), esta camiseta oversized proporciona um caimento impecável e robusto. Ideal para compor looks urbanos minimalistas de alto padrão."
  },
  {
    id: 4,
    name: "Camisa Linho Meireles Premium",
    category: "moda",
    price: 149.90,
    oldPrice: 199.90,
    image: "assets/images/linen_shirt.png",
    imageBack: "assets/images/linen_shirt_back.png",
    sizes: ["P", "M", "G"],
    badge: "Elegante",
    badgeClass: "",
    description: "A união perfeita entre o frescor e a sofisticação. Confeccionada em tecido misto de linho com algodão, possui corte slim moderno, gola padre e botões amadeirados. Ideal para casamentos diurnos, festas ou passeios de verão."
  },
  {
    id: 5,
    name: "Jaqueta Corta-Vento Windbreaker Carbon",
    category: "streetwear",
    price: 189.90,
    oldPrice: 249.90,
    image: "assets/images/windbreaker_jacket.png",
    imageBack: "assets/images/windbreaker_jacket_back.png",
    sizes: ["M", "G", "GG"],
    badge: "Destaque",
    badgeClass: "novidade",
    description: "Proteção total contra vento e garoa fina. Esta jaqueta corta-vento combina preto fosco elegante com listras e capuz em detalhes verde neon refletivo. Possui bolsos frontais amplos com zíper e ajuste elástico na barra."
  },
  {
    id: 6,
    name: "Camisa Real Madrid Oficial Home",
    category: "times",
    price: 319.90,
    oldPrice: 379.90,
    image: "assets/images/jersey_realmadrid.png",
    imageBack: "assets/images/jersey_realmadrid_back.png",
    sizes: ["P", "M", "G", "GG"],
    badge: "Lançamento",
    badgeClass: "",
    description: "O manto oficial do maior clube do mundo em branco puro majestoso, com detalhes premium bordados em fios dourados metálicos. Feita com tecido que ajuda a manter a pele fresca e seca mesmo nos momentos de maior tensão."
  },
  {
    id: 7,
    name: "Camiseta Streetwear Off-White Wave",
    category: "streetwear",
    price: 89.90,
    oldPrice: 119.90,
    image: "assets/images/streetwear_oversized.png",
    imageBack: "assets/images/streetwear_oversized_back.png",
    sizes: ["P", "M", "G"],
    badge: "Promoção",
    badgeClass: "",
    description: "Camiseta em tonalidade off-white premium, produzida em malha super macia. Traz estampa conceitual de ondas no peito e nas costas com tons azuis derivados da nossa logo. Perfeita para quem vive o lifestyle urbano."
  },
  {
    id: 8,
    name: "Camisa de Linho Manga Curta Casual",
    category: "moda",
    price: 129.90,
    oldPrice: 169.90,
    image: "assets/images/linen_shirt.png",
    imageBack: "assets/images/linen_shirt_back.png",
    sizes: ["P", "M", "G", "GG"],
    badge: "Estilo",
    badgeClass: "",
    description: "Uma variação leve e fresca da camisa de linho clássica, em manga curta. O caimento é relaxado e confortável, ideal para usar aberta sobreposta a uma regata, proporcionando estilo instantâneo e frescor total."
  }
];
