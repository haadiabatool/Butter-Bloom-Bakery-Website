import { bakeryCategoriesData } from "./data.js";

// Shared storage keys with profile.js
const KEYS = {
  USER: "bakery_auth_user_v1",
  ORDERS: "bakery_orders_v1",
  WISHLIST: "bakery_wishlist_v1",
  OPEN_LOGIN: "bakery_open_login_v1",
};

// DOM Elements
const navProfileBtn = document.getElementById("navProfileBtn");
const navProfileImg = document.getElementById("navProfileImg");
const navProfileIcon = document.getElementById("navProfileIcon");

const catEyebrow = document.getElementById("catEyebrow");
const catHeroTitle = document.getElementById("catHeroTitle");
const catHeroDesc = document.getElementById("catHeroDesc");

const catSearchInput = document.getElementById("catSearchInput");
const filterCategoryList = document.getElementById("filterCategoryList");
const priceFilterSelect = document.getElementById("priceFilterSelect");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");

const catResultsCount = document.getElementById("catResultsCount");
const productsGrid = document.getElementById("productsGrid");

// Order & Login Prompt Modals
const orderModal = document.getElementById("orderModal");
const orderModalBackdrop = document.getElementById("orderModalBackdrop");
const closeOrderModalBtn = document.getElementById("closeOrderModalBtn");
const placeOrderForm = document.getElementById("placeOrderForm");
const orderItemImg = document.getElementById("orderItemImg");
const orderItemName = document.getElementById("orderItemName");
const orderItemUnitPrice = document.getElementById("orderItemUnitPrice");
const orderQtyInput = document.getElementById("orderQty");
const orderNoteInput = document.getElementById("orderNote");
const orderCalculatedTotal = document.getElementById("orderCalculatedTotal");

const loginPromptModal = document.getElementById("loginPromptModal");
const loginPromptBackdrop = document.getElementById("loginPromptBackdrop");
const closeLoginPromptBtn = document.getElementById("closeLoginPromptBtn");
const cancelLoginPromptBtn = document.getElementById("cancelLoginPromptBtn");
const goToProfileLoginBtn = document.getElementById("goToProfileLoginBtn");

const bkToast = document.getElementById("bkToast");

let currentCategoryKey = "cakes";
let activeOrderProduct = null;
let toastTimer = null;

// STORAGE & PARSING HELPERS

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getWishlist() {
  try {
    const raw = localStorage.getItem(KEYS.WISHLIST);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWishlist(list) {
  localStorage.setItem(KEYS.WISHLIST, JSON.stringify(list));
}

function getOrders() {
  try {
    const raw = localStorage.getItem(KEYS.ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOrders(list) {
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(list));
}

function parseNumericPrice(priceStr) {
  const digits = String(priceStr || "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function formatRs(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showToast(message) {
  if (!bkToast) return;
  bkToast.textContent = message;
  bkToast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    bkToast.hidden = true;
  }, 2600);
}

// NAVBAR AVATAR SYNC
function syncNavbarProfile() {
  const user = getCurrentUser();
  if (!navProfileBtn || !navProfileImg || !navProfileIcon) return;

  if (user && user.avatar) {
    navProfileImg.src = user.avatar;
    navProfileImg.alt = `${user.name}'s profile picture`;
    navProfileImg.hidden = false;
    navProfileIcon.hidden = true;
    navProfileBtn.classList.add("is-authenticated");
  } else {
    navProfileImg.removeAttribute("src");
    navProfileImg.hidden = true;
    navProfileIcon.hidden = false;
    navProfileBtn.classList.toggle("is-authenticated", Boolean(user));
  }
}

// CATEGORY HERO & FILTERING
function getInitialCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = (params.get("category") || "cakes").toLowerCase();
  if (raw === "all" || bakeryCategoriesData[raw]) {
    return raw;
  }
  return "cakes";
}

function updateHeroBanner(catKey) {
  if (catKey === "all") {
    catEyebrow.textContent = "COMPLETE BAKERY MENU";
    catHeroTitle.textContent = "All Handcrafted Treats";
    catHeroDesc.textContent =
      "Explore our cakes, flaky pastries, and rich fudgy brownies baked fresh with quality ingredients.";
    return;
  }

  const data = bakeryCategoriesData[catKey];
  if (data) {
    catEyebrow.textContent = data.eyebrow;
    catHeroTitle.textContent = data.title;
    catHeroDesc.textContent = data.description;
  }
}

function setActiveCategoryButton(catKey) {
  filterCategoryList?.querySelectorAll(".filter-cat-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.getAttribute("data-cat") === catKey);
  });
}

function collectFilteredProducts() {
  const query = (catSearchInput?.value || "").trim().toLowerCase();
  const priceRange = priceFilterSelect?.value || "all";

  let pool = [];
  if (currentCategoryKey === "all") {
    Object.entries(bakeryCategoriesData).forEach(([catKey, catObj]) => {
      catObj.items.forEach((item) => {
        pool.push({
          ...item,
          categoryKey: catKey,
          categoryLabel: catObj.title,
        });
      });
    });
  } else {
    const catObj = bakeryCategoriesData[currentCategoryKey];
    if (catObj) {
      pool = catObj.items.map((item) => ({
        ...item,
        categoryKey: currentCategoryKey,
        categoryLabel: catObj.title,
      }));
    }
  }

  return pool.filter((item) => {
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);

    const numPrice = parseNumericPrice(item.price);
    let matchesPrice = true;
    if (priceRange === "under-500") matchesPrice = numPrice < 500;
    else if (priceRange === "500-2800") matchesPrice = numPrice >= 500 && numPrice <= 2800;
    else if (priceRange === "above-2800") matchesPrice = numPrice > 2800;

    return matchesSearch && matchesPrice;
  });
}

