// ==========================================================================
// ADAH JEWELS — ADMIN PRODUCT STUDIO & UPLOAD DASHBOARD
// ==========================================================================

let activeUploadedPhoto = '';
let editingProductId = null;

// DOM Elements
const dashboardModal = document.getElementById('dashboardModal');
const openDashboardBtn = document.getElementById('openDashboardBtn');
const floatingAddBtn = document.getElementById('floatingAddBtn');
const closeDashboardBtn = document.getElementById('closeDashboardBtn');

const tabUploadBtn = document.getElementById('tabUploadBtn');
const tabInventoryBtn = document.getElementById('tabInventoryBtn');
const uploadTabPane = document.getElementById('uploadTabPane');
const inventoryTabPane = document.getElementById('inventoryTabPane');

// Form Elements
const productForm = document.getElementById('productForm');
const dropzone = document.getElementById('dropzone');
const productPhotoInput = document.getElementById('productPhotoInput');
const imagePreviewOverlay = document.getElementById('imagePreviewOverlay');
const previewImg = document.getElementById('previewImg');
const removePhotoBtn = document.getElementById('removePhotoBtn');
const photoUrlInput = document.getElementById('photoUrlInput');
const applyUrlBtn = document.getElementById('applyUrlBtn');

const prodNameInput = document.getElementById('prodName');
const prodIdInput = document.getElementById('prodId');
const prodPriceInput = document.getElementById('prodPrice');
const prodCategorySelect = document.getElementById('prodCategory');
const prodTierSelect = document.getElementById('prodTier');
const prodDescInput = document.getElementById('prodDesc');
const featureInMarqueeToggle = document.getElementById('featureInMarquee');
const formSubmitBtn = document.getElementById('formSubmitBtn');
const resetFormBtn = document.getElementById('resetFormBtn');

// Inventory Elements
const inventorySearchInput = document.getElementById('inventorySearch');
const inventoryTableBody = document.getElementById('inventoryTableBody');
const inventoryTotalBadge = document.getElementById('inventoryTotalBadge');
const resetCatalogueBtn = document.getElementById('resetCatalogueBtn');
const exportCatalogueBtn = document.getElementById('exportCatalogueBtn');

// Initialize Dashboard
function initDashboard() {
  setupDashboardListeners();
  updateNextSuggestedId();
  renderInventoryTable();
}

