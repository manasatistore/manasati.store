/* ==========================================================================
   MANASATI STORE (منصتي) - CORE APPLICATION JAVASCRIPT
   Connected directly to WAMP MySQL Server on localhost:3306 & Flask API:5005
   Handles Customer storefront, Product Details Modal, Cart Drawer, JWT Auth,
   Strict Role Guarding & Live Admin Orders Management
   ========================================================================== */

const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? `${window.location.protocol}//${window.location.hostname}:${window.location.port || 8080}/api`
  : 'https://manasatistore-production.up.railway.app/api';

const I18N = {
  ar: {
    drawer_cats: "أقسام الاشتراكات",
    cat_all: "جميع الخدمات والاشتراكات",
    cat_entertainment: "اشتراكات الترفيه وسينما",
    cat_ai: "الذكاء الاصطناعي والتصميم",
    cat_gaming: "ألعاب وااشتراكات",
    cat_sports: "رياضة وبث مباشر",
    cat_music: "موسيقى وصوتيات",
    drawer_quick_links: "روابط سريعة للمتجر",
    trust_title: "ضمان منصتي والتفعيل الرسمي",
    reviews_title: "آراء وتقييمات المشتركين",
    support_24: "الدعم الفني وتواصل معنا",
    payment_methods: "وسائل الدفع المتاحة",
    admin_panel: "لوحة التحكم والإدارة",
    settings_title: "إعدادات المتجر والتفضيلات",
    theme_mode: "مظهر المتجر",
    dark_mode: "داكن 🌙",
    light_mode: "نهاري ☀️",
    language: "لغة العرض",
    search_placeholder: "ابحث فوري عن اشتراك (نتفليكس، شاهد، ChatGPT، كانفا...)",
    all_services: "جميع الاشتراكات المتاحة",
    order_now: "طلب فوري",
    add_to_cart: "إضافة للسلة",
  },
  en: {
    drawer_cats: "Subscription Categories",
    cat_all: "All Services & Subscriptions",
    cat_entertainment: "Entertainment & Cinema",
    cat_ai: "AI & Design Tools",
    cat_gaming: "Gaming & Subscriptions",
    cat_sports: "Sports & Live Stream",
    cat_music: "Music & Audio",
    drawer_quick_links: "Quick Navigation Links",
    trust_title: "Manasati Guarantee & Official Activation",
    reviews_title: "Subscriber Reviews & Ratings",
    support_24: "24/7 Technical Support",
    payment_methods: "Available Payment Methods",
    admin_panel: "Admin Dashboard",
    settings_title: "Store Settings & Preferences",
    theme_mode: "Store Appearance",
    dark_mode: "Dark 🌙",
    light_mode: "Light ☀️",
    language: "Display Language",
    search_placeholder: "Instant search (Netflix, Shahid, ChatGPT, Canva...)",
    all_services: "All Available Subscriptions",
    order_now: "Order Now",
    add_to_cart: "Add to Cart",
  }
};


const INITIAL_SERVICES = [
  {
    id: "srv-1",
    db_id: 1,
    title: "اشتراك نتفليكس 4K Ultra HD (ملف خاص برمز سري)",
    category: "entertainment",
    price: 29,
    originalPrice: 49,
    badge: "الأكثر مبيعاً 🔥",
    period: "شهر واحد",
    delivery: "تسليم فوري ⚡",
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80",
    description: "استمتع بمشاهدة جميع الأفلام والمسلسلات الحصرية أعلى دقة 4K UHD. ملف شخصي خاص بك ومقفل برمز سري PIN لضمان الخصوصية والراحة التامة."
  },
  {
    id: "srv-2",
    db_id: 2,
    title: "اشتراك شاهد VIP + الرياضية (شامل دوري روشن والرياضة)",
    category: "entertainment",
    price: 35,
    originalPrice: 59,
    badge: "خصم 40%",
    period: "شهر واحد",
    delivery: "تسليم فوري ⚡",
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500&auto=format&fit=crop&q=80",
    description: "شاهد جميع المباريات المباشرة ودوري روشن السعودي، بالإضافة إلى أعمال شاهد الأصلية وأضخم المسلسلات والأفلام بأعلى جودة وبدون إعلانات."
  },
  {
    id: "srv-3",
    db_id: 3,
    title: "اشتراك يوتيوب بريميوم (تفعيل رسمي على حسابك الخاص)",
    category: "music",
    price: 15,
    originalPrice: 30,
    badge: "تفعيل رسمي 💯",
    period: "شهر واحد",
    delivery: "خلال 15 دقيقة 🚀",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=80",
    description: "مشاهدة الفيديوهات بدون أي إعلانات مزعجة، إمكانية التشغيل في الخلفية وتحميل الفيديوهات، بالإضافة للاستمتاع بـ YouTube Music."
  },
  {
    id: "srv-4",
    db_id: 4,
    title: "اشتراك ChatGPT Plus (وصول كامل لـ GPT-4o و DALL-E 3)",
    category: "ai",
    price: 49,
    originalPrice: 85,
    badge: "ذكاء اصطناعي",
    period: "شهر واحد",
    delivery: "تسليم فوري ⚡",
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500&auto=format&fit=crop&q=80",
    description: "احصل على أفضل أدوات الذكاء الاصطناعي مع نموذج GPT-4o الفائق، توليد الصور الاحترافية عبر DALL-E 3 وتحليل البيانات بسرعة عالية."
  }
];

class ManasatiApp {
  constructor() {
    this.services = INITIAL_SERVICES;
    this.authToken = localStorage.getItem("manasati_token") || null;
    this.currentUser = this.loadFromStorage("manasati_user", null);

    this.cart = this.loadFromStorage(this.getCartStorageKey(), []);
    this.orders = this.loadFromStorage("manasati_orders", []);

    const savedRole = localStorage.getItem("manasati_role");
    this.currentRole = (this.currentUser && this.currentUser.role === 'admin' && savedRole === 'admin') ? 'admin' : 'user';
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.sortBy = 'popular';

    this.currentTheme = localStorage.getItem("manasati_theme") || "dark";
    this.currentLang = localStorage.getItem("manasati_lang") || "ar";

    this.initElements();
    this.initThemeAndLanguage();
    this.bindEvents();
    this.updateAuthUI();
    this.loadServicesFromDB();
    if (this.currentUser && this.currentUser.role === 'admin') {
      this.loadOrdersFromDB();
    }
    this.switchRole(this.currentRole, true);
    this.render();
  }

  // Dynamic cart storage key per user/guest session
  getCartStorageKey() {
    if (this.currentUser && this.currentUser.id) {
      return `manasati_cart_user_${this.currentUser.id}`;
    }
    return `manasati_cart_guest`;
  }

  reloadUserCartAndOrders() {
    const guestCart = this.loadFromStorage("manasati_cart_guest", []);
    const userCartKey = this.getCartStorageKey();
    let userCart = this.loadFromStorage(userCartKey, []);

    // Merge guest cart items into user cart when subscriber logs in
    if (this.currentUser && Array.isArray(guestCart) && guestCart.length > 0) {
      guestCart.forEach(gItem => {
        const existing = userCart.find(u => u.id === gItem.id);
        if (existing) {
          existing.quantity += gItem.quantity;
        } else {
          userCart.push(gItem);
        }
      });
      this.saveToStorage("manasati_cart_guest", []);
      this.saveToStorage(userCartKey, userCart);
    }

    this.cart = userCart;
    this.updateCartBadge();
    this.renderCartItems();
  }