function renderProducts() {
  if (!productsGrid) return;

  updateHeroBanner(currentCategoryKey);
  setActiveCategoryButton(currentCategoryKey);

  const items = collectFilteredProducts();
  const wishlistIds = new Set(getWishlist().map((w) => w.id));

  if (catResultsCount) {
    catResultsCount.textContent = `Showing ${items.length} ${items.length === 1 ? "treat" : "treats"}`;
  }

  if (!items.length) {
    productsGrid.innerHTML = `
      <div class="cat-empty-state">
        No treats match your current filter. Try resetting filters or searching another name.
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = items
    .map((item) => {
      const liked = wishlistIds.has(item.id);
      return `
        <article class="product-card" data-product-id="${escapeHtml(item.id)}">
          <div class="product-img-wrap">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" />
            <button
              type="button"
              class="product-heart-btn ${liked ? "is-liked" : ""}"
              aria-pressed="${liked}"
              aria-label="Save ${escapeHtml(item.name)} to wishlist"
              data-wish-id="${escapeHtml(item.id)}"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>

          <div class="product-card-body">
            <h3 class="product-name">${escapeHtml(item.name)}</h3>
            <p class="product-desc">${escapeHtml(item.description)}</p>
            <div class="product-footer-row">
              <span class="product-price">${escapeHtml(item.price)}</span>
              <button
                type="button"
                class="btn-order-now"
                data-order-id="${escapeHtml(item.id)}"
              >
                Order Now
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  // Attach Heart Click -> Wishlist Storage (synced with profile.js)
  productsGrid.querySelectorAll(".product-heart-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wishId = btn.getAttribute("data-wish-id");
      const found = items.find((p) => p.id === wishId);
      if (!found) return;

      const list = getWishlist();
      const idx = list.findIndex((entry) => entry.id === found.id);
      if (idx > -1) {
        list.splice(idx, 1);
        btn.classList.remove("is-liked");
        btn.setAttribute("aria-pressed", "false");
        showToast(`${found.name} removed from wishlist`);
      } else {
        list.unshift({
          id: found.id,
          title: found.name,
          category: found.categoryLabel,
          price: found.price,
        });
        btn.classList.add("is-liked");
        btn.setAttribute("aria-pressed", "true");
        showToast(`${found.name} added to wishlist`);
      }
      saveWishlist(list);
    });
  });

  // Attach Order Now Click -> Check Auth First
  productsGrid.querySelectorAll(".btn-order-now").forEach((btn) => {
    btn.addEventListener("click", () => {
      const prodId = btn.getAttribute("data-order-id");
      const found = items.find((p) => p.id === prodId);
      if (!found) return;

      const user = getCurrentUser();
      if (!user) {
        openLoginPrompt();
        return;
      }

      openOrderModal(found);
    });
  });
}

