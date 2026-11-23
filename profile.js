// =========================================
// BAKERY PROFILE, AUTHENTICATION, ORDERS & WISHLIST
// =========================================

const STORAGE_KEYS = {
  USER: "bakery_auth_user_v1",
  ORDERS: "bakery_orders_v1",
  WISHLIST: "bakery_wishlist_v1",
  OPEN_LOGIN: "bakery_open_login_v1",
};

// DOM Elements
const navProfileBtn = document.getElementById("navProfileBtn");
const navProfileImg = document.getElementById("navProfileImg");
const navProfileIcon = document.getElementById("navProfileIcon");

const profileDetailTrigger = document.getElementById("profileDetailTrigger");
const profileDetailsCard = document.getElementById("profileDetailsCard");
const closeDetailsCardBtn = document.getElementById("closeDetailsCardBtn");

const pageAvatarImg = document.getElementById("pageAvatarImg");
const pageAvatarFallback = document.getElementById("pageAvatarFallback");
const authStatusBadge = document.getElementById("authStatusBadge");
const displayUserName = document.getElementById("displayUserName");
const displayUserSub = document.getElementById("displayUserSub");

const detailName = document.getElementById("detailName");
const detailEmail = document.getElementById("detailEmail");
const detailPhone = document.getElementById("detailPhone");

const openAuthModalBtn = document.getElementById("openAuthModalBtn");
const topbarLogoutBtn = document.getElementById("topbarLogoutBtn");
const noticeLoginBtn = document.getElementById("noticeLoginBtn");
const editFromPopoverBtn = document.getElementById("editFromPopoverBtn");
const popoverLogoutBtn = document.getElementById("popoverLogoutBtn");

const guestDashboardNotice = document.getElementById("guestDashboardNotice");
const userDashboardCard = document.getElementById("userDashboardCard");
const dashName = document.getElementById("dashName");
const dashEmail = document.getElementById("dashEmail");
const dashPhone = document.getElementById("dashPhone");

const statOrdersCount = document.getElementById("statOrdersCount");
const statWishlistCount = document.getElementById("statWishlistCount");
const statPreparingCount = document.getElementById("statPreparingCount");

const ordersList = document.getElementById("ordersList");
const wishlistGrid = document.getElementById("wishlistGrid");

// Auth Modal Elements
const authModal = document.getElementById("authModal");
const authModalBackdrop = document.getElementById("authModalBackdrop");
const closeAuthModalBtn = document.getElementById("closeAuthModalBtn");
const authLoginForm = document.getElementById("authLoginForm");
const authNameInput = document.getElementById("authName");
const authPhoneInput = document.getElementById("authPhone");
const authEmailInput = document.getElementById("authEmail");
const authImageFileInput = document.getElementById("authImageFile");
const authImageUrlInput = document.getElementById("authImageUrl");
const authPreviewRow = document.getElementById("authPreviewRow");
const authPreviewImg = document.getElementById("authPreviewImg");

const errName = document.getElementById("errName");
const errPhone = document.getElementById("errPhone");
const errEmail = document.getElementById("errEmail");
const errImage = document.getElementById("errImage");

let pendingAvatar = "";

// =========================================
// STORAGE HELPERS
// =========================================
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.USER);
}

function getOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWishlist(items) {
  localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(items));
}

// =========================================
// AUTHENTICATION & VALIDATION
// =========================================
function clearErrors() {
  errName.textContent = "";
  errPhone.textContent = "";
  errEmail.textContent = "";
  errImage.textContent = "";
}

