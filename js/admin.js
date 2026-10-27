// ==========================================================================
// ADAH JEWELS — ADMIN & STOCK MANAGEMENT PORTAL SCRIPT
// Complete E-Commerce Inventory Control, Photo Upload & Stock Editor
// ==========================================================================

const MASTER_STORAGE_KEY = 'ADAH_LIVE_PRODUCTS_V1';

let adminProducts = [];
let activePhotoData = '';
let editingItemId = null;
let itemPendingDeleteId = null;
let activeDeletingId = null;
let currentStockFilter = 'all';

// Sync Channel for real-time multi-tab synchronization
const syncChannel = window.BroadcastChannel ? new BroadcastChannel('adah_catalogue_sync') : null;

// DOM Elements
const menuItems = document.querySelectorAll('.menu-item');
const tabPanes = document.querySelectorAll('.tab-pane');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');

// Form Elements
const adminProductForm = document.getElementById('adminProductForm');
const adminDropzone = document.getElementById('adminDropzone');
const adminFileInput = document.getElementById('adminFileInput');
const previewOverlay = document.getElementById('previewOverlay');
const photoPreviewImg = document.getElementById('photoPreviewImg');
const btnRemovePreview = document.getElementById('btnRemovePreview');
const adminPhotoUrl = document.getElementById('adminPhotoUrl');
const btnApplyUrl = document.getElementById('btnApplyUrl');

const prodNameInput = document.getElementById('prodName');
const prodIdInput = document.getElementById('prodId');
const prodPriceInput = document.getElementById('prodPrice');
const prodStockInput = document.getElementById('prodStock');
const prodCategorySelect = document.getElementById('prodCategory');
const prodTierSelect = document.getElementById('prodTier');
const prodDescInput = document.getElementById('prodDesc');
const featureInShowcaseToggle = document.getElementById('featureInShowcase');
const activeInStockToggle = document.getElementById('activeInStock');
const btnSubmitProduct = document.getElementById('btnSubmitProduct');
const formSectionTitle = document.getElementById('formSectionTitle');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Delete Modal Elements
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const deleteItemTitle = document.getElementById('deleteItemTitle');
const deleteItemMessage = document.getElementById('deleteItemMessage');
const btnExecuteDelete = document.getElementById('btnExecuteDelete');

// Tables & Filters
const quickStockTableBody = document.getElementById('quickStockTableBody');
const fullInventoryTableBody = document.getElementById('fullInventoryTableBody');
const inventorySearch = document.getElementById('inventorySearch');
const categoryFilterSelect = document.getElementById('categoryFilterSelect');
const adminToast = document.getElementById('adminToast');

// ==========================================================================
// INITIALIZATION & PERSISTENCE
// ==========================================================================

function initAdminPortal() {
  loadAdminProducts();
  setupNavigation();
  setupFormHandlers();
  setupDeleteModal();
  updateKPIs();
  renderQuickStockTable();
  renderInventoryTable();
  updateSuggestedSku();

  // Asynchronous server database sync
  syncWithServer();

  // Listen for changes from other tabs
  if (syncChannel) {
    syncChannel.onmessage = (e) => {
      if (e.data && e.data.type === 'CATALOGUE_CHANGED' && e.data.sender !== 'admin') {
        adminProducts = e.data.products;
        updateKPIs();
        renderQuickStockTable();
        renderInventoryTable();
      }
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key === MASTER_STORAGE_KEY && e.newValue) {
      try {
        adminProducts = JSON.parse(e.newValue);
        updateKPIs();
        renderQuickStockTable();
        renderInventoryTable();
      } catch (err) {}
    }
  });

  // Re-sync when returning to tab
  window.addEventListener('focus', () => {
    syncWithServer();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncWithServer();
    }
  });

  // Multi-laptop real-time polling sync (every 4 seconds)
  setInterval(() => {
    syncWithServer();
  }, 4000);
}

async function syncWithServer() {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const serverProducts = await res.json();
      if (Array.isArray(serverProducts)) {
        adminProducts = serverProducts;
        try {
          localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(adminProducts));
        } catch (e) {}
        updateKPIs();
        renderQuickStockTable();
        renderInventoryTable();
      }
    }
  } catch (err) {}
}