// ORDER & LOGIN PROMPT MODALS
function openLoginPrompt() {
  if (!loginPromptModal) return;
  loginPromptModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeLoginPrompt() {
  if (!loginPromptModal) return;
  loginPromptModal.hidden = true;
  document.body.style.overflow = "";
}

function updateOrderTotalDisplay() {
  if (!activeOrderProduct || !orderQtyInput || !orderCalculatedTotal) return;
  const qty = Math.max(1, parseInt(orderQtyInput.value, 10) || 1);
  const unit = parseNumericPrice(activeOrderProduct.price);
  orderCalculatedTotal.textContent = formatRs(unit * qty);
}

function openOrderModal(product) {
  if (!orderModal) return;
  activeOrderProduct = product;
  orderItemImg.src = product.image;
  orderItemImg.alt = product.name;
  orderItemName.textContent = product.name;
  orderItemUnitPrice.textContent = `${product.price} each`;
  orderQtyInput.value = "1";
  orderNoteInput.value = "";
  updateOrderTotalDisplay();

  orderModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeOrderModal() {
  if (!orderModal) return;
  orderModal.hidden = true;
  activeOrderProduct = null;
  document.body.style.overflow = "";
}

if (orderQtyInput) {
  orderQtyInput.addEventListener("input", updateOrderTotalDisplay);
}

if (placeOrderForm) {
  placeOrderForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) {
      closeOrderModal();
      openLoginPrompt();
      return;
    }
    if (!activeOrderProduct) return;

    const qty = Math.max(1, parseInt(orderQtyInput.value, 10) || 1);
    const unitPrice = parseNumericPrice(activeOrderProduct.price);
    const totalAmount = formatRs(unitPrice * qty);
    const noteVal = orderNoteInput.value.trim();

    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      item: qty > 1 ? `${activeOrderProduct.name} (x${qty})` : activeOrderProduct.name,
      category: activeOrderProduct.categoryLabel,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      amount: totalAmount,
      status: "Preparing",
      customerEmail: user.email,
      note: noteVal,
    };

    const existingOrders = getOrders();
    existingOrders.unshift(newOrder);
    saveOrders(existingOrders);

    const orderedName = activeOrderProduct.name;
    closeOrderModal();
    showToast(`Order placed for ${orderedName}! Track it in My Profile.`);
  });
}

// FILTER & MODAL EVENTS
filterCategoryList?.querySelectorAll(".filter-cat-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const chosen = btn.getAttribute("data-cat") || "cakes";
    currentCategoryKey = chosen;
    renderProducts();
  });
});

catSearchInput?.addEventListener("input", renderProducts);
priceFilterSelect?.addEventListener("change", renderProducts);

resetFiltersBtn?.addEventListener("click", () => {
  if (catSearchInput) catSearchInput.value = "";
  if (priceFilterSelect) priceFilterSelect.value = "all";
  renderProducts();
});

closeOrderModalBtn?.addEventListener("click", closeOrderModal);
orderModalBackdrop?.addEventListener("click", closeOrderModal);

closeLoginPromptBtn?.addEventListener("click", closeLoginPrompt);
cancelLoginPromptBtn?.addEventListener("click", closeLoginPrompt);
loginPromptBackdrop?.addEventListener("click", closeLoginPrompt);

goToProfileLoginBtn?.addEventListener("click", () => {
  localStorage.setItem(KEYS.OPEN_LOGIN, "1");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (orderModal && !orderModal.hidden) closeOrderModal();
    if (loginPromptModal && !loginPromptModal.hidden) closeLoginPrompt();
  }
});

// Initialize
currentCategoryKey = getInitialCategoryFromUrl();
syncNavbarProfile();
renderProducts();