function isValidUrl(str) {
  if (!str) return true;
  try {
    const parsed = new URL(str);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function validateAuthInputs(name, phone, email, imageUrl) {
  clearErrors();
  let ok = true;

  if (name.trim().length < 2) {
    errName.textContent = "Please enter your full name (at least 2 characters).";
    ok = false;
  }

  const normalizedPhone = phone.replace(/[\s()-]/g, "");
  if (!/^\+?\d{7,15}$/.test(normalizedPhone)) {
    errPhone.textContent = "Please enter a valid phone number (7–15 digits).";
    ok = false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
    errEmail.textContent = "Please enter a valid email address.";
    ok = false;
  }

  if (!pendingAvatar && imageUrl.trim() && !isValidUrl(imageUrl.trim())) {
    errImage.textContent = "Please provide a valid http/https image URL or upload an image.";
    ok = false;
  }

  return ok;
}

function openAuthModal(prefill = true) {
  if (!authModal) return;
  clearErrors();

  const existing = getCurrentUser();
  if (prefill && existing) {
    authNameInput.value = existing.name || "";
    authPhoneInput.value = existing.phone || "";
    authEmailInput.value = existing.email || "";
    pendingAvatar = existing.avatar || "";
    authImageUrlInput.value =
      existing.avatar && !existing.avatar.startsWith("data:") ? existing.avatar : "";

    if (pendingAvatar) {
      authPreviewImg.src = pendingAvatar;
      authPreviewRow.hidden = false;
    } else {
      authPreviewRow.hidden = true;
    }
  } else {
    authLoginForm.reset();
    pendingAvatar = "";
    authPreviewRow.hidden = true;
  }

  authModal.hidden = false;
  document.body.style.overflow = "hidden";
  authNameInput.focus();
}

function closeAuthModal() {
  if (!authModal) return;
  authModal.hidden = true;
  document.body.style.overflow = "";
}

if (authImageFileInput) {
  authImageFileInput.addEventListener("change", () => {
    const file = authImageFileInput.files && authImageFileInput.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      errImage.textContent = "Please choose a valid image file (JPG, PNG, WEBP).";
      authImageFileInput.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      errImage.textContent = "Image must be 2 MB or smaller.";
      authImageFileInput.value = "";
      return;
    }

    errImage.textContent = "";
    const reader = new FileReader();
    reader.onload = (ev) => {
      pendingAvatar = String(ev.target?.result || "");
      authPreviewImg.src = pendingAvatar;
      authPreviewRow.hidden = false;
    };
    reader.readAsDataURL(file);
  });
}

if (authImageUrlInput) {
  authImageUrlInput.addEventListener("input", () => {
    const val = authImageUrlInput.value.trim();
    if (isValidUrl(val) && val) {
      pendingAvatar = val;
      authPreviewImg.src = val;
      authPreviewRow.hidden = false;
      errImage.textContent = "";
    } else if (!val && !(authImageFileInput.files && authImageFileInput.files.length)) {
      pendingAvatar = "";
      authPreviewRow.hidden = true;
    }
  });
}

if (authLoginForm) {
  authLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameVal = authNameInput.value.trim();
    const phoneVal = authPhoneInput.value.trim();
    const emailVal = authEmailInput.value.trim();
    const urlVal = authImageUrlInput.value.trim();

    if (!validateAuthInputs(nameVal, phoneVal, emailVal, urlVal)) {
      return;
    }

    const avatarVal = pendingAvatar || (isValidUrl(urlVal) ? urlVal : "");

    saveCurrentUser({
      name: nameVal,
      phone: phoneVal,
      email: emailVal,
      avatar: avatarVal,
    });

    closeAuthModal();
    renderAll();
  });
}

function logoutUser() {
  clearCurrentUser();
  if (profileDetailsCard) profileDetailsCard.hidden = true;
  if (profileDetailTrigger) profileDetailTrigger.setAttribute("aria-expanded", "false");
  renderAll();
}