function loadAdminProducts() {
  // Purge legacy storage keys completely
  ['ADAH_MASTER_CATALOGUE', 'adah_custom_products', 'adah_custom_products_v2'].forEach(k => {
    try { localStorage.removeItem(k); } catch (e) {}
  });

  const saved = localStorage.getItem(MASTER_STORAGE_KEY);

  if (saved !== null) {
    try {
      const parsed = JSON.parse(saved);
      adminProducts = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      adminProducts = [];
    }
  } else {
    adminProducts = [];
  }

  // Ensure stock fields exist on any custom items
  adminProducts.forEach(item => {
    if (typeof item.stock !== 'number') item.stock = 15;
    if (typeof item.inStock !== 'boolean') item.inStock = item.stock > 0;
    if (typeof item.featured !== 'boolean') item.featured = true;
  });
}

function initializeFromDefaults() {
  return [];
}

function saveAdminProducts(notify = true) {
  const jsonStr = JSON.stringify(adminProducts);
  try {
    localStorage.setItem(MASTER_STORAGE_KEY, jsonStr);
  } catch (err) {
    console.warn('localStorage storage quota reached:', err);
    try {
      // Fallback: save without oversized image payloads
      const fallbackItems = adminProducts.map(p => ({
        ...p,
        image: (p.image && p.image.length > 500000) ? '' : p.image
      }));
      localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(fallbackItems));
    } catch (e2) {}
  }

  if (notify && syncChannel) {
    try {
      syncChannel.postMessage({ type: 'CATALOGUE_CHANGED', products: adminProducts, sender: 'admin' });
    } catch (e) {}
  }

  // Backend sync
  fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: jsonStr
  }).catch(() => {});
}

// ==========================================================================
// NAVIGATION & TABS
// ==========================================================================

function setupNavigation() {
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      switchAdminTab(tab);
    });
  });
}

window.switchAdminTab = function(tabName) {
  menuItems.forEach(i => i.classList.toggle('active', i.dataset.tab === tabName));
  tabPanes.forEach(pane => pane.classList.toggle('active', pane.id === `pane-${tabName}`));

  if (tabName === 'overview') {
    pageTitle.textContent = 'Inventory & Stock Dashboard';
    pageSubtitle.textContent = 'Real-time catalogue overview and key business metrics';
    updateKPIs();
    renderQuickStockTable();
  } else if (tabName === 'inventory') {
    pageTitle.textContent = 'Inventory Catalogue Control';
    pageSubtitle.textContent = 'Search, monitor stock levels, and update piece details';
    renderInventoryTable();
  } else if (tabName === 'add-product') {
    if (!editingItemId) {
      pageTitle.textContent = 'Product Studio';
      pageSubtitle.textContent = 'Upload photos, create new pieces and publish to live store';
    }
  } else if (tabName === 'orders') {
    pageTitle.textContent = 'WhatsApp Inquiries & Orders';
    pageSubtitle.textContent = 'Customer purchase orders submitted via WhatsApp';
  } else if (tabName === 'settings') {
    pageTitle.textContent = 'Data Backup & System';
    pageSubtitle.textContent = 'Export JSON backups or reset database';
  }
};

// ==========================================================================
// KPI CALCULATIONS
// ==========================================================================

function updateKPIs() {
  const totalItems = adminProducts.length;
  const showcasedItems = adminProducts.filter(p => p.featured !== false);
  const hiddenItems = totalItems - showcasedItems.length;
  const totalStockUnits = adminProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockItems = adminProducts.filter(p => (p.stock || 0) <= 5 && (p.stock || 0) > 0);
  const outOfStockItems = adminProducts.filter(p => (p.stock || 0) === 0 || p.inStock === false);
  const totalValuation = adminProducts.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);

  const categories = new Set(adminProducts.map(p => p.category)).size;

  const kpiTotal = document.getElementById('kpiTotalProducts');
  if (kpiTotal) kpiTotal.textContent = totalItems;

  const kpiCat = document.getElementById('kpiCategoriesCount');
  if (kpiCat) {
    kpiCat.textContent = `${showcasedItems.length} Showcased Live • ${hiddenItems} Off Showcase`;
  }

  const kpiStock = document.getElementById('kpiTotalStockUnits');
  if (kpiStock) kpiStock.textContent = `${totalStockUnits} Units`;
  
  const inStockRate = totalItems > 0 ? Math.round(((totalItems - outOfStockItems.length) / totalItems) * 100) : 0;
  const kpiRate = document.getElementById('kpiInStockRate');
  if (kpiRate) kpiRate.textContent = `${inStockRate}% Availability Rate`;

  const kpiLow = document.getElementById('kpiLowStockCount');
  if (kpiLow) kpiLow.textContent = `${lowStockItems.length + outOfStockItems.length}`;

  const kpiLowNote = document.getElementById('kpiLowStockNote');
  if (kpiLowNote) kpiLowNote.textContent = `${outOfStockItems.length} Sold Out | ${lowStockItems.length} Low`;

  const kpiVal = document.getElementById('kpiTotalValue');
  if (kpiVal) kpiVal.textContent = `₹${totalValuation.toLocaleString('en-IN')}`;
}