// Event Listeners
function setupDashboardListeners() {
  // Modal open/close
  if (openDashboardBtn) openDashboardBtn.addEventListener('click', openDashboard);
  if (floatingAddBtn) floatingAddBtn.addEventListener('click', openDashboard);
  if (closeDashboardBtn) closeDashboardBtn.addEventListener('click', closeDashboard);

  dashboardModal.addEventListener('click', (e) => {
    if (e.target === dashboardModal) closeDashboard();
  });

  // Tab switching
  tabUploadBtn.addEventListener('click', () => switchTab('upload'));
  tabInventoryBtn.addEventListener('click', () => {
    switchTab('inventory');
    renderInventoryTable();
  });

  // File Dropzone
  dropzone.addEventListener('click', () => productPhotoInput.click());
  
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoFile(e.dataTransfer.files[0]);
    }
  });

  productPhotoInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoFile(e.target.files[0]);
    }
  });

  removePhotoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearPhotoPreview();
  });

  applyUrlBtn.addEventListener('click', () => {
    const url = photoUrlInput.value.trim();
    if (url) {
      setPhotoPreview(url);
      showToast('Image URL applied');
    }
  });

  // Price auto-suggests tier
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

  // Form Submit
  productForm.addEventListener('submit', handleProductFormSubmit);
  resetFormBtn.addEventListener('click', resetProductForm);

  // Inventory Table search
  if (inventorySearchInput) {
    inventorySearchInput.addEventListener('input', () => {
      renderInventoryTable(inventorySearchInput.value.trim());
    });
  }

  // Reset to original default
  if (resetCatalogueBtn) {
    resetCatalogueBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset the catalogue to the original 34 items? Any custom uploaded products will be cleared.')) {
        localStorage.removeItem('adah_custom_products');
        localStorage.removeItem('adah_custom_products_v2');
        window.loadProductsFromStorage();
        window.refreshStorefront();
        renderInventoryTable();
        showToast('Catalogue reset to original 34 items');
      }
    });
  }

  // Export JSON
  if (exportCatalogueBtn) {
    exportCatalogueBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.allProducts, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `adah_jewels_catalogue_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Catalogue JSON exported');
    });
  }
}

function openDashboard() {
  dashboardModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (!editingProductId) {
    updateNextSuggestedId();
  }
}

function closeDashboard() {
  dashboardModal.classList.remove('active');
  document.body.style.overflow = '';
}

function switchTab(tab) {
  if (tab === 'upload') {
    tabUploadBtn.classList.add('active');
    tabInventoryBtn.classList.remove('active');
    uploadTabPane.style.display = 'block';
    inventoryTabPane.style.display = 'none';
  } else {
    tabInventoryBtn.classList.add('active');
    tabUploadBtn.classList.remove('active');
    uploadTabPane.style.display = 'none';
    inventoryTabPane.style.display = 'block';
  }
}

// Photo Processing
function handlePhotoFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file (PNG, JPG, WEBP).');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    setPhotoPreview(e.target.result);
    showToast('Photo uploaded & preview ready');
  };
  reader.readAsDataURL(file);
}

function setPhotoPreview(dataUrl) {
  activeUploadedPhoto = dataUrl;
  previewImg.src = dataUrl;
  imagePreviewOverlay.classList.add('has-image');
}

function clearPhotoPreview() {
  activeUploadedPhoto = '';
  previewImg.src = '';
  imagePreviewOverlay.classList.remove('has-image');
  productPhotoInput.value = '';
  photoUrlInput.value = '';
}

function updateNextSuggestedId() {
  if (editingProductId) return;
  const count = (window.allProducts || []).length + 1;
  const pad = count < 10 ? `0${count}` : `${count}`;
  prodIdInput.value = `AJ-NEW-${pad}`;
}

// Form Submission
function handleProductFormSubmit(e) {
  e.preventDefault();

  const name = prodNameInput.value.trim();
  const id = prodIdInput.value.trim().toUpperCase();
  const price = parseFloat(prodPriceInput.value);
  const category = prodCategorySelect.value;
  const tier = prodTierSelect.value;
  const desc = prodDescInput.value.trim() || `${category} curated for everyday elegance.`;
  const featured = featureInMarqueeToggle.checked;

  if (!name || !id || isNaN(price)) {
    alert('Please fill out product name, ID, and price.');
    return;
  }

  const productData = {
    id,
    name,
    price,
    category,
    tier,
    image: activeUploadedPhoto || '',
    type: category.toLowerCase(),
    featured: featured,
    desc
  };

  if (editingProductId) {
    // Update existing
    const idx = window.allProducts.findIndex(p => p.id === editingProductId);
    if (idx !== -1) {
      window.allProducts[idx] = productData;
      showToast(`✨ Product "${name}" updated successfully!`);
    }
    editingProductId = null;
    formSubmitBtn.innerHTML = '<i class="fa-solid fa-sparkles"></i> Publish to Live Storefront';
  } else {
    // Check ID conflict
    const exists = window.allProducts.find(p => p.id === id);
    if (exists) {
      alert(`Product ID "${id}" already exists. Please choose a unique ID.`);
      return;
    }
    // Prepend to show at top
    window.allProducts.unshift(productData);
    showToast(`✨ "${name}" published & added to Running Showcase!`);
  }

  // Save to localStorage
  window.saveProductsToStorage();

  // Refresh Storefront
  window.refreshStorefront();

  // Reset form
  resetProductForm();

  // Switch to inventory or close
  renderInventoryTable();
}

function resetProductForm() {
  productForm.reset();
  clearPhotoPreview();
  editingProductId = null;
  formSubmitBtn.innerHTML = '<i class="fa-solid fa-sparkles"></i> Publish to Live Storefront';
  featureInMarqueeToggle.checked = true;
  updateNextSuggestedId();
}

// Render Inventory Table
function renderInventoryTable(search = '') {
  if (!inventoryTableBody) return;
  
  const products = (window.allProducts || []).filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.id.toLowerCase().includes(s) || p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s);
  });

  if (inventoryTotalBadge) {
    inventoryTotalBadge.textContent = `${window.allProducts.length} Items`;
  }

  if (products.length === 0) {
    inventoryTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">
          No items found matching "${search}".
        </td>
      </tr>
    `;
    return;
  }

  inventoryTableBody.innerHTML = products.map(item => {
    let thumbHtml = '';
    if (item.image) {
      thumbHtml = `<img src="${item.image}" alt="${item.name}" class="table-thumb">`;
    } else {
      thumbHtml = `<div class="table-thumb">${getJewelleryArtSvg(item.category, item.name)}</div>`;
    }

    return `
      <tr>
        <td>${thumbHtml}</td>
        <td><strong>${item.id}</strong></td>
        <td>
          <div style="font-weight: 600; color: var(--wine-dark);">${item.name}</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.desc}</div>
        </td>
        <td><span style="background: #F4EBE3; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">${item.category}</span></td>
        <td><strong style="color: var(--wine-dark);">₹${item.price}</strong></td>
        <td>
          ${item.featured 
            ? '<span style="color: #25D366; font-size: 0.78rem; font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Active</span>' 
            : '<span style="color: var(--text-muted); font-size: 0.78rem;">Inactive</span>'}
        </td>
        <td>
          <div class="table-actions">
            <button class="btn-tbl-edit" onclick="editProductFromDashboard('${item.id}')" title="Edit Product">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button class="btn-tbl-del" onclick="deleteProductFromDashboard('${item.id}')" title="Delete Product">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Edit Trigger
window.editProductFromDashboard = function(id) {
  const item = (window.allProducts || []).find(p => p.id === id);
  if (!item) return;

  editingProductId = item.id;
  prodNameInput.value = item.name;
  prodIdInput.value = item.id;
  prodPriceInput.value = item.price;
  prodCategorySelect.value = item.category;
  prodTierSelect.value = item.tier;
  prodDescInput.value = item.desc;
  featureInMarqueeToggle.checked = !!item.featured;

  if (item.image) {
    setPhotoPreview(item.image);
  } else {
    clearPhotoPreview();
  }

  formSubmitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes to Live Store';
  switchTab('upload');
  uploadTabPane.scrollIntoView({ behavior: 'smooth' });
  showToast(`Editing product: ${item.name}`);
};

// Delete Trigger
window.deleteProductFromDashboard = function(id) {
  const item = (window.allProducts || []).find(p => p.id === id);
  if (!item) return;

  if (confirm(`Are you sure you want to delete "${item.name}" (${item.id}) from the catalogue?`)) {
    window.allProducts = window.allProducts.filter(p => p.id !== id);
    window.saveProductsToStorage();
    window.refreshStorefront();
    renderInventoryTable();
    showToast(`Deleted product: ${item.name}`);
  }
};

// Initialize once DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);