// =========================================
// RENDERING UI
// =========================================
function getInitials(name) {
  if (!name) return "BB";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

function renderNavbarAvatar(user) {
  if (!navProfileBtn || !navProfileImg || !navProfileIcon) return;

  if (user && user.avatar) {
    navProfileBtn.style.padding = "0";
    navProfileBtn.style.overflow = "hidden";
    navProfileImg.src = user.avatar;
    navProfileImg.alt = `${user.name}'s profile picture`;
    navProfileImg.style.width = "100%";
    navProfileImg.style.height = "100%";
    navProfileImg.style.objectFit = "cover";
    navProfileImg.style.borderRadius = "50%";
    navProfileImg.style.display = "block";
    navProfileImg.hidden = false;
    navProfileIcon.hidden = true;
    navProfileIcon.style.display = "none";
    navProfileBtn.classList.add("is-authenticated");
  } else {
    navProfileBtn.style.padding = "";
    navProfileImg.removeAttribute("src");
    navProfileImg.style.display = "none";
    navProfileImg.hidden = true;
    navProfileIcon.hidden = false;
    navProfileIcon.style.display = "";
    navProfileBtn.classList.toggle("is-authenticated", Boolean(user));
  }
}

function renderProfileAndDashboard(user, orders, wishlist) {
  renderNavbarAvatar(user);

  const preparingCount = orders.filter((o) => o.status !== "Delivered").length;
  statOrdersCount.textContent = String(orders.length);
  statWishlistCount.textContent = String(wishlist.length);
  statPreparingCount.textContent = String(preparingCount);

  if (user) {
    authStatusBadge.textContent = "Logged In";
    authStatusBadge.classList.add("is-online");
    displayUserName.textContent = user.name;
    displayUserSub.textContent = `${user.email} • Click profile to view info & logout`;

    detailName.textContent = user.name;
    detailEmail.textContent = user.email;
    detailPhone.textContent = user.phone;

    dashName.textContent = user.name;
    dashEmail.textContent = user.email;
    dashPhone.textContent = user.phone;

    // Hide login description & button in overview once logged in
    if (guestDashboardNotice) {
      guestDashboardNotice.hidden = true;
      guestDashboardNotice.style.display = "none";
    }
    if (noticeLoginBtn) {
      noticeLoginBtn.hidden = true;
      noticeLoginBtn.style.display = "none";
    }
    if (userDashboardCard) {
      userDashboardCard.hidden = false;
      userDashboardCard.style.display = "";
    }
    if (topbarLogoutBtn) {
      topbarLogoutBtn.hidden = false;
      topbarLogoutBtn.style.display = "";
    }

    if (user.avatar) {
      pageAvatarImg.src = user.avatar;
      pageAvatarImg.alt = `${user.name} avatar`;
      pageAvatarImg.hidden = false;
      pageAvatarFallback.hidden = true;
    } else {
      pageAvatarImg.hidden = true;
      pageAvatarFallback.textContent = getInitials(user.name);
      pageAvatarFallback.hidden = false;
    }
  } else {
    authStatusBadge.textContent = "Guest Baker";
    authStatusBadge.classList.remove("is-online");
    displayUserName.textContent = "Welcome, Guest";
    displayUserSub.textContent = "Sign in to view your email, phone number, and personal dashboard.";

    detailName.textContent = "Not signed in";
    detailEmail.textContent = "Not signed in";
    detailPhone.textContent = "Not signed in";

    // Restore login description & button when logged out
    if (guestDashboardNotice) {
      guestDashboardNotice.hidden = false;
      guestDashboardNotice.style.display = "";
    }
    if (noticeLoginBtn) {
      noticeLoginBtn.hidden = false;
      noticeLoginBtn.style.display = "";
    }
    if (userDashboardCard) {
      userDashboardCard.hidden = true;
      userDashboardCard.style.display = "none";
    }
    if (topbarLogoutBtn) {
      topbarLogoutBtn.hidden = true;
      topbarLogoutBtn.style.display = "none";
    }

    pageAvatarImg.hidden = true;
    pageAvatarFallback.textContent = "BB";
    pageAvatarFallback.hidden = false;
  }
}

function renderOrders(orders) {
  if (!ordersList) return;
  if (!orders.length) {
    ordersList.innerHTML = `<div class="bk-empty-box">No bakery orders placed yet.</div>`;
    return;
  }

  ordersList.innerHTML = orders
    .map((order) => {
      const statusCls = order.status === "Delivered" ? "is-delivered" : "is-preparing";
      return `
        <article class="bk-order-card">
          <div>
            <span class="bk-order-code">${escapeHtml(order.id)} • ${escapeHtml(order.category)}</span>
            <h3 class="bk-order-title">${escapeHtml(order.item)}</h3>
            <p class="bk-order-meta">Ordered ${escapeHtml(order.date)} • Total: <strong>${escapeHtml(order.amount)}</strong></p>
          </div>
          <span class="bk-order-badge ${statusCls}">${escapeHtml(order.status)}</span>
        </article>
      `;
    })
    .join("");
}

function renderWishlist(wishlist) {
  if (!wishlistGrid) return;

  const idSet = new Set(wishlist.map((item) => item.id));
  document.querySelectorAll("[data-wishlist-btn]").forEach((btn) => {
    const id = btn.getAttribute("data-id");
    const liked = Boolean(id && idSet.has(id));
    btn.classList.toggle("is-liked", liked);
    btn.setAttribute("aria-pressed", String(liked));
  });

  if (!wishlist.length) {
    wishlistGrid.innerHTML = `
      <div class="bk-empty-box">
        No items in your wishlist yet. Click any heart button on a category or treat to save it here.
      </div>
    `;
    return;
  }

  wishlistGrid.innerHTML = wishlist
    .map(
      (item) => `
        <article class="bk-wishlist-card">
          <div>
            <span class="bk-wish-cat">${escapeHtml(item.category || "Bakery Category")}</span>
            <h3 class="bk-wish-title">${escapeHtml(item.title)}</h3>
            ${item.price ? `<p class="bk-wish-price">${escapeHtml(item.price)}</p>` : ""}
          </div>
          <div>
            <button type="button" class="btn-bk-ghost bk-remove-wish" data-remove-id="${escapeHtml(item.id)}">
              Remove
            </button>
          </div>
        </article>
      `
    )
    .join("");

  wishlistGrid.querySelectorAll(".bk-remove-wish").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idToRemove = btn.getAttribute("data-remove-id");
      const nextList = getWishlist().filter((item) => item.id !== idToRemove);
      saveWishlist(nextList);
      renderAll();
    });
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderAll() {
  const user = getCurrentUser();
  const orders = getOrders();
  const wishlist = getWishlist();
  renderProfileAndDashboard(user, orders, wishlist);
  renderOrders(orders);
  renderWishlist(wishlist);
}