  // LocalStorage Helpers
  loadFromStorage(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return fallback;
    }
  }

  saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to localStorage`, e);
    }
  }

  // DOM Elements Initialization
  initElements() {
    // Views
    this.storefrontView = document.getElementById("storefront-view");
    this.adminView = document.getElementById("admin-view");

    // Role Buttons
    this.roleUserBtn = document.getElementById("role-user-btn");
    this.roleAdminBtn = document.getElementById("role-admin-btn");

    // Services Grid & Controls
    this.servicesGrid = document.getElementById("services-grid");
    this.servicesCountBadge = document.getElementById("services-count");
    this.emptyState = document.getElementById("empty-state");
    this.searchInput = document.getElementById("search-input");
    this.clearSearchBtn = document.getElementById("clear-search-btn");

    // Cart Elements
    this.cartBadgeCount = document.getElementById("cart-badge-count");
    this.cartItemsList = document.getElementById("cart-items-list");
    this.cartTotalPrice = document.getElementById("cart-total-price");
    this.cartItemsCount = document.getElementById("cart-items-count");

    // Admin Elements
    this.adminServicesTbody = document.getElementById("admin-services-tbody");
    this.adminOrdersTbody = document.getElementById("admin-orders-tbody");
    this.statTotalServices = document.getElementById("stat-total-services");
    this.statTotalOrders = document.getElementById("stat-total-orders");
    this.statTotalRevenue = document.getElementById("stat-total-revenue");
    this.ordersCountBadge = document.getElementById("orders-count-badge");

    // Auth Elements
    this.loggedOutActions = document.getElementById("logged-out-actions");
    this.loggedUserInfo = document.getElementById("logged-user-info");
    this.userDisplayName = document.getElementById("user-display-name");
    this.userRoleBadge = document.getElementById("user-role-badge");

    // Floating WhatsApp Action Button (FAB)
    this.whatsappFab = document.getElementById("whatsapp-fab");
  }

  // Initialize saved Theme (Dark/Light) and Language (Arabic/English)
  initThemeAndLanguage() {
    this.setTheme(this.currentTheme, false);
    this.setLanguage(this.currentLang, false);
  }

  setTheme(theme, notify = true) {
    this.currentTheme = theme;
    localStorage.setItem("manasati_theme", theme);

    const darkBtn = document.getElementById("btn-theme-dark");
    const lightBtn = document.getElementById("btn-theme-light");
    const badge = document.getElementById("theme-status-badge");

    if (theme === 'light') {
      document.body.classList.add("light-theme");
      if (darkBtn) darkBtn.classList.remove("active");
      if (lightBtn) lightBtn.classList.add("active");
      if (badge) badge.textContent = "☀️ نهاري";
      if (notify) this.showToast("تم تفعيل الوضع النهاري ☀️", "info");
    } else {
      document.body.classList.remove("light-theme");
      if (lightBtn) lightBtn.classList.remove("active");
      if (darkBtn) darkBtn.classList.add("active");
      if (badge) badge.textContent = "🌙 داكن";
      if (notify) this.showToast("تم تفعيل الوضع الليلي 🌙", "info");
    }
  }

  setLanguage(lang, notify = true) {
    this.currentLang = lang;
    localStorage.setItem("manasati_lang", lang);

    const htmlEl = document.documentElement;
    const arBtn = document.getElementById("btn-lang-ar");
    const enBtn = document.getElementById("btn-lang-en");
    const badge = document.getElementById("lang-status-badge");

    if (lang === 'en') {
      htmlEl.setAttribute("dir", "ltr");
      htmlEl.setAttribute("lang", "en");
      if (arBtn) arBtn.classList.remove("active");
      if (enBtn) enBtn.classList.add("active");
      if (badge) badge.textContent = "🇬🇧 English";
      if (notify) this.showToast("Language changed to English 🇬🇧", "info");
    } else {
      htmlEl.setAttribute("dir", "rtl");
      htmlEl.setAttribute("lang", "ar");
      if (enBtn) enBtn.classList.remove("active");
      if (arBtn) arBtn.classList.add("active");
      if (badge) badge.textContent = "🇸🇦 العربية";
      if (notify) this.showToast("تم تغيير اللغة إلى العربية 🇸🇦", "info");
    }

    // Apply translations across all elements with data-i18n
    const dict = I18N[lang] || I18N.ar;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Update search input placeholder
    if (this.searchInput && dict.search_placeholder) {
      this.searchInput.placeholder = dict.search_placeholder;
    }
  }

  // Event Listeners Registration
  bindEvents() {
    // Ultra-Fast Real-Time Search Listener with Instant Live Results Dropdown
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim();
        if (this.clearSearchBtn) {
          this.clearSearchBtn.style.display = this.searchQuery ? "block" : "none";
        }

        // Auto-switch category filter to 'all' when user types so search covers all products
        if (this.searchQuery) {
          this.activeCategory = 'all';
          document.querySelectorAll(".cat-pill").forEach(p => {
            p.classList.toggle("active", p.getAttribute("data-category") === 'all');
          });
        }

        window.requestAnimationFrame(() => {
          this.renderLiveSearchResults();
          this.renderServices();
        });
      });

      this.searchInput.addEventListener("focus", () => {
        this.renderLiveSearchResults();
      });

      this.searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.resetFilters();
        } else if (e.key === "Enter") {
          this.closeLiveSearchResults();
          const servicesSec = document.getElementById("services-grid") || document.querySelector(".services-section");
          if (servicesSec) {
            servicesSec.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      });
    }

    if (this.clearSearchBtn) {
      this.clearSearchBtn.addEventListener("click", () => {
        this.resetFilters();
      });
    }

    // Close Dropdown menus & Live Search Panel when clicking outside
    document.addEventListener("click", (e) => {
      document.querySelectorAll(".dropdown-menu-card").forEach(m => m.classList.remove("show"));
      const searchBox = document.getElementById("header-search-expandable");
      if (searchBox && !searchBox.contains(e.target)) {
        this.closeLiveSearchResults();
      }
    });

    // Global ESC Key Listener for All Modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeLoginModal();
        this.closeCart();
        this.closeCheckout();
        this.closeProductModal();
        this.closeMobileNavDrawer();
      }
    });

    // Close Modals when clicking dark overlay backdrop
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.style.display = "none";
        }
      });
    });

    // Category Buttons Listener
    const catPills = document.querySelectorAll(".cat-pill");
    catPills.forEach(pill => {
      pill.addEventListener("click", (e) => {
        catPills.forEach(p => p.classList.remove("active"));
        const btn = e.currentTarget;
        btn.classList.add("active");
        this.activeCategory = btn.getAttribute("data-category");
        this.renderServices();
      });
    });
  }

  // Header Expandable Search Toggle
  toggleHeaderSearch(event) {
    if (event) event.stopPropagation();
    const searchBox = document.getElementById("header-search-expandable");
    if (!searchBox) return;

    searchBox.classList.toggle("active");
    if (searchBox.classList.contains("active")) {
      const input = document.getElementById("search-input");
      if (input) input.focus();
    }
  }

  // Side Navigation Drawer Toggle (Menu ☰)
  toggleMobileNavDrawer(event) {
    if (event) event.stopPropagation();
    const overlay = document.getElementById("side-drawer-overlay");
    if (overlay) {
      overlay.classList.add("show");
    }
  }

  closeMobileNavDrawer() {
    const overlay = document.getElementById("side-drawer-overlay");
    if (overlay) {
      overlay.classList.remove("show");
    }
  }

  selectCategoryFromDrawer(category, event) {
    if (event) event.preventDefault();
    this.filterCategory(category);
    this.closeMobileNavDrawer();
  }

  // Categories Dropdown Toggle Handler
  toggleCategoriesDropdown(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById("categories-dropdown-menu");
    if (!menu) return;

    const isVisible = menu.classList.contains("show");
    document.querySelectorAll(".dropdown-menu-card").forEach(m => m.classList.remove("show"));

    if (!isVisible) {
      menu.classList.add("show");
    }
  }

  // Select Category from Header Dropdown Menu
  selectCategoryFromDropdown(category, event) {
    if (event) event.preventDefault();
    this.filterCategory(category);

    const menu = document.getElementById("categories-dropdown-menu");
    if (menu) menu.classList.remove("show");
  }

  // ==========================================
  // FETCH SERVICES FROM WAMP MYSQL DATABASE
  // ==========================================
  async loadServicesFromDB() {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.products)) {
          this.services = data.products;
          this.renderServices();
          if (this.currentRole === 'admin') {
            this.renderAdminDashboard();
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch products from API backend, using fallback services", err);
    }
  }

  // ==========================================
  // FETCH ORDERS FROM WAMP MYSQL DATABASE
  // ==========================================
  async loadOrdersFromDB() {
    if (!this.authToken || !this.currentUser || this.currentUser.role !== 'admin') return;

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.orders)) {
          this.orders = data.orders;
          this.saveToStorage("manasati_orders", this.orders);
          this.renderAdminDashboard();
        }
      }
    } catch (err) {
      console.warn("Could not fetch orders from API backend", err);
    }
  }



  // Handle Header User Icon Click when logged in vs logged out
  handleUserHeaderClick() {
    if (!this.currentUser) {
      this.openLoginModal('login');
      return;
    }

    if (this.currentUser.role === 'admin') {
      const nextRole = this.currentRole === 'admin' ? 'user' : 'admin';
      this.switchRole(nextRole);
    } else {
      this.showToast(`👤 مرحباً بك ${this.currentUser.name}! أنت مسجل كمشترك نشط في منصتي.`, "info");
    }
  }

  // ==========================================
  // AUTH & STRICT ROLE PERMISSIONS SYSTEM
  // ==========================================
  updateAuthUI() {
    const userHeaderIcon = document.getElementById("user-header-icon");

    if (this.currentUser) {
      if (this.loggedOutActions) this.loggedOutActions.style.display = "none";
      if (this.loggedUserInfo) this.loggedUserInfo.style.display = "flex";
      if (this.userDisplayName) this.userDisplayName.textContent = this.currentUser.name;

      if (this.currentUser.role === 'admin') {
        if (this.userRoleBadge) {
          this.userRoleBadge.textContent = " (Admin)";
          this.userRoleBadge.className = "user-role-badge admin";
        }
        if (this.roleAdminBtn) this.roleAdminBtn.style.display = "inline-flex";
        if (userHeaderIcon) userHeaderIcon.className = "fa-solid fa-user-shield text-amber";
      } else {
        if (this.userRoleBadge) {
          this.userRoleBadge.textContent = "مشترك";
          this.userRoleBadge.className = "user-role-badge";
        }
        if (this.roleAdminBtn) this.roleAdminBtn.style.display = "none";
        if (userHeaderIcon) userHeaderIcon.className = "fa-solid fa-user-check text-green";
        if (this.currentRole === 'admin') {
          this.switchRole('user');
        }
      }

      const drawerAdminLink = document.getElementById("drawer-admin-link");
      if (drawerAdminLink) {
        drawerAdminLink.style.display = (this.currentUser.role === 'admin') ? "flex" : "none";
      }
    } else {
      if (this.loggedOutActions) this.loggedOutActions.style.display = "flex";
      if (this.loggedUserInfo) this.loggedUserInfo.style.display = "none";
      if (this.roleAdminBtn) this.roleAdminBtn.style.display = "none";
      const drawerAdminLink = document.getElementById("drawer-admin-link");
      if (drawerAdminLink) drawerAdminLink.style.display = "none";
      if (this.currentRole === 'admin') {
        this.switchRole('user');
      }
    }
  }

  openLoginModal(mode = 'login') {
    if (this.currentUser) {
      this.showToast(`أنت مسجل الدخول بالفعل باسم "${this.currentUser.name}" (${this.currentUser.role === 'admin' ? 'مدير المتجر' : 'مشترك'})`, "info");
      return;
    }
    const modal = document.getElementById("login-modal-overlay");
    if (modal) {
      modal.style.display = "flex";
      // Clear forms for complete user privacy & confidentiality
      const loginForm = document.getElementById("login-form");
      const registerForm = document.getElementById("register-form");
      if (loginForm) loginForm.reset();
      if (registerForm) registerForm.reset();
      this.switchAuthTab(mode);
    }
  }

  closeLoginModal() {
    const modal = document.getElementById("login-modal-overlay");
    if (modal) modal.style.display = "none";
  }

  switchAuthTab(tab) {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const tabLoginBtn = document.getElementById("tab-login-btn");
    const tabRegisterBtn = document.getElementById("tab-register-btn");
    const titleEl = document.getElementById("auth-modal-title");

    if (tab === 'register') {
      if (loginForm) loginForm.style.display = "none";
      if (registerForm) registerForm.style.display = "block";
      if (tabLoginBtn) tabLoginBtn.classList.remove("active");
      if (tabRegisterBtn) tabRegisterBtn.classList.add("active");
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-user-plus text-cyan"></i> إنشاء حساب جديد - منصتي`;
    } else {
      if (loginForm) loginForm.style.display = "block";
      if (registerForm) registerForm.style.display = "none";
      if (tabRegisterBtn) tabRegisterBtn.classList.remove("active");
      if (tabLoginBtn) tabLoginBtn.classList.add("active");
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-lock text-cyan"></i> تسجيل الدخول - منصتي`;
    }
  }

  async handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        this.authToken = result.token;
        this.currentUser = result.user;
        localStorage.setItem("manasati_token", result.token);
        this.saveToStorage("manasati_user", result.user);

        this.updateAuthUI();
        this.reloadUserCartAndOrders();
        this.closeLoginModal();
        this.showToast(`مرحباً بك ${result.user.name} 👋 تم تسجيل الدخول بنجاح!`, "success");

        if (this.pendingCheckout) {
          this.pendingCheckout = false;
          setTimeout(() => {
            this.openCheckout();
          }, 350);
        } else if (result.user.role === 'admin') {
          await this.loadOrdersFromDB();
          this.switchRole('admin');
        } else {
          this.switchRole('user');
        }
      } else {
        this.showToast(result.message || "خطأ في بيانات تسجيل الدخول", "error");
      }
    } catch (err) {
      console.error("Login network error:", err);
      this.showToast("عذراً، فشل الاتصال بخادم المتجر السحابي", "error");
    }
  }

  async handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        this.authToken = result.token;
        this.currentUser = result.user;
        localStorage.setItem("manasati_token", result.token);
        this.saveToStorage("manasati_user", result.user);

        this.updateAuthUI();
        this.reloadUserCartAndOrders();
        this.closeLoginModal();
        this.showToast(`أهلاً بك ${result.user.name} 🎉 تم إنشاء حسابك وحفظ بياناتك بنجاح!`, "success");

        if (this.pendingCheckout) {
          this.pendingCheckout = false;
          setTimeout(() => {
            this.openCheckout();
          }, 350);
        } else {
          this.switchRole('user');
        }
      } else {
        this.showToast(result.message || "فشل إنشاء الحساب", "error");
      }
    } catch (err) {
      console.error("Register network error:", err);
      this.showToast("فشل الاتصال بخادم المتجر السحابي أثناء التسجيل", "error");
    }
  }

  // Toggle Password Visibility (Eye Icon Toggle)
  togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const icon = btnEl.querySelector('i');
    if (input.type === 'password') {
      input.type = 'text';
      if (icon) {
        icon.className = 'fa-solid fa-eye-slash text-purple';
      }
    } else {
      input.type = 'password';
      if (icon) {
        icon.className = 'fa-solid fa-eye';
      }
    }
  }

  logout() {
    this.authToken = null;
    this.currentUser = null;
    localStorage.removeItem("manasati_token");
    localStorage.removeItem("manasati_user");
    localStorage.removeItem("manasati_role");
    this.updateAuthUI();
    this.reloadUserCartAndOrders();
    this.switchRole('user');
    this.showToast("تم تسجيل الخروج والرجوع كزائر للمتجر 👋", "info");
  }

  // Switch between Customer Front Store & Admin Dashboard (Permission Guarded)
  switchRole(role, silent = false) {
    const cartBtn = document.getElementById("cart-trigger-btn");

    if (role === 'admin') {
      if (!this.currentUser || this.currentUser.role !== 'admin') {
        localStorage.setItem("manasati_role", "user");
        if (this.roleAdminBtn) this.roleAdminBtn.style.display = "none";
        if (cartBtn) cartBtn.style.display = "inline-flex";
        if (this.whatsappFab) this.whatsappFab.style.display = "flex";
        document.body.classList.remove("admin-active");
        if (!silent) this.showToast("🔒 غير مصرح لك. صفحة الإدارة مخصصة للمسؤول (Admin) فقط.", "error");
        this.openLoginModal('login');
        this.currentRole = 'user';
        if (this.roleAdminBtn) this.roleAdminBtn.classList.remove("active");
        if (this.roleUserBtn) this.roleUserBtn.classList.add("active");
        if (this.adminView) this.adminView.style.display = "none";
        if (this.storefrontView) this.storefrontView.style.display = "block";
        return;
      }

      this.currentRole = 'admin';
      localStorage.setItem("manasati_role", "admin");
      if (cartBtn) cartBtn.style.display = "none"; // Hide Cart button in Admin mode
      if (this.whatsappFab) this.whatsappFab.style.display = "none"; // Hide WhatsApp FAB in Admin mode
      document.body.classList.add("admin-active");
      if (this.roleUserBtn) this.roleUserBtn.classList.remove("active");
      if (this.roleAdminBtn) {
        this.roleAdminBtn.classList.add("active");
        this.roleAdminBtn.style.display = "inline-flex";
      }
      if (this.storefrontView) this.storefrontView.style.display = "none";
      if (this.adminView) this.adminView.style.display = "block";
      this.loadOrdersFromDB();
      this.renderAdminDashboard();
      if (!silent) this.showToast("مرحباً بك في لوحة التحكم والإدارة 🛡️", "info");
    } else {
      this.currentRole = 'user';
      localStorage.setItem("manasati_role", "user");
      if (cartBtn) cartBtn.style.display = "inline-flex"; // Show Cart button in Storefront mode
      if (this.whatsappFab) this.whatsappFab.style.display = "flex"; // Show WhatsApp FAB in Visitor/Customer mode
      document.body.classList.remove("admin-active");
      if (this.roleAdminBtn) this.roleAdminBtn.classList.remove("active");
      if (this.roleUserBtn) this.roleUserBtn.classList.add("active");
      if (this.adminView) this.adminView.style.display = "none";
      if (this.storefrontView) this.storefrontView.style.display = "block";
      this.renderServices();
      if (!silent) this.showToast("تم التبديل إلى واجهة المتجر الرئيسية 🏪", "info");
    }
  }

  // Sort Handler
  handleSortChange(value) {
    this.sortBy = value;
    this.renderServices();
  }

  // Arabic Text Normalization for Ultra-Fast Search Matching
  normalizeArabicText(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[\u064B-\u0652]/g, '')
      .trim();
  }

  // Navigate to any section smoothly with visual pulse highlight effect
  navigateToSection(sectionId, event = null) {
    if (event) event.preventDefault();

    // If currently viewing Admin Dashboard, automatically switch to Storefront View first!
    if (this.currentRole === 'admin' || (this.adminView && this.adminView.style.display !== 'none')) {
      this.switchRole('user', true);
    }

    this.closeMobileNavDrawer();

    const targetEl = document.getElementById(sectionId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Add glowing pulse animation
      targetEl.classList.remove('section-pulse-active');
      void targetEl.offsetWidth;
      targetEl.classList.add('section-pulse-active');

      setTimeout(() => {
        targetEl.classList.remove('section-pulse-active');
      }, 2000);
    }
  }

  // Instant Category Filter (from footer links, header, drawer, or quick buttons)
  filterCategory(category) {
    // If currently viewing Admin Dashboard, automatically switch to Storefront View first!
    if (this.currentRole === 'admin' || (this.adminView && this.adminView.style.display !== 'none')) {
      this.switchRole('user', true);
    }

    this.activeCategory = category;

    // Update Cat Pills Active state
    const catPills = document.querySelectorAll(".cat-pill");
    catPills.forEach(pill => {
      const pCat = pill.getAttribute("data-category");
      pill.classList.toggle("active", pCat === category);
    });

    this.renderServices();

    // Smooth scroll to services section
    const servicesSec = document.getElementById("services-grid") || document.querySelector(".services-section");
    if (servicesSec) {
      servicesSec.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // HTML escaping helper for security and safety
  escapeHTML(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Quick search tag handler
  quickSearchTag(keyword) {
    if (!this.searchInput) return;
    this.searchInput.value = keyword;
    this.searchQuery = keyword;
    if (this.clearSearchBtn) this.clearSearchBtn.style.display = "block";
    this.activeCategory = 'all';
    document.querySelectorAll(".cat-pill").forEach(p => {
      p.classList.toggle("active", p.getAttribute("data-category") === 'all');
    });
    this.renderLiveSearchResults();
    this.renderServices();
    this.searchInput.focus();
  }

  // Arabic Text Normalizer for ultra-accurate instant search matching
  normalizeArabicText(text) {
    if (text === null || text === undefined) return '';
    return text.toString().toLowerCase()
      .replace(/[\u064B-\u065F]/g, "") // Remove Tashkeel (diacritics)
      .replace(/[أإآء]/g, "ا")       // Normalize Alef variations
      .replace(/ة/g, "ه")           // Normalize Taa Marboota
      .replace(/ى/g, "ي")           // Normalize Alef Maqsoora
      .replace(/گ/g, "ك")
      .replace(/پ/g, "ب")
      .replace(/ژ/g, "ز")
      .replace(/چ/g, "ج")
      .trim();
  }

  // Calculate Search Relevance Score (Smart Search Ranking Engine)
  calculateRelevanceScore(srv, query) {
    if (!query) return 0;

    const qNorm = this.normalizeArabicText(query);
    if (!qNorm) return 0;

    const qWords = qNorm.split(/\s+/).filter(Boolean);
    if (qWords.length === 0) return 0;

    const titleNorm = this.normalizeArabicText(srv.title || '');
    const descNorm = this.normalizeArabicText(srv.description || '');
    const badgeNorm = this.normalizeArabicText(srv.badge || '');
    const catLabelNorm = this.normalizeArabicText(this.getCategoryLabel(srv.category));

    let score = 0;

    // 1. Title matches (highest priority)
    const titleWords = titleNorm.split(/\s+/).filter(Boolean);

    // Exact title match or starts with full query
    if (titleNorm === qNorm) {
      score += 5000;
    } else if (titleNorm.startsWith(qNorm)) {
      score += 3500;
    }

    // Word-level title checks
    qWords.forEach(qw => {
      let matchedInTitleWord = false;
      titleWords.forEach((tw, idx) => {
        if (tw === qw) {
          score += 2500 - (idx * 50); // Exact word match, bonus if earlier word
          matchedInTitleWord = true;
        } else if (tw.startsWith(qw)) {
          score += 1800 - (idx * 30); // Prefix word match
          matchedInTitleWord = true;
        } else if (tw.includes(qw)) {
          score += 1000;
          matchedInTitleWord = true;
        }
      });

      const pos = titleNorm.indexOf(qw);
      if (pos !== -1) {
        if (!matchedInTitleWord) score += 600;
        score += Math.max(0, 300 - pos * 10);
      }
    });

    // 2. Badge & Category matches
    if (badgeNorm && badgeNorm.includes(qNorm)) score += 400;
    if (catLabelNorm && catLabelNorm.includes(qNorm)) score += 350;

    // 3. Description matches (lower weight, standalone word match priority)
    const descWords = descNorm.split(/\s+/).filter(Boolean);
    qWords.forEach(qw => {
      let descWordMatch = false;
      descWords.forEach(dw => {
        if (dw === qw) {
          score += 120;
          descWordMatch = true;
        } else if (dw.startsWith(qw)) {
          score += 60;
          descWordMatch = true;
        }
      });
      if (descNorm.includes(qw) && !descWordMatch) {
        score += 15; // Low score for substring match inside longer description words
      }
    });

    return score;
  }

  // Highlight matched search term in text cleanly without breaking HTML
  highlightMatch(text, query) {
    if (!text) return '';
    if (!query || !query.trim()) return this.escapeHTML(text);

    const qNorm = this.normalizeArabicText(query);
    if (!qNorm) return this.escapeHTML(text);

    const parts = text.split(/(\s+)/);
    return parts.map(part => {
      const partNorm = this.normalizeArabicText(part);
      if (partNorm && (partNorm.includes(qNorm) || qNorm.includes(partNorm))) {
        return `<span class="search-highlight">${this.escapeHTML(part)}</span>`;
      }
      return this.escapeHTML(part);
    }).join('');
  }

  // Render Instant Floating Live Search Overlay Results
  renderLiveSearchResults() {
    const liveResultsContainer = document.getElementById("search-live-results");
    if (!liveResultsContainer) return;

    const qNorm = this.normalizeArabicText(this.searchQuery);

    // If query is empty, display popular trending search tags
    if (!qNorm) {
      liveResultsContainer.style.display = 'block';
      liveResultsContainer.innerHTML = `
        <div class="live-search-header">
          <span><i class="fa-solid fa-fire text-amber"></i> الكلمات الأكثر بحثاً وتداولا</span>
        </div>
        <div class="quick-search-tags" style="display:flex; flex-wrap:wrap; gap:6px; padding:6px 0 10px 0;">
          <span class="quick-search-tag" onclick="app.quickSearchTag('شاهد VIP')">🎬 شاهد VIP</span>
          <span class="quick-search-tag" onclick="app.quickSearchTag('نتفليكس')">🎥 نتفليكس 4K</span>
          <span class="quick-search-tag" onclick="app.quickSearchTag('ChatGPT')">🤖 ChatGPT Plus</span>
          <span class="quick-search-tag" onclick="app.quickSearchTag('كانفا')">🎨 كانفا Pro</span>
          <span class="quick-search-tag" onclick="app.quickSearchTag('يوتيوب')">▶️ يوتيوب بريميوم</span>
          <span class="quick-search-tag" onclick="app.quickSearchTag('TOD')">⚽ TOD مباريات</span>
        </div>
      `;
      return;
    }

    // Rank services strictly by calculated relevance score
    const scoredMatches = this.services
      .map(srv => ({
        service: srv,
        score: this.calculateRelevanceScore(srv, this.searchQuery)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    const matches = scoredMatches.map(item => item.service).slice(0, 6);

    liveResultsContainer.style.display = 'block';

    if (matches.length === 0) {
      liveResultsContainer.innerHTML = `
        <div class="live-search-empty">
          <i class="fa-solid fa-magnifying-glass" style="font-size:24px; margin-bottom:8px; display:block; color:var(--text-muted);"></i>
          لا توجد خدمات تطابق "<strong>${this.escapeHTML(this.searchQuery)}</strong>"
        </div>
      `;
      return;
    }

    liveResultsContainer.innerHTML = `
      <div class="live-search-header">
        <span><i class="fa-solid fa-bolt text-cyan"></i> نتائج البحث السريعة (${matches.length})</span>
        <span style="font-weight: 500; font-size: 11px;">مرتبة بالأكثر دقة</span>
      </div>
      <div class="live-search-list">
        ${matches.map(srv => `
          <div class="live-search-item" onclick="app.selectLiveSearchResult('${srv.id}')">
            <img src="${srv.image}" alt="${this.escapeHTML(srv.title)}" class="live-search-img" onerror="this.src='https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80'">
            <div class="live-search-info">
              <div class="live-search-title">${this.highlightMatch(srv.title, this.searchQuery)}</div>
              <div class="live-search-meta">
                <span class="live-search-badge">${this.getCategoryLabel(srv.category)}</span>
                <span><i class="fa-solid fa-bolt text-cyan"></i> ${this.escapeHTML(srv.delivery)}</span>
              </div>
            </div>
            <div class="live-search-price">${srv.price} ر.س</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  selectLiveSearchResult(serviceId) {
    this.closeLiveSearchResults();
    this.openProductModal(serviceId);
  }

  closeLiveSearchResults() {
    const liveResultsContainer = document.getElementById("search-live-results");
    if (liveResultsContainer) {
      liveResultsContainer.style.display = 'none';
    }
  }

  // Reset Search & Category Filters
  resetFilters() {
    if (this.currentRole === 'admin' || (this.adminView && this.adminView.style.display !== 'none')) {
      this.switchRole('user', true);
    }

    this.searchQuery = '';
    this.activeCategory = 'all';
    if (this.searchInput) this.searchInput.value = '';
    if (this.clearSearchBtn) this.clearSearchBtn.style.display = 'none';

    this.closeLiveSearchResults();

    document.querySelectorAll(".cat-pill").forEach(p => {
      p.classList.toggle("active", p.getAttribute("data-category") === 'all');
    });

    this.renderServices();
  }

  // Render Customer Services Grid with Smart Relevance Search Matching
  renderServices() {
    const qNorm = this.normalizeArabicText(this.searchQuery);

    let filtered = [];

    if (qNorm) {
      // Calculate relevance score and filter items with score > 0
      filtered = this.services
        .map(srv => {
          const matchCat = this.activeCategory === 'all' || srv.category === this.activeCategory;
          const score = matchCat ? this.calculateRelevanceScore(srv, this.searchQuery) : 0;
          return { service: srv, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (this.sortBy === 'price-asc') return a.service.price - b.service.price;
          if (this.sortBy === 'price-desc') return b.service.price - a.service.price;
          return 0;
        })
        .map(item => item.service);
    } else {
      filtered = this.services.filter(srv => {
        return this.activeCategory === 'all' || srv.category === this.activeCategory;
      });

      filtered.sort((a, b) => {
        if (this.sortBy === 'price-asc') return a.price - b.price;
        if (this.sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
    }

    if (this.servicesCountBadge) {
      this.servicesCountBadge.textContent = `${filtered.length} خدمات`;
    }

    if (!this.servicesGrid) return;

    if (filtered.length === 0) {
      this.servicesGrid.innerHTML = '';
      if (this.emptyState) this.emptyState.style.display = 'block';
      return;
    }

    if (this.emptyState) this.emptyState.style.display = 'none';

    this.servicesGrid.innerHTML = filtered.map(srv => `
      <div class="product-card" onclick="app.openProductModal('${srv.id}')" style="cursor: pointer;">
        <div class="card-image-wrap">
          <img src="${srv.image}" alt="${this.escapeHTML(srv.title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80'">
          ${srv.badge ? `<span class="card-badge">${this.escapeHTML(srv.badge)}</span>` : ''}
          <span class="card-delivery-tag"><i class="fa-solid fa-bolt"></i> ${this.escapeHTML(srv.delivery)}</span>
        </div>
        <div class="card-content">
          <span class="card-category">${this.getCategoryLabel(srv.category)}</span>
          <h3 class="card-title">${this.highlightMatch(srv.title, this.searchQuery)}</h3>
          <div class="card-period"><i class="fa-regular fa-clock"></i> المدة: ${this.escapeHTML(srv.period)}</div>
          <div class="card-price-row" style="margin-top:12px; display:flex; flex-direction:column; gap:10px;">
            <div class="price-wrapper">
              <span class="current-price">${srv.price} <small>ر.س</small></span>
              ${srv.originalPrice && srv.originalPrice > srv.price ? `<span class="original-price">${srv.originalPrice} ر.س</span>` : ''}
            </div>
            <div class="card-action-buttons" style="display:flex; gap:8px; width:100%;">
              <button class="btn btn-outline-primary btn-sm" onclick="app.openProductModal('${srv.id}', event)" style="flex:1; padding:8px 10px;">
                <i class="fa-solid fa-eye text-cyan"></i> التفاصيل
              </button>
              <button class="btn btn-primary btn-sm" onclick="app.addToCart('${srv.id}', event)" style="flex:1.2; padding:8px 10px;">
                <i class="fa-solid fa-cart-plus"></i> إضافة للسلة
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  getCategoryLabel(cat) {
    const map = {
      'entertainment': 'ترفيه وسينما',
      'ai': 'ذكاء اصطناعي وتصميم',
      'gaming': 'ألعاب وااشتراكات',
      'sports': 'رياضة ومباريات',
      'music': 'موسيقى وصوتيات'
    };
    return map[cat] || 'خدمات رقمية';
  }

  // PRODUCT DETAIL / QUICK VIEW MODAL
  openProductModal(serviceId, event = null) {
    if (event) event.stopPropagation();

    const srv = this.services.find(s => s.id === serviceId);
    if (!srv) return;

    const modalContent = document.getElementById("product-detail-content");
    const modalOverlay = document.getElementById("product-modal-overlay");

    if (modalContent && modalOverlay) {
      modalContent.innerHTML = `
        <div class="product-detail-media">
          <img src="${srv.image}" alt="${srv.title}" onerror="this.src='https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80'">
        </div>
        <div class="product-detail-info">
          ${srv.badge ? `<span class="card-badge" style="position:static; display:inline-block; margin-bottom:8px;">${srv.badge}</span>` : ''}
          <h2>${srv.title}</h2>
          <p class="product-cat-tag"><i class="fa-solid fa-tag text-purple"></i> ${this.getCategoryLabel(srv.category)}</p>
          
          <div class="product-meta-highlights" style="margin:16px 0; background:rgba(30,41,59,0.5); padding:12px; border-radius:8px;">
            <div><i class="fa-regular fa-clock text-amber"></i> <strong>مدة الاشتراك:</strong> ${srv.period}</div>
            <div style="margin-top:6px;"><i class="fa-solid fa-bolt text-cyan"></i> <strong>سرعة التسليم:</strong> ${srv.delivery}</div>
            <div style="margin-top:6px;"><i class="fa-solid fa-shield-halved text-green"></i> <strong>الضمان:</strong> ضمان شامل ومستمر طول فترة الاشتراك</div>
          </div>

          <div class="product-desc-box">
            <h4>تفاصيل ووصف الخدمة:</h4>
            <p style="line-height:1.7; color:var(--text-muted);">${srv.description || 'اشتراك رقمي رسمي عالي الجودة مع ضمان التسليم الفوري والخصوصية الكاملة.'}</p>
          </div>

          <div class="product-detail-actions" style="margin-top:24px; display:flex; align-items:center; justify-content:space-between; gap:16px;">
            <div class="price-wrapper">
              <span class="current-price" style="font-size:24px; font-weight:800; color:var(--primary-light);">${srv.price} <small>ر.س</small></span>
              ${srv.originalPrice && srv.originalPrice > srv.price ? `<span class="original-price" style="font-size:16px;">${srv.originalPrice} ر.س</span>` : ''}
            </div>
            <button class="btn btn-primary btn-lg" onclick="app.addToCart('${srv.id}'); app.closeProductModal();">
              <i class="fa-solid fa-cart-plus"></i> إضافة إلى السلة والشراء
            </button>
          </div>
        </div>
      `;
      modalOverlay.style.display = "flex";
    }
  }

  closeProductModal() {
    const modalOverlay = document.getElementById("product-modal-overlay");
    if (modalOverlay) modalOverlay.style.display = "none";
  }

  // CART MANAGEMENT
  addToCart(serviceId, event = null) {
    if (event) event.stopPropagation();

    const srv = this.services.find(s => s.id === serviceId);
    if (!srv) return;

    const existingItem = this.cart.find(item => item.id === serviceId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        id: srv.id,
        title: srv.title,
        price: srv.price,
        image: srv.image,
        period: srv.period,
        quantity: 1
      });
    }

    this.saveToStorage(this.getCartStorageKey(), this.cart);
    this.updateCartBadge();
    this.showToast(`تمت إضافة "${srv.title}" إلى السلة 🛒`, "success");
  }

  updateCartBadge() {
    const totalCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (this.cartBadgeCount) this.cartBadgeCount.textContent = totalCount;
  }

  openCart() {
    this.renderCartItems();
    const cartOverlay = document.getElementById("cart-modal-overlay");
    if (cartOverlay) cartOverlay.style.display = "flex";
  }

  closeCart() {
    const cartOverlay = document.getElementById("cart-modal-overlay");
    if (cartOverlay) cartOverlay.style.display = "none";
  }

  clearCart() {
    this.cart = [];
    this.saveToStorage(this.getCartStorageKey(), this.cart);
    this.updateCartBadge();
    this.renderCartItems();
    this.showToast("تم تفريغ السلة بنجاح", "info");
  }

  renderCartItems() {
    if (!this.cartItemsList) return;

    if (this.cart.length === 0) {
      this.cartItemsList.innerHTML = `
        <div class="cart-empty" style="text-align:center; padding:40px 20px;">
          <i class="fa-solid fa-cart-flatbed-empty" style="font-size:48px; color:var(--text-muted); margin-bottom:12px;"></i>
          <p style="color:var(--text-muted);">سلة التسوق فارغة حالياً</p>
        </div>
      `;
      if (this.cartTotalPrice) this.cartTotalPrice.textContent = '0 ر.س';
      if (this.cartItemsCount) this.cartItemsCount.textContent = '0';
      return;
    }

    const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);

    if (this.cartTotalPrice) this.cartTotalPrice.textContent = `${totalPrice} ر.س`;
    if (this.cartItemsCount) this.cartItemsCount.textContent = `${totalItems}`;

    this.cartItemsList.innerHTML = this.cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80'">
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.title}</h4>
          <div class="cart-item-price">${item.price} ر.س</div>
          <div class="cart-quantity-controls">
            <button onclick="app.updateCartQty('${item.id}', -1)"><i class="fa-solid fa-minus"></i></button>
            <span>${item.quantity}</span>
            <button onclick="app.updateCartQty('${item.id}', 1)"><i class="fa-solid fa-plus"></i></button>
          </div>
        </div>
        <button class="cart-remove-btn" onclick="app.removeFromCart('${item.id}')"><i class="fa-solid fa-trash-can"></i></button>
      </div>
    `).join('');
  }

  updateCartQty(serviceId, delta) {
    const item = this.cart.find(i => i.id === serviceId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeFromCart(serviceId);
      return;
    }

    this.saveToStorage(this.getCartStorageKey(), this.cart);
    this.updateCartBadge();
    this.renderCartItems();
  }

  removeFromCart(serviceId) {
    this.cart = this.cart.filter(i => i.id !== serviceId);
    this.saveToStorage(this.getCartStorageKey(), this.cart);
    this.updateCartBadge();
    this.renderCartItems();
    this.showToast("تم حذف المنتج من السلة", "info");
  }

  openCheckout() {
    if (this.cart.length === 0) {
      this.showToast("السلة فارغة، أضف بعض المنتجات أولاً", "error");
      return;
    }

    // Require subscriber login before purchasing/checkout
    if (!this.currentUser) {
      this.pendingCheckout = true;
      this.closeCart();
      this.showToast("🔒 لإتمام الشراء والطلب، يرجى تسجيل الدخول أو إنشاء حساب جديد", "info");
      this.openLoginModal('login');
      return;
    }

    const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const checkoutTotal = document.getElementById("checkout-total-price");
    if (checkoutTotal) checkoutTotal.textContent = `${totalPrice} ر.س`;

    // Auto fill user details if logged in
    const nameInput = document.getElementById("cust-name");
    const emailInput = document.getElementById("cust-email");
    if (nameInput) nameInput.value = this.currentUser.name;
    if (emailInput) emailInput.value = this.currentUser.email;

    this.closeCart();
    document.getElementById("checkout-modal-overlay").style.display = "flex";
  }

  // Country Code Dropdown Change Handler
  onCountryCodeChange(selectEl) {
    const phoneInput = document.getElementById("cust-phone");
    if (!phoneInput || !selectEl) return;
    const selectedOption = selectEl.options[selectEl.selectedIndex];
    const placeholderText = selectedOption.getAttribute("data-placeholder") || "770000000";
    phoneInput.placeholder = placeholderText;
  }

  // Payment Method Card Selection Handler
  selectPaymentMethod(cardEl) {
    document.querySelectorAll(".pay-method-card").forEach(c => c.classList.remove("active"));
    cardEl.classList.add("active");
    const radioInput = cardEl.querySelector("input[type='radio']");
    if (radioInput) radioInput.checked = true;
  }

  closeCheckout() {
    document.getElementById("checkout-modal-overlay").style.display = "none";
  }

  async submitCheckout(event) {
    if (event) event.preventDefault();

    const custName = document.getElementById("cust-name").value.trim();
    const rawPhone = document.getElementById("cust-phone").value.trim();
    const cleanDigits = rawPhone.replace(/\D/g, '');
    const countryCode = document.getElementById("cust-country-code") ? document.getElementById("cust-country-code").value : '+967';

    // Strict Phone Number Length Validation per Country
    if (countryCode === '+967') {
      // Yemen: Exactly 9 digits required (e.g. 770000000 / 730000000)
      if (cleanDigits.length !== 9) {
        this.showToast(`⚠️ رقم الجوال اليمني غير مكتمل! يجب أن يتكون من 9 أرقام (إدخالك الحالي: ${cleanDigits.length} أرقام)`, "error");
        const inputEl = document.getElementById("cust-phone");
        if (inputEl) inputEl.focus();
        return;
      }
    } else if (countryCode === '+966') {
      // Saudi Arabia: 9 or 10 digits
      if (cleanDigits.length < 9 || cleanDigits.length > 10) {
        this.showToast(`⚠️ رقم الجوال السعودي غير صحيح! يجب أن يتكون من 9 إلى 10 أرقام (إدخالك الحالي: ${cleanDigits.length} أرقام)`, "error");
        const inputEl = document.getElementById("cust-phone");
        if (inputEl) inputEl.focus();
        return;
      }
    } else if (countryCode === '+965' || countryCode === '+974' || countryCode === '+968' || countryCode === '+973') {
      // Gulf Countries (Kuwait, Qatar, Oman, Bahrain): 8 digits
      if (cleanDigits.length !== 8) {
        this.showToast(`⚠️ رقم الجوال غير مكتمل! يجب أن يتكون من 8 أرقام لهذا البلد (إدخالك الحالي: ${cleanDigits.length} أرقام)`, "error");
        const inputEl = document.getElementById("cust-phone");
        if (inputEl) inputEl.focus();
        return;
      }
    } else if (cleanDigits.length < 7) {
      this.showToast(`⚠️ رقم الجوال المكتوب ناقص وغير مكتمل! يرجى التأكد من الرقم`, "error");
      const inputEl = document.getElementById("cust-phone");
      if (inputEl) inputEl.focus();
      return;
    }

    const custPhone = countryCode ? `${countryCode} ${rawPhone}` : rawPhone;
    const custEmail = document.getElementById("cust-email").value.trim();

    const payMethodEl = document.querySelector("input[name='pay-method']:checked");
    if (!payMethodEl) {
      this.showToast("⚠️ يرجى اختيار وسيلة الدفع المناسبة للطلب أولاً", "error");
      return;
    }
    const payMethod = payMethodEl.value;

    if (this.cart.length === 0) {
      this.showToast("السلة فارغة، أضف بعض المنتجات أولاً", "error");
      return;
    }

    const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const generatedOrderCode = `MN-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    const orderPayload = {
      order_code: generatedOrderCode,
      customer_name: custName,
      customer_phone: custPhone,
      customer_email: custEmail,
      payment_method: payMethod,
      total_amount: totalPrice,
      items: [...this.cart],
      user_id: this.currentUser ? this.currentUser.id : null,
      created_at: nowIso
    };

    let serverOrderCode = generatedOrderCode;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.order_code) {
          serverOrderCode = resData.order_code;
          orderPayload.order_code = serverOrderCode;
        }
      }
    } catch (err) {
      console.warn("Backend API offline or error during checkout, storing order locally", err);
    }

    // 1. Add order to global orders array (for Admin panel view)
    this.orders.unshift(orderPayload);
    this.saveToStorage("manasati_orders", this.orders);

    // 2. Clear ONLY active user's cart (Admin cart or other users carts remain untouched)
    this.cart = [];
    this.saveToStorage(this.getCartStorageKey(), this.cart);
    this.updateCartBadge();
    this.renderCartItems();

    this.closeCheckout();

    // Show Receipt Modal
    document.getElementById("receipt-order-id").textContent = `#${serverOrderCode}`;
    document.getElementById("receipt-code").textContent = `ACT-${serverOrderCode}-OK`;

    const waText = encodeURIComponent(`مرحباً متجر منصتي 👋\nأود تفعيل طلبي رقم: #${serverOrderCode}\nالاسم: ${custName}\nالمبلغ: ${totalPrice} ر.س`);
    document.getElementById("whatsapp-order-link").href = `https://wa.me/967730688720?text=${waText}`;

    document.getElementById("receipt-modal-overlay").style.display = "flex";
    this.showToast("تم إرسال وحفظ الطلب بنجاح 🎉", "success");

    // Live sync Admin Dashboard orders table
    if (this.currentRole === 'admin' || (this.currentUser && this.currentUser.role === 'admin')) {
      this.renderAdminDashboard();
    }
  }

  handleOrderSubmit(event) {
    return this.submitCheckout(event);
  }

  closeReceipt() {
    document.getElementById("receipt-modal-overlay").style.display = "none";
  }

  // ==========================================
  // ADMIN DASHBOARD & CRUD OPERATIONS (PERSISTENT WAMP MYSQL)
  // ==========================================
  renderAdminDashboard() {
    const totalServices = this.services.length;
    const totalOrdersCount = this.orders.length;
    const totalRevenue = this.orders.reduce((sum, o) => sum + (o.total_amount || o.total || 0), 0);

    if (this.statTotalServices) this.statTotalServices.textContent = totalServices;
    if (this.statTotalOrders) this.statTotalOrders.textContent = totalOrdersCount;
    if (this.statTotalRevenue) this.statTotalRevenue.textContent = `${totalRevenue} ر.س`;
    if (this.ordersCountBadge) this.ordersCountBadge.textContent = `${totalOrdersCount} طلبات`;

    this.renderAdminServicesTable(this.services);
    this.renderAdminOrdersTable();
  }

  renderAdminServicesTable(list) {
    if (!this.adminServicesTbody) return;

    if (list.length === 0) {
      this.adminServicesTbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">لا توجد خدمات مضافة حالياً.</td></tr>`;
      return;
    }

    this.adminServicesTbody.innerHTML = list.map(srv => `
      <tr>
        <td><img src="${srv.image}" alt="${srv.title}" class="table-img" onerror="this.src='https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80'"></td>
        <td><strong>${srv.title}</strong></td>
        <td><span class="count-badge">${this.getCategoryLabel(srv.category)}</span></td>
        <td><strong class="text-purple">${srv.price} ر.س</strong></td>
        <td><span class="text-muted">${srv.originalPrice ? srv.originalPrice + ' ر.س' : '-'}</span></td>
        <td>${srv.badge ? `<span class="card-badge" style="position:static;">${srv.badge}</span>` : '-'}</td>
        <td><span class="text-cyan"><i class="fa-solid fa-bolt"></i> ${srv.delivery}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-warning btn-sm" onclick="app.openServiceModal('${srv.id}')" title="تعديل الخدمة">
              <i class="fa-solid fa-pen-to-square"></i> تعديل
            </button>
            <button class="btn btn-danger btn-sm" onclick="app.deleteService('${srv.id}')" title="حذف الخدمة">
              <i class="fa-solid fa-trash-can"></i> حذف
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  filterAdminTable(query) {
    const q = query.trim().toLowerCase();
    const filtered = this.services.filter(s => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    this.renderAdminServicesTable(filtered);
  }

  renderAdminOrdersTable() {
    if (!this.adminOrdersTbody) return;

    if (!this.orders || this.orders.length === 0) {
      this.adminOrdersTbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding: 24px;">لا توجد طلبات مسجلة بعد في قاعدة البيانات.</td></tr>`;
      return;
    }

    this.adminOrdersTbody.innerHTML = this.orders.map(o => {
      const code = o.order_code || o.id;
      const name = o.customer_name || o.customerName || 'عميل';
      const phone = o.customer_phone || o.phone || '-';
      const total = o.total_amount || o.total || 0;
      const payMethod = o.payment_method || o.paymentMethod || 'مدى';
      const date = o.created_at ? o.created_at.split("T")[0] : (o.date || 'اليوم');
      const itemsSummary = o.items && o.items.length > 0
        ? o.items.map(i => `${i.product_title} (x${i.quantity})`).join(", ")
        : (o.servicesSummary || 'اشتراكات رقمية');

      return `
        <tr>
          <td><strong class="text-cyan">#${code}</strong></td>
          <td><strong>${name}</strong></td>
          <td><span class="text-muted"><i class="fa-solid fa-phone text-green"></i> ${phone}</span></td>
          <td style="max-width:220px; font-size:12.5px;">${itemsSummary}</td>
          <td><strong class="text-green">${total} ر.س</strong></td>
          <td><span class="count-badge">${payMethod}</span></td>
          <td><span class="text-muted">${date}</span></td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="app.viewOrderDetails(${o.id || `'${code}'`})" title="استعراض وعرض الطلب">
              <i class="fa-solid fa-eye"></i> عرض الطلب
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // VIEW ORDER DETAILS MODAL (ADMIN)
  viewOrderDetails(orderId) {
    const order = this.orders.find(o => o.id == orderId || o.order_code == orderId);
    if (!order) return;

    const modalContent = document.getElementById("admin-order-detail-content");
    const codeTitle = document.getElementById("admin-order-code-title");
    const waBtn = document.getElementById("admin-order-whatsapp-btn");
    const modalOverlay = document.getElementById("admin-order-modal-overlay");

    const code = order.order_code || order.id;
    const name = order.customer_name || order.customerName || 'عميل';
    const phone = order.customer_phone || order.phone || '-';
    const email = order.customer_email || order.email || 'غير مدخل';
    const total = order.total_amount || order.total || 0;
    const payMethod = order.payment_method || order.paymentMethod || 'مدى';
    const date = order.created_at ? order.created_at.split("T")[0] : 'اليوم';
    const items = order.items || [];

    if (codeTitle) codeTitle.textContent = `#${code}`;

    if (waBtn) {
      const waMsg = encodeURIComponent(`مرحباً ${name} 👋\nنحسب أنك قمت بطلب رقم: #${code} من متجر منصتي\nالمبلغ: ${total} ر.س\nيرجى تأكيد طلبك لاستلام كود التفعيل.`);
      waBtn.href = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${waMsg}`;
    }

    if (modalContent) {
      modalContent.innerHTML = `
        <div class="order-info-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:20px; background:rgba(30,41,59,0.6); padding:16px; border-radius:8px;">
          <div><i class="fa-solid fa-user text-purple"></i> <strong>اسم العميل:</strong> ${name}</div>
          <div><i class="fa-solid fa-phone text-green"></i> <strong>رقم الجوال:</strong> ${phone}</div>
          <div><i class="fa-solid fa-envelope text-cyan"></i> <strong>البريد:</strong> ${email}</div>
          <div><i class="fa-solid fa-credit-card text-amber"></i> <strong>وسيلة الدفع:</strong> ${payMethod}</div>
          <div><i class="fa-regular fa-calendar text-muted"></i> <strong>تاريخ الطلب:</strong> ${date}</div>
          <div><i class="fa-solid fa-circle-check text-green"></i> <strong>الحالة:</strong> مكتمل وموثق</div>
        </div>

        <h4 style="margin-bottom:10px;"><i class="fa-solid fa-boxes-stacked"></i> الخدمات والاشتراكات المطلوبة:</h4>
        ${items.length > 0 ? `
          <table class="admin-table" style="margin-bottom:16px;">
            <thead>
              <tr>
                <th>اسم الاشتراك / الخدمة</th>
                <th>سعر الوحدة</th>
                <th>الكمية</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(i => `
                <tr>
                  <td><strong>${i.product_title}</strong></td>
                  <td>${i.price} ر.س</td>
                  <td><span class="count-badge">${i.quantity}</span></td>
                  <td><strong class="text-green">${(i.price * i.quantity).toFixed(2)} ر.س</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <p class="text-muted" style="padding:10px; background:rgba(15,23,42,0.4); border-radius:6px;">${order.servicesSummary || 'اشتراكات رقمية مخصصة'}</p>
        `}

        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:16px; border-radius:8px; border:1px solid var(--border-color);">
          <span style="font-size:16px; font-weight:600;">إجمالي مبلغ الطلب المستلم:</span>
          <span style="font-size:22px; font-weight:800; color:var(--text-green);">${total} ر.س</span>
        </div>
      `;
    }

    if (modalOverlay) modalOverlay.style.display = "flex";
  }

  closeAdminOrderModal() {
    const modalOverlay = document.getElementById("admin-order-modal-overlay");
    if (modalOverlay) modalOverlay.style.display = "none";
  }

  // CREATE / EDIT SERVICE MODAL (ADMIN)
  openServiceModal(serviceId = null) {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.showToast("🔒 غير مصرح لك بفتح نافذة التعديل. يجب استخدام حساب مسؤول", "error");
      return;
    }

    const modalTitle = document.getElementById("service-modal-title");
    const formServiceId = document.getElementById("form-service-id");

    if (serviceId) {
      const srv = this.services.find(s => s.id === serviceId);
      if (!srv) return;

      modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> تعديل الخدمة (${srv.title})`;
      formServiceId.value = srv.id;
      document.getElementById("form-title").value = srv.title;
      document.getElementById("form-category").value = srv.category;
      document.getElementById("form-price").value = srv.price;
      document.getElementById("form-original-price").value = srv.originalPrice || '';
      document.getElementById("form-period").value = srv.period;
      document.getElementById("form-badge").value = srv.badge || '';
      document.getElementById("form-delivery").value = srv.delivery;
      document.getElementById("form-image").value = srv.image;
      document.getElementById("form-description").value = srv.description || '';
    } else {
      modalTitle.innerHTML = `<i class="fa-solid fa-plus-circle"></i> إضافة خدمة رقمية جديدة`;
      formServiceId.value = '';
      document.getElementById("service-form").reset();
    }

    document.getElementById("service-modal-overlay").style.display = "flex";
  }

  closeServiceModal() {
    document.getElementById("service-modal-overlay").style.display = "none";
  }

  // SAVE SERVICE DIRECTLY INTO WAMP MYSQL DATABASE
  async handleSaveService(event) {
    event.preventDefault();

    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.showToast("🔒 لا تملك صلاحية مسؤول لإضافة خدمات جديدة", "error");
      return;
    }

    const serviceId = document.getElementById("form-service-id").value;
    const title = document.getElementById("form-title").value.trim();
    const category = document.getElementById("form-category").value;
    const price = parseFloat(document.getElementById("form-price").value);
    const originalPriceVal = document.getElementById("form-original-price").value;
    const originalPrice = originalPriceVal ? parseFloat(originalPriceVal) : null;
    const period = document.getElementById("form-period").value.trim();
    const badge = document.getElementById("form-badge").value.trim();
    const delivery = document.getElementById("form-delivery").value.trim();
    const image = document.getElementById("form-image").value.trim();
    const description = document.getElementById("form-description").value.trim();

    const payload = {
      title,
      category,
      price,
      originalPrice,
      period,
      badge,
      delivery,
      image,
      description
    };

    try {
      let response;
      if (serviceId) {
        // Edit existing in MySQL DB
        const existingSrv = this.services.find(s => s.id === serviceId);
        const dbId = existingSrv ? existingSrv.db_id : serviceId.replace("srv-", "");
        response = await fetch(`${API_BASE_URL}/products/${dbId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new in WAMP MySQL DB
        response = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          body: JSON.stringify(payload)
        });
      }

      const resData = await response.json();

      if (response.ok && resData.success) {
        this.showToast("🎉 " + resData.message, "success");
        this.closeServiceModal();
        await this.loadServicesFromDB(); // Reload & Sync directly from WAMP MySQL DB
      } else {
        this.showToast(resData.message || "حدث خطأ أثناء الاتصال بقاعدة البيانات", "error");
      }
    } catch (err) {
      console.error("Save product error:", err);
      this.showToast("فشل حفظ المنتج في خادم WAMP MySQL", "error");
    }
  }

  // DELETE SERVICE FROM WAMP MYSQL DATABASE
  async deleteService(serviceId) {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.showToast("🔒 غير مصرح لك بحذف خدمات", "error");
      return;
    }

    const srv = this.services.find(s => s.id === serviceId);
    if (!srv) return;

    if (confirm(`هل أنت متأكد من رغبتك في حذف خدمة "${srv.title}" نهائياً من قاعدة بيانات WAMP MySQL؟`)) {
      const dbId = srv.db_id || serviceId.replace("srv-", "");
      try {
        const response = await fetch(`${API_BASE_URL}/products/${dbId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });

        const resData = await response.json();

        if (response.ok && resData.success) {
          this.showToast("🗑️ " + resData.message, "info");
          await this.loadServicesFromDB();
        } else {
          this.showToast(resData.message || "فشل حذف المنتج من قاعدة البيانات", "error");
        }
      } catch (err) {
        console.error("Delete product error:", err);
        this.showToast("فشل الاتصال بخادم WAMP MySQL أثناء الحذف", "error");
      }
    }
  }

  // TOAST NOTIFICATIONS SYSTEM
  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let iconClass = "fa-circle-info";
    if (type === "success") iconClass = "fa-circle-check";
    if (type === "error") iconClass = "fa-triangle-exclamation";

    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-100%)";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  render() {
    this.updateCartBadge();
    this.renderServices();
  }
}

// Instantiate App when DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new ManasatiApp();
});