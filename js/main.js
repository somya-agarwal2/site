// ==========================================================================
// ADAH JEWELS — MAIN CLIENT APPLICATION
// "The Everyday Edit" — Storefront, Running Showcase & Shopping Features
// ==========================================================================

const MASTER_STORAGE_KEY = 'ADAH_LIVE_PRODUCTS_V1';

// Guard: Identify and eliminate legacy sample products permanently
function isOldSampleProduct(item) {
  if (!item || !item.id) return false;
  const id = String(item.id).toUpperCase().trim();
  const prefixes = ['AJ-E50-', 'AJ-E60-', 'AJ-E100-', 'AJ-E120-', 'AJ-P120-', 'AJ-B120-', 'AJ-R120-', 'AJ-S50-'];
  if (prefixes.some(p => id.startsWith(p)) || id === 'AJ-ADM-01' || id === 'AJ-ROYAL-01' || id === 'AJ-NEW-01') {
    return true;
  }
  return false;
}

window.allProducts = [];
let cart = JSON.parse(localStorage.getItem('adah_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('adah_wishlist')) || [];
let currentFilter = 'all';
let searchQuery = '';

// Sync Channel
const syncChannel = window.BroadcastChannel ? new BroadcastChannel('adah_catalogue_sync') : null;

// DOM Elements
const marqueeTrack = document.getElementById('marqueeTrack');
const productGrid = document.getElementById('productGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('searchInput');
const productCountBadge = document.getElementById('productCountBadge');

// Cart & Wishlist Elements
const cartToggleBtn = document.getElementById('cartToggleBtn');
const wishlistToggleBtn = document.getElementById('wishlistToggleBtn');
const cartDrawer = document.getElementById('cartDrawer');
const wishlistDrawer = document.getElementById('wishlistDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const closeCartBtn = document.getElementById('closeCartBtn');
const closeWishlistBtn = document.getElementById('closeWishlistBtn');
const cartBadge = document.getElementById('cartBadge');
const wishlistBadge = document.getElementById('wishlistBadge');
const cartDrawerCount = document.getElementById('cartDrawerCount');
const wishlistCount = document.getElementById('wishlistCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const wishlistItemsContainer = document.getElementById('wishlistItemsContainer');
const cartSubtotal = document.getElementById('cartSubtotal');
const whatsappCheckoutBtn = document.getElementById('whatsappCheckoutBtn');
const copyAllIdsBtn = document.getElementById('copyAllIdsBtn');
const toastMessage = document.getElementById('toastMessage');

// ==========================================================================
// INITIALIZATION & PERSISTENCE
// ==========================================================================

window.loadProductsFromStorage = function() {
  // Purge legacy storage keys completely
  ['ADAH_MASTER_CATALOGUE', 'adah_custom_products', 'adah_custom_products_v2'].forEach(k => {
    try { localStorage.removeItem(k); } catch (e) {}
  });

  const saved = localStorage.getItem(MASTER_STORAGE_KEY);

  if (saved !== null) {
    try {
      const parsed = JSON.parse(saved);
      window.allProducts = Array.isArray(parsed) ? parsed.filter(p => !isOldSampleProduct(p)) : [];
    } catch (e) {
      window.allProducts = [];
    }
  } else {
    window.allProducts = [];
  }

  // Save canonical master
  localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(window.allProducts));
};

async function syncWithServer() {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const serverProducts = await res.json();
      if (Array.isArray(serverProducts)) {
        window.allProducts = serverProducts.filter(p => !isOldSampleProduct(p));
        localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(window.allProducts));
        window.refreshStorefront();
      }
    }
  } catch (err) {}
}

function initializeFromDefaults() {
  return [];
}

function initApp() {
  window.loadProductsFromStorage();
  window.refreshStorefront();
  setupEventListeners();
  updateCartUI();
  updateWishlistUI();

  // Asynchronous server database sync
  syncWithServer();

  // Real-time synchronization with Admin Portal
  if (syncChannel) {
    syncChannel.onmessage = (e) => {
      if (e.data && e.data.type === 'CATALOGUE_CHANGED') {
        window.allProducts = e.data.products;
        window.refreshStorefront();
      }
    };
  }

  window.addEventListener('storage', (e) => {
    if ((e.key === MASTER_STORAGE_KEY || e.key === 'adah_custom_products_v2') && e.newValue) {
      try {
        window.allProducts = JSON.parse(e.newValue);
        window.refreshStorefront();
      } catch (err) {}
    }
  });

  // Re-sync when switching back to storefront tab
  window.addEventListener('focus', () => {
    syncWithServer();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncWithServer();
    }
  });
}