// =========================================
// GLOBAL HEART CLICK SYNC (CATEGORIES & ITEMS)
// =========================================
document.addEventListener("click", (e) => {
  const heartBtn = e.target.closest("[data-wishlist-btn]");
  if (!heartBtn) return;

  const id = heartBtn.getAttribute("data-id");
  const title = heartBtn.getAttribute("data-title");
  if (!id || !title) return;

  const category = heartBtn.getAttribute("data-category") || "Bakery Categories";
  const price = heartBtn.getAttribute("data-price") || "";

  const list = getWishlist();
  const idx = list.findIndex((entry) => entry.id === id);

  if (idx > -1) {
    list.splice(idx, 1);
  } else {
    list.unshift({ id, title, category, price });
  }

  saveWishlist(list);
  renderWishlist(list);
  if (statWishlistCount) {
    statWishlistCount.textContent = String(list.length);
  }
});

// =========================================
// EVENTS
// =========================================
if (navProfileBtn) {
  navProfileBtn.addEventListener("click", (e) => {
    const user = getCurrentUser();
    const onProfilePage =
      window.location.pathname.endsWith("profile.html") ||
      document.getElementById("dashboard") !== null;

    if (!user) {
      e.preventDefault();
      if (onProfilePage) {
        openAuthModal(false);
      } else {
        localStorage.setItem(STORAGE_KEYS.OPEN_LOGIN, "1");
        window.location.href = "profile.html";
      }
    }
  });
}

if (profileDetailTrigger && profileDetailsCard) {
  const toggleDetails = () => {
    const user = getCurrentUser();
    if (!user) {
      openAuthModal(false);
      return;
    }
    const nextState = profileDetailsCard.hidden;
    profileDetailsCard.hidden = !nextState;
    profileDetailTrigger.setAttribute("aria-expanded", String(nextState));
  };

  profileDetailTrigger.addEventListener("click", toggleDetails);
  profileDetailTrigger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDetails();
    }
  });
}

if (closeDetailsCardBtn && profileDetailsCard) {
  closeDetailsCardBtn.addEventListener("click", () => {
    profileDetailsCard.hidden = true;
    profileDetailTrigger?.setAttribute("aria-expanded", "false");
  });
}

if (openAuthModalBtn) {
  openAuthModalBtn.addEventListener("click", () => openAuthModal(true));
}

if (noticeLoginBtn) {
  noticeLoginBtn.addEventListener("click", () => openAuthModal(false));
}

if (editFromPopoverBtn) {
  editFromPopoverBtn.addEventListener("click", () => {
    profileDetailsCard.hidden = true;
    openAuthModal(true);
  });
}

if (topbarLogoutBtn) {
  topbarLogoutBtn.addEventListener("click", logoutUser);
}

if (popoverLogoutBtn) {
  popoverLogoutBtn.addEventListener("click", logoutUser);
}

if (closeAuthModalBtn) {
  closeAuthModalBtn.addEventListener("click", closeAuthModal);
}

if (authModalBackdrop) {
  authModalBackdrop.addEventListener("click", closeAuthModal);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (authModal && !authModal.hidden) closeAuthModal();
    if (profileDetailsCard && !profileDetailsCard.hidden) {
      profileDetailsCard.hidden = true;
      profileDetailTrigger?.setAttribute("aria-expanded", "false");
    }
  }
});

// Initial Render
renderAll();

if (localStorage.getItem(STORAGE_KEYS.OPEN_LOGIN) === "1") {
  localStorage.removeItem(STORAGE_KEYS.OPEN_LOGIN);
  if (!getCurrentUser()) {
    openAuthModal(false);
  }
}