// ==========================================================================
// TABLES RENDERING
// ==========================================================================

function getThumbHtml(item) {
  if (item.image) {
    return `<div class="item-thumb-box"><img src="${item.image}" alt="${item.name}"></div>`;
  }
  return `<div class="item-thumb-box">${getJewelleryArtSvg(item.category, item.name)}</div>`;
}

function getStatusBadge(item) {
  const stock = item.stock || 0;
  if (!item.inStock || stock === 0) {
    return `<span class="badge-status out-of-stock"><i class="fa-solid fa-circle-xmark"></i> Sold Out</span>`;
  } else if (stock <= 5) {
    return `<span class="badge-status low-stock"><i class="fa-solid fa-triangle-exclamation"></i> Low (${stock})</span>`;
  }
  return `<span class="badge-status in-stock"><i class="fa-solid fa-circle-check"></i> In Stock (${stock})</span>`;
}

function renderQuickStockTable() {
  if (!quickStockTableBody) return;

  if (adminProducts.length === 0) {
    quickStockTableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 48px 20px; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 8px; color: var(--accent-taupe);"><i class="fa-solid fa-gem"></i></div>
          <div style="font-weight: 600; color: var(--text-dark); margin-bottom: 4px;">Your inventory is currently empty</div>
          <div style="font-size: 0.82rem; margin-bottom: 14px;">Add your own products in the "Add New Product" tab to start managing stock.</div>
          <button class="btn-primary-action" onclick="switchAdminTab('add-product')" style="margin: 0 auto; display: inline-flex;">
            <i class="fa-solid fa-plus"></i> Add Your First Piece
          </button>
        </td>
      </tr>
    `;
    return;
  }

  const displayItems = adminProducts.slice(0, 10);

  quickStockTableBody.innerHTML = displayItems.map(item => `
    <tr>
      <td>${getThumbHtml(item)}</td>
      <td><strong>${item.id}</strong></td>
      <td>
        <div style="font-weight: 600; color: var(--text-dark);">${item.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.desc}</div>
      </td>
      <td><span style="font-size: 0.78rem; font-weight: 600;">${item.category}</span></td>
      <td><strong style="color: var(--accent-taupe);">₹${item.price}</strong></td>
      <td>
        <div class="stock-stepper">
          <button class="btn-step" onclick="changeStock('${item.id}', -1)">-</button>
          <input type="text" class="stock-value-input" value="${item.stock || 0}" onchange="setStockManual('${item.id}', this.value)">
          <button class="btn-step" onclick="changeStock('${item.id}', 1)">+</button>
        </div>
      </td>
      <td>${getStatusBadge(item)}</td>
      <td>
        <div class="showcase-cell-wrap">
          <label class="switch-toggle" title="Toggle Showcase (On = Live on Storefront, Off = Hidden)">
            <input type="checkbox" ${item.featured !== false ? 'checked' : ''} onchange="toggleShowcaseFeature('${item.id}')">
            <span class="toggle-slider"></span>
          </label>
          <span class="showcase-tag ${item.featured !== false ? 'tag-live' : 'tag-off'}">
            ${item.featured !== false ? 'Showcased' : 'Off Showcase'}
          </span>
        </div>
      </td>
    </tr>
  `).join('');
}

window.setStockFilter = function(filter, btn) {
  currentStockFilter = filter;
  document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderInventoryTable();
};

function renderInventoryTable() {
  if (!fullInventoryTableBody) return;

  const searchQuery = (inventorySearch ? inventorySearch.value.trim().toLowerCase() : '');
  const selectedCat = (categoryFilterSelect ? categoryFilterSelect.value : 'all');

  const filtered = adminProducts.filter(item => {
    // Search
    const matchesSearch = !searchQuery || 
      item.id.toLowerCase().includes(searchQuery) || 
      item.name.toLowerCase().includes(searchQuery) ||
      item.category.toLowerCase().includes(searchQuery);

    // Category
    const matchesCategory = (selectedCat === 'all') || 
      (item.category.toLowerCase().includes(selectedCat.toLowerCase()));

    // Stock & Showcase Filter
    let matchesStock = true;
    const s = item.stock || 0;
    if (currentStockFilter === 'showcased') {
      matchesStock = item.featured !== false;
    } else if (currentStockFilter === 'offshowcase') {
      matchesStock = item.featured === false;
    } else if (currentStockFilter === 'instock') {
      matchesStock = item.inStock && s > 0;
    } else if (currentStockFilter === 'low') {
      matchesStock = item.inStock && s > 0 && s <= 5;
    } else if (currentStockFilter === 'outofstock') {
      matchesStock = !item.inStock || s === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  if (filtered.length === 0) {
    fullInventoryTableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 48px 20px; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 8px; color: var(--accent-taupe);"><i class="fa-solid fa-gem"></i></div>
          <div style="font-weight: 600; color: var(--text-dark); margin-bottom: 4px;">No jewellery products in catalogue</div>
          <div style="font-size: 0.82rem; margin-bottom: 14px;">Only the pieces you add will appear in inventory and on the storefront.</div>
          <button class="btn-primary-action" onclick="switchAdminTab('add-product')" style="margin: 0 auto; display: inline-flex;">
            <i class="fa-solid fa-plus"></i> Add New Product
          </button>
        </td>
      </tr>
    `;
    return;
  }

  fullInventoryTableBody.innerHTML = filtered.map(item => {
    const isDeletingThis = activeDeletingId === item.id;

    return `
    <tr id="row-${item.id}">
      <td>${getThumbHtml(item)}</td>
      <td><strong>${item.id}</strong></td>
      <td>
        <div style="font-weight: 600; color: var(--text-dark);">${item.name}</div>
        <div style="font-size: 0.74rem; color: var(--text-muted); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.desc}</div>
      </td>
      <td><span style="font-size: 0.78rem; font-weight: 600; background: #F4EBE3; padding: 3px 8px; border-radius: 4px;">${item.category}</span></td>
      <td><strong style="color: var(--accent-taupe);">₹${item.price}</strong></td>
      <td>
        <div class="stock-stepper">
          <button class="btn-step" onclick="changeStock('${item.id}', -1)">-</button>
          <input type="text" class="stock-value-input" value="${item.stock || 0}" onchange="setStockManual('${item.id}', this.value)">
          <button class="btn-step" onclick="changeStock('${item.id}', 1)">+</button>
        </div>
      </td>
      <td>${getStatusBadge(item)}</td>
      <td>
        <div class="showcase-cell-wrap">
          <label class="switch-toggle" title="Toggle Showcase (On = Live on Storefront, Off = Hidden)">
            <input type="checkbox" ${item.featured !== false ? 'checked' : ''} onchange="toggleShowcaseFeature('${item.id}')">
            <span class="toggle-slider"></span>
          </label>
          <span class="showcase-tag ${item.featured !== false ? 'tag-live' : 'tag-off'}">
            ${item.featured !== false ? 'Showcased' : 'Off Showcase'}
          </span>
        </div>
      </td>
      <td>
        ${isDeletingThis ? `
          <div class="inline-delete-confirm">
            <span class="delete-confirm-prompt">Delete?</span>
            <button class="btn-del-confirm-yes" onclick="executeDeleteDirect('${item.id}')" title="Permanently delete ${item.id}">
              <i class="fa-solid fa-trash-can"></i> Yes
            </button>
            <button class="btn-del-confirm-no" onclick="cancelDeletePrompt()" title="Cancel">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        ` : `
          <div class="action-buttons">
            <button class="btn-icon-action" onclick="editProduct('${item.id}')" title="Edit Product Details">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon-action btn-icon-del" onclick="promptDeleteProduct('${item.id}')" title="Delete Product">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        `}
      </td>
    </tr>
  `;
  }).join('');
}

// Live Stock Adjustments
window.changeStock = function(id, delta) {
  const item = adminProducts.find(p => p.id === id);
  if (!item) return;

  item.stock = Math.max(0, (item.stock || 0) + delta);
  item.inStock = item.stock > 0;

  saveAdminProducts();
  updateKPIs();
  renderQuickStockTable();
  renderInventoryTable();
  showToast(`Stock updated for ${item.name}: ${item.stock} units`);
};

window.setStockManual = function(id, val) {
  const item = adminProducts.find(p => p.id === id);
  if (!item) return;

  const num = parseInt(val, 10);
  item.stock = isNaN(num) || num < 0 ? 0 : num;
  item.inStock = item.stock > 0;

  saveAdminProducts();
  updateKPIs();
  renderQuickStockTable();
  renderInventoryTable();
  showToast(`Stock set to ${item.stock} for ${item.name}`);
};

// SHOWCASE TOGGLE (OFF/ON)
window.toggleShowcaseFeature = function(id) {
  const item = adminProducts.find(p => p.id === id);
  if (!item) return;

  // Toggle boolean
  item.featured = (item.featured === false ? true : false);
  
  saveAdminProducts();
  updateKPIs();
  renderQuickStockTable();
  renderInventoryTable();
  
  const statusMsg = item.featured 
    ? `✨ "${item.name}" enabled & live on Storefront.` 
    : `👁️‍🗨️ "${item.name}" taken off showcase (hidden from storefront).`;
  showToast(statusMsg);
};

// ==========================================================================
// FAIL-PROOF DELETE LOGIC (INLINE 1-CLICK CONFIRM + MODAL)
// ==========================================================================

function setupDeleteModal() {
  if (btnExecuteDelete) {
    btnExecuteDelete.addEventListener('click', () => {
      executeDeleteDirect();
    });
  }
  if (deleteConfirmModal) {
    deleteConfirmModal.addEventListener('click', (e) => {
      if (e.target === deleteConfirmModal) closeDeleteModal();
    });
  }
}

window.promptDeleteProduct = function(id) {
  const item = adminProducts.find(p => p.id === id);
  if (!item) return;

  activeDeletingId = id;
  itemPendingDeleteId = id;

  if (deleteItemTitle) deleteItemTitle.textContent = `Delete "${item.name}"?`;
  if (deleteItemMessage) deleteItemMessage.textContent = `Are you sure you want to permanently remove ${item.name} (${item.id}) from your store catalogue?`;
  
  if (deleteConfirmModal) {
    deleteConfirmModal.classList.add('active');
  }

  // Re-render inventory table to display inline confirmation strip immediately
  renderInventoryTable();
};

window.cancelDeletePrompt = function() {
  activeDeletingId = null;
  itemPendingDeleteId = null;
  if (deleteConfirmModal) {
    deleteConfirmModal.classList.remove('active');
  }
  renderInventoryTable();
};

window.closeDeleteModal = function() {
  activeDeletingId = null;
  itemPendingDeleteId = null;
  if (deleteConfirmModal) {
    deleteConfirmModal.classList.remove('active');
  }
  renderInventoryTable();
};

window.executeDeleteDirect = function(id) {
  const targetId = id || activeDeletingId || itemPendingDeleteId;
  if (!targetId) return;

  const deletedItem = adminProducts.find(p => p.id === targetId);
  const deletedName = deletedItem ? deletedItem.name : targetId;

  // Filter out permanently
  adminProducts = adminProducts.filter(p => p.id !== targetId);
  activeDeletingId = null;
  itemPendingDeleteId = null;

  if (deleteConfirmModal) {
    deleteConfirmModal.classList.remove('active');
  }

  saveAdminProducts();
  updateKPIs();
  renderQuickStockTable();
  renderInventoryTable();
  showToast(`🗑️ "${deletedName}" has been permanently deleted.`);
};

// ==========================================================================
// ADD & EDIT PRODUCT FORM
// ==========================================================================

function setupFormHandlers() {
  if (inventorySearch) {
    inventorySearch.addEventListener('input', renderInventoryTable);
  }

  // Dropzone
  adminDropzone.addEventListener('click', () => adminFileInput.click());
  adminDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    adminDropzone.classList.add('dragover');
  });
  adminDropzone.addEventListener('dragleave', () => adminDropzone.classList.remove('dragover'));
  adminDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    adminDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  });

  adminFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  });

  btnRemovePreview.addEventListener('click', (e) => {
    e.stopPropagation();
    clearPhotoPreview();
  });

  btnApplyUrl.addEventListener('click', () => {
    const url = adminPhotoUrl.value.trim();
    if (url) {
      setPhotoPreview(url);
      showToast('Image URL applied');
    }
  });

  // Price tier auto-select
  prodPriceInput.addEventListener('input', () => {
    const p = parseFloat(prodPriceInput.value);
    if (!isNaN(p)) {
      if (p <= 50) prodTierSelect.value = '₹50';
      else if (p <= 60) prodTierSelect.value = '₹60';
      else if (p <= 100) prodTierSelect.value = '₹100';
      else if (p <= 120) prodTierSelect.value = '₹120';
      else prodTierSelect.value = 'Luxury';
    }
  });

  adminProductForm.addEventListener('submit', handleFormSubmit);
}

function handleImageFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file (PNG, JPG, WEBP).');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const rawData = e.target.result;
    const img = new Image();
    img.onload = () => {
      const maxDim = 800;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const compressedData = canvas.toDataURL('image/jpeg', 0.85);
      setPhotoPreview(compressedData);
      showToast('Photo uploaded and preview ready');
    };
    img.onerror = () => {
      setPhotoPreview(rawData);
      showToast('Photo uploaded and preview ready');
    };
    img.src = rawData;
  };
  reader.readAsDataURL(file);
}

function setPhotoPreview(url) {
  activePhotoData = url;
  photoPreviewImg.src = url;
  previewOverlay.classList.add('active');
}

function clearPhotoPreview() {
  activePhotoData = '';
  photoPreviewImg.src = '';
  previewOverlay.classList.remove('active');
  adminFileInput.value = '';
  adminPhotoUrl.value = '';
}

function updateSuggestedSku() {
  if (editingItemId) return;
  const count = adminProducts.length + 1;
  const pad = count < 10 ? `0${count}` : `${count}`;
  prodIdInput.value = `ADAH-${pad}`;
}

function handleFormSubmit(e) {
  e.preventDefault();

  const name = prodNameInput.value.trim();
  const id = prodIdInput.value.trim().toUpperCase();
  const price = parseFloat(prodPriceInput.value);
  const stock = parseInt(prodStockInput.value, 10) || 0;
  const category = prodCategorySelect.value;
  const tier = prodTierSelect.value;
  const desc = prodDescInput.value.trim() || `${category} designed for effortless everyday elegance.`;
  const featured = featureInShowcaseToggle.checked;
  const inStock = activeInStockToggle.checked && (stock > 0);

  if (!name || !id || isNaN(price)) {
    alert('Please fill out Product Name, SKU ID, and Price.');
    return;
  }

  const itemPayload = {
    id,
    name,
    price,
    stock,
    inStock,
    category,
    tier,
    image: activePhotoData || '',
    type: category.toLowerCase(),
    featured,
    desc
  };

  if (editingItemId) {
    const idx = adminProducts.findIndex(p => p.id === editingItemId);
    if (idx !== -1) {
      adminProducts[idx] = itemPayload;
      showToast(`✨ Product "${name}" updated successfully!`);
    }
    cancelEditing();
  } else {
    if (adminProducts.some(p => p.id === id)) {
      alert(`Product SKU "${id}" already exists. Please enter a unique SKU.`);
      return;
    }
    adminProducts.unshift(itemPayload);
    showToast(`✨ "${name}" published & live on storefront!`);
    resetProductForm();
  }

  saveAdminProducts();
  updateKPIs();
  renderQuickStockTable();
  renderInventoryTable();

  // Switch to inventory tab so the user immediately sees the piece in the table!
  switchAdminTab('inventory');
}

window.editProduct = function(id) {
  const item = adminProducts.find(p => p.id === id);
  if (!item) return;

  editingItemId = item.id;
  prodNameInput.value = item.name;
  prodIdInput.value = item.id;
  prodPriceInput.value = item.price;
  prodStockInput.value = item.stock || 0;
  prodCategorySelect.value = item.category;
  prodTierSelect.value = item.tier;
  prodDescInput.value = item.desc;
  featureInShowcaseToggle.checked = !!item.featured;
  activeInStockToggle.checked = item.inStock !== false;

  if (item.image) {
    setPhotoPreview(item.image);
  } else {
    clearPhotoPreview();
  }

  formSectionTitle.textContent = `Edit Product: ${item.name} (${item.id})`;
  btnSubmitProduct.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes to Live Store';
  cancelEditBtn.style.display = 'inline-flex';

  switchAdminTab('add-product');
};

window.cancelEditing = function() {
  editingItemId = null;
  resetProductForm();
  formSectionTitle.textContent = 'Upload New Jewellery Product';
  btnSubmitProduct.innerHTML = '<i class="fa-solid fa-sparkles"></i> Publish to Live Storefront';
  cancelEditBtn.style.display = 'none';
};

window.resetProductForm = function() {
  adminProductForm.reset();
  clearPhotoPreview();
  featureInShowcaseToggle.checked = true;
  activeInStockToggle.checked = true;
  updateSuggestedSku();
};

// ==========================================================================
// BACKUP & FACTORY RESET
// ==========================================================================

window.exportCatalogueData = function() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(adminProducts, null, 2));
  const a = document.createElement('a');
  a.setAttribute("href", dataStr);
  a.setAttribute("download", `adah_jewels_inventory_backup_${Date.now()}.json`);
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast('Catalogue JSON Backup Downloaded');
};

window.clearAllCatalogueProducts = function() {
  if (confirm('Are you sure you want to remove ALL products from your inventory and store? This action cannot be undone.')) {
    adminProducts = [];
    saveAdminProducts(true);
    updateKPIs();
    renderQuickStockTable();
    renderInventoryTable();
    showToast('All inventory items removed permanently.');
  }
};
window.resetCatalogueToDefaults = window.clearAllCatalogueProducts;

function showToast(msg) {
  if (!adminToast) return;
  adminToast.innerHTML = `<i class="fa-solid fa-sparkles"></i> ${msg}`;
  adminToast.classList.add('show');
  setTimeout(() => adminToast.classList.remove('show'), 3200);
}

// ==========================================================================
// AUTHENTICATION SYSTEM (Username: somya, Password: gunshika)
// ==========================================================================

const ADMIN_AUTH_KEY = 'adah_admin_auth_session';
const authGateOverlay = document.getElementById('authGateOverlay');
const authErrorMsg = document.getElementById('authErrorMsg');
let portalInitialized = false;

function checkAuthentication() {
  const isAuth = sessionStorage.getItem(ADMIN_AUTH_KEY) === 'somya_authenticated';
  
  if (isAuth) {
    if (authGateOverlay) authGateOverlay.classList.add('authenticated');
    initAdminPortal();
  } else {
    if (authGateOverlay) authGateOverlay.classList.remove('authenticated');
    const uInput = document.getElementById('authUsername');
    if (uInput) setTimeout(() => uInput.focus(), 150);
  }
}

window.handleAdminLogin = function(e) {
  if (e) e.preventDefault();

  const user = (document.getElementById('authUsername')?.value || '').trim().toLowerCase();
  const pass = (document.getElementById('authPassword')?.value || '').trim();

  if (user === 'somya' && pass === 'gunshika') {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'somya_authenticated');
    if (authErrorMsg) authErrorMsg.style.display = 'none';
    if (authGateOverlay) authGateOverlay.classList.add('authenticated');
    
    initAdminPortal();
    showToast('✨ Welcome Somya! Studio Admin Portal unlocked.');
  } else {
    if (authErrorMsg) {
      authErrorMsg.style.display = 'flex';
      const card = document.querySelector('.auth-gate-card');
      if (card) {
        card.style.animation = 'none';
        void card.offsetWidth;
        card.style.animation = 'shakeError 0.3s ease-in-out';
      }
    }
  }
};

window.handleAdminLogout = function() {
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
  if (authGateOverlay) {
    authGateOverlay.classList.remove('authenticated');
  }
  const passInput = document.getElementById('authPassword');
  if (passInput) passInput.value = '';
  if (authErrorMsg) authErrorMsg.style.display = 'none';
  showToast('🔒 Studio portal locked. Signed out successfully.');
};

window.toggleAuthPassword = function() {
  const pwInput = document.getElementById('authPassword');
  const icon = document.getElementById('pwToggleIcon');
  if (!pwInput || !icon) return;

  if (pwInput.type === 'password') {
    pwInput.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    pwInput.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
};

document.addEventListener('DOMContentLoaded', checkAuthentication);