// Master refresh triggered whenever products are added, edited, or removed
window.refreshStorefront = function() {
  renderRunningShowcase();
  renderProductsGrid();
  if (productCountBadge) {
    // Only count active showcased pieces
    const visiblePieces = (window.allProducts || []).filter(p => p.featured !== false);
    productCountBadge.textContent = `${visiblePieces.length} Pieces Available`;
  }
};

// ==========================================================================
// RUNNING MOVING PRODUCTS SHOWCASE (INFINITE MARQUEE)
// ==========================================================================

function renderRunningShowcase() {
  if (!marqueeTrack) return;

  // STRICTLY only include items where featured === true and inStock !== false
  const items = window.allProducts.filter(p => p.featured === true && p.inStock !== false && (p.stock === undefined || p.stock > 0));

  if (items.length === 0) {
    marqueeTrack.innerHTML = `
      <div style="padding: 24px 0; text-align: center; width: 100%; color: var(--taupe-accent); font-size: 0.95rem; font-family: var(--font-serif); letter-spacing: 0.15em; font-weight: 500;">
        ✦ NEW COLLECTION DROPPING SOON ✦
      </div>
    `;
    return;
  }

  const cardsHtml = items.map(item => {
    let mediaHtml = '';
    if (item.image) {
      mediaHtml = `<img src="${item.image}" alt="${item.name}" loading="lazy">`;
    } else {
      mediaHtml = getJewelleryArtSvg(item.category, item.name);
    }

    const waText = encodeURIComponent(`Hi ADAH JEWELS! I love this running piece: ${item.id} - ${item.name} (₹${item.price}). Is it available to order?`);

    return `
      <div class="running-card">
        <div class="running-card-media">
          <span class="running-card-badge">${item.category}</span>
          <span class="running-card-price">₹${item.price}</span>
          ${mediaHtml}
        </div>
        <div class="running-card-body">
          <div class="running-card-id">✦ ${item.id}</div>
          <h4 class="running-card-title">${item.name}</h4>
          <p class="running-card-desc">${item.desc}</p>
          <div class="running-card-footer">
            <button class="btn-card-add" onclick="addToCart('${item.id}')">
              <i class="fa-solid fa-bag-shopping"></i> Add to Bag
            </button>
            <a href="https://wa.me/918979660550?text=${waText}" target="_blank" class="btn-card-wa" title="Instant WhatsApp Order">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Duplicate for seamless 100% infinite looping marquee
  // If fewer than 4 items, repeat 4 times so track is full
  const repeatCount = items.length < 3 ? 6 : (items.length < 5 ? 4 : 2);
  let finalHtml = '';
  for (let i = 0; i < repeatCount; i++) {
    finalHtml += cardsHtml;
  }
  marqueeTrack.innerHTML = finalHtml;
}

// ==========================================================================
// CATALOGUE PRODUCT GRID
// ==========================================================================

function renderProductsGrid() {
  if (!productGrid) return;

  if (!window.allProducts || window.allProducts.length === 0) {
    productGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px; color: var(--text-muted);">
        <i class="fa-solid fa-gem" style="font-size: 3.5rem; margin-bottom: 16px; color: var(--taupe-accent); opacity: 0.5;"></i>
        <h3 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--text-dark); margin-bottom: 10px;">Collection In Preparation</h3>
        <p style="max-width: 480px; margin: 0 auto; line-height: 1.6; font-size: 0.95rem;">
          Our handcrafted luxury pieces are being prepared in the studio. Handpicked jewellery added via the Admin Portal will be unveiled here.
        </p>
      </div>
    `;
    return;
  }

  const filtered = (window.allProducts || []).filter(p => {
    // Hide products that have Showcase turned OFF in Admin
    if (p.featured === false) return false;

    // Filter matching
    let matchesFilter = true;
    if (currentFilter !== 'all') {
      const pCat = (p.category || '').toLowerCase();
      const fCat = currentFilter.toLowerCase();
      const isNecklacePendant = (fCat.includes('pendant') || fCat.includes('necklace')) && 
                                (pCat.includes('pendant') || pCat.includes('necklace'));

      matchesFilter = (p.tier === currentFilter) || 
                      (pCat === fCat) ||
                      isNecklacePendant;
    }

    // Search matching
    const matchesSearch = p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    productGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <i class="fa-solid fa-gem" style="font-size: 3rem; margin-bottom: 14px; color: var(--taupe-accent); opacity: 0.6;"></i>
        <h3 style="font-family: var(--font-serif); font-size: 1.6rem; color: var(--text-dark); margin-bottom: 8px;">No Jewellery Found</h3>
        <p>No jewellery pieces match your search or filter. Try clearing filters.</p>
        <button class="btn btn-primary" onclick="resetFilters()" style="margin-top: 18px; background: var(--taupe-accent); color: #fff; padding: 10px 24px; border-radius: 4px;">
          View All Pieces
        </button>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = filtered.map(item => {
    const isOutOfStock = (item.inStock === false) || (typeof item.stock === 'number' && item.stock <= 0);
    const isLowStock = !isOutOfStock && (typeof item.stock === 'number' && item.stock <= 3);
    const isLiked = wishlist.includes(item.id);
    const waText = isOutOfStock
      ? encodeURIComponent(`Hi ADAH JEWELS! I noticed that product ${item.id} - ${item.name} is Sold Out. When will it be back in stock?`)
      : encodeURIComponent(`Hi ADAH JEWELS! I want to order product ${item.id} - ${item.name} (₹${item.price}). Is it available?`);

    let mediaHtml = '';
    if (item.image) {
      mediaHtml = `<img src="${item.image}" alt="${item.name}" loading="lazy">`;
    } else {
      mediaHtml = getJewelleryArtSvg(item.category, item.name);
    }

    return `
      <div class="product-card" id="card-${item.id}">
        <div class="card-img-wrap">
          <div class="price-pill">₹${item.price}</div>
          ${isOutOfStock ? '<div class="soldout-pill">Sold Out</div>' : ''}
          <button class="like-btn ${isLiked ? 'active' : ''}" onclick="toggleWishlist('${item.id}')" title="Save to Wishlist">
            <i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>
          </button>
          ${mediaHtml}
        </div>
        <div class="card-body">
          <div class="product-id-tag">
            <span>✦ ${item.id}</span>
            <button class="copy-id-btn" onclick="copyText('${item.id}', 'Product ID copied!')" title="Copy Product ID for Instagram DM">
              <i class="fa-regular fa-copy"></i> Copy ID
            </button>
          </div>
          <h3 class="product-name">${item.name}</h3>
          <p class="product-desc">${item.desc}</p>
          ${isLowStock ? `<div style="font-size: 0.74rem; color: #D32F2F; font-weight: 600; margin-bottom: 8px;">🔥 Only ${item.stock} left in stock!</div>` : ''}
          <div class="card-actions">
            ${isOutOfStock 
              ? `<button class="add-cart-btn disabled" disabled style="opacity: 0.65; cursor: not-allowed; background: #6E5F57;"><i class="fa-solid fa-ban"></i> Sold Out</button>`
              : `<button class="add-cart-btn" onclick="addToCart('${item.id}')"><i class="fa-solid fa-bag-shopping"></i> Add to Bag</button>`
            }
            <a href="https://wa.me/918979660550?text=${waText}" target="_blank" class="wa-direct-btn" title="Quick WhatsApp Order">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Reset Filters
window.resetFilters = function() {
  currentFilter = 'all';
  searchQuery = '';
  if (searchInput) searchInput.value = '';
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === 'all');
  });
  renderProductsGrid();
};

// ==========================================================================
// CART FUNCTIONALITY
// ==========================================================================

window.addToCart = function(productId) {
  const item = (window.allProducts || []).find(p => p.id === productId);
  if (!item) return;

  const isOutOfStock = (item.inStock === false) || (typeof item.stock === 'number' && item.stock <= 0);
  if (isOutOfStock) {
    showToast(`Sorry, "${item.name}" is currently sold out!`);
    return;
  }

  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  saveCart();
  updateCartUI();
  openCartDrawer();
  showToast(`Added "${item.name}" to Bag!`);
};

function updateCartQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('adah_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  if (cartBadge) cartBadge.textContent = totalItems;
  if (cartDrawerCount) cartDrawerCount.textContent = totalItems;
  if (cartSubtotal) cartSubtotal.textContent = `₹${totalAmount}`;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
        <i class="fa-solid fa-bag-shopping" style="font-size: 2.5rem; margin-bottom: 12px; color: #D5C5B9;"></i>
        <p>Your shopping bag is empty.</p>
        <span style="font-size: 0.8rem;">Explore the catalogue to add your favourite pieces.</span>
      </div>
    `;
    return;
  }

  cartItemsContainer.innerHTML = cart.map(item => {
    let thumb = item.image ? `<img src="${item.image}" alt="${item.name}">` : getJewelleryArtSvg(item.category, item.name);
    return `
      <div class="cart-item">
        <div class="cart-item-img">${thumb}</div>
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-id">ID: ${item.id}</div>
          <div class="cart-item-price">₹${item.price} each</div>
          <div class="cart-qty-ctrl">
            <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
            <span style="font-size: 0.88rem; font-weight: 600;">${item.qty}</span>
            <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// WhatsApp Checkout
function checkoutViaWhatsApp() {
  if (cart.length === 0) {
    showToast('Your bag is empty! Add items first.');
    return;
  }

  let text = `*✨ NEW ORDER — ADAH JEWELS ✨*\n\n`;
  text += `Hi! I would like to place an order for the following items:\n\n`;

  let total = 0;
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    text += `${index + 1}. *${item.name}*\n   • Product ID: \`${item.id}\`\n   • Qty: ${item.qty} × ₹${item.price} = ₹${itemTotal}\n\n`;
  });

  text += `*💰 Total Bag Value:* ₹${total}\n\n`;
  text += `Please confirm availability and share payment details. Thank you!`;

  const waUrl = `https://wa.me/918979660550?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');
}

// Copy All IDs in Bag
function copyAllBagIds() {
  if (cart.length === 0) {
    showToast('Bag is empty!');
    return;
  }
  const idList = cart.map(i => `${i.id} (x${i.qty})`).join(', ');
  copyText(idList, 'All Product IDs copied to clipboard!');
}

// ==========================================================================
// WISHLIST FUNCTIONALITY
// ==========================================================================

window.toggleWishlist = function(productId) {
  const item = (window.allProducts || []).find(p => p.id === productId);
  if (!item) return;

  const idx = wishlist.indexOf(productId);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    showToast(`Removed from saved pieces.`);
  } else {
    wishlist.push(productId);
    showToast(`Saved "${item.name}" to favourites!`);
  }

  saveWishlist();
  updateWishlistUI();
  renderProductsGrid();
};

function saveWishlist() {
  localStorage.setItem('adah_wishlist', JSON.stringify(wishlist));
}

function updateWishlistUI() {
  if (wishlistBadge) wishlistBadge.textContent = wishlist.length;
  if (wishlistCount) wishlistCount.textContent = wishlist.length;

  if (wishlist.length === 0) {
    wishlistItemsContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
        <i class="fa-regular fa-heart" style="font-size: 2.5rem; margin-bottom: 12px; color: #D5C5B9;"></i>
        <p>No saved favourites yet.</p>
        <span style="font-size: 0.8rem;">Tap the heart icon on any piece to save it here.</span>
      </div>
    `;
    return;
  }

  const savedItems = (window.allProducts || []).filter(p => wishlist.includes(p.id));
  wishlistItemsContainer.innerHTML = savedItems.map(item => {
    let thumb = item.image ? `<img src="${item.image}" alt="${item.name}">` : getJewelleryArtSvg(item.category, item.name);
    return `
      <div class="cart-item">
        <div class="cart-item-img">${thumb}</div>
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-id">ID: ${item.id}</div>
          <div class="cart-item-price">₹${item.price}</div>
          <button class="btn-card-add" onclick="addToCart('${item.id}')" style="margin-top: 8px;">
            <i class="fa-solid fa-bag-shopping"></i> Move to Bag
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================================================
// DRAWERS & UTILITIES
// ==========================================================================

function openCartDrawer() {
  cartDrawer.classList.add('active');
  drawerOverlay.classList.add('active');
  wishlistDrawer.classList.remove('active');
}

function closeCartDrawer() {
  cartDrawer.classList.remove('active');
  drawerOverlay.classList.remove('active');
}

function openWishlistDrawer() {
  wishlistDrawer.classList.add('active');
  drawerOverlay.classList.add('active');
  cartDrawer.classList.remove('active');
}

function closeWishlistDrawer() {
  wishlistDrawer.classList.remove('active');
  drawerOverlay.classList.remove('active');
}

window.copyText = function(text, successMsg) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg || 'Copied to clipboard!');
  }).catch(() => {
    const input = document.createElement('textarea');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast(successMsg || 'Copied to clipboard!');
  });
};

window.showToast = function(message) {
  if (!toastMessage) return;
  toastMessage.innerHTML = `<i class="fa-solid fa-sparkles"></i> ${message}`;
  toastMessage.classList.add('show');
  setTimeout(() => {
    toastMessage.classList.remove('show');
  }, 3200);
};

// ==========================================================================
// EVENT LISTENERS
// ==========================================================================

function setupEventListeners() {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderProductsGrid();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderProductsGrid();
    });
  }

  if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
  if (wishlistToggleBtn) wishlistToggleBtn.addEventListener('click', openWishlistDrawer);
  if (closeWishlistBtn) closeWishlistBtn.addEventListener('click', closeWishlistDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', () => {
    closeCartDrawer();
    closeWishlistDrawer();
  });

  if (whatsappCheckoutBtn) whatsappCheckoutBtn.addEventListener('click', checkoutViaWhatsApp);
  if (copyAllIdsBtn) copyAllIdsBtn.addEventListener('click', copyAllBagIds);
}

// Start
document.addEventListener('DOMContentLoaded', initApp);
