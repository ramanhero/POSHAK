/**
 * Blurg Village - Authentic Client Interactive Engine
 * Handles Cart Drawer (authentic empty state & filled state), Instant Search, Video Autoplay, and Navigation
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // 1. CART ENGINE (Authentic Drawer Structure & Local State)
  // -------------------------------------------------------------
  const CART_KEY = 'bv_cart_items';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(items) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (e) {}
    updateCartUI();
  }

  function addToCart(product) {
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id && item.variant === product.variant);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += (product.quantity || 1);
    } else {
      cart.push({
        id: product.id || String(Date.now()),
        title: product.title || 'Product',
        price: parseFloat(product.price) || 1299,
        original_price: parseFloat(product.compare_at_price || product.price) || 1500,
        variant: product.variant || '28',
        image: product.image || '/cdn/shop/files/BLURGVILLAGE_LOGO_f5b5e1be-b25f-4efc-bc4b-877bd09d2808.webp',
        quantity: product.quantity || 1,
        handle: product.handle || ''
      });
    }
    saveCart(cart);
    openCartDrawer();
  }

  function updateQuantity(id, variant, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === id && i.variant === variant);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        removeFromCart(id, variant);
        return;
      }
    }
    saveCart(cart);
  }

  function removeFromCart(id, variant) {
    let cart = getCart();
    cart = cart.filter(i => !(i.id === id && i.variant === variant));
    saveCart(cart);
  }

  function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  function getCartCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function formatMoney(amount) {
    return '₹' + Math.round(amount).toLocaleString('en-IN') + '.00';
  }

  function updateCartUI() {
    const count = getCartCount();
    const total = getCartTotal();
    const cart = getCart();

    // 1. Update all cart count badges across the page
    document.querySelectorAll('.cart-count, #cart-icon-bubble .cart-count, [data-cart-count]').forEach(el => {
      el.textContent = count;
      if (count > 0) {
        el.classList.remove('hidden');
        el.style.display = 'inline-flex';
      } else {
        if (el.closest('.drawer__heading')) {
          el.style.display = 'inline-flex';
        } else {
          el.classList.add('hidden');
        }
      }
    });

    // 2. Find cart drawer elements
    const drawer = document.querySelector('cart-drawer, #sections--27862677192855__cart-drawer');
    if (!drawer) return;

    const drawerBody = drawer.querySelector('.drawer__body');
    if (!drawerBody) return;

    const emptyContainer = drawerBody.querySelector('.drawer__inner-empty');
    let filledContainer = drawerBody.querySelector('.drawer__inner-filled');

    if (!filledContainer) {
      filledContainer = document.createElement('div');
      filledContainer.className = 'drawer__inner-filled flex column flex-1 overflow-auto';
      filledContainer.style.display = 'none';
      drawerBody.appendChild(filledContainer);
    }

    if (cart.length === 0) {
      // Show authentic empty drawer state
      if (emptyContainer) {
        emptyContainer.style.display = 'flex';
      }
      filledContainer.style.display = 'none';
      filledContainer.innerHTML = '';
    } else {
      // Hide empty container and show filled items
      if (emptyContainer) {
        emptyContainer.style.display = 'none';
      }
      filledContainer.style.display = 'flex';

      const freeShippingThreshold = 999;
      const progressPercent = Math.min(100, Math.round((total / freeShippingThreshold) * 100));

      let filledHtml = `
        <!-- Free Shipping Milestone Bar -->
        <div class="drawer-spacing border-bottom" style="padding-top: 1.4rem; padding-bottom: 1.4rem; background: #fafafa;">
          <div class="flex space-between align-center" style="font-size: 1.2rem; font-weight: 600; letter-spacing: 0.03em; text-transform: uppercase;">
            <span>${total >= freeShippingThreshold ? '🎉 Free Shipping Unlocked!' : `Add ${formatMoney(freeShippingThreshold - total)} more for Free Shipping`}</span>
            <span class="fs-12 fw-700">${progressPercent}%</span>
          </div>
          <div style="height: 5px; width: 100%; background: #e5e5e5; border-radius: 3px; margin-top: 8px; overflow: hidden;">
            <div style="height: 100%; width: ${progressPercent}%; background: #111; transition: width 0.3s ease;"></div>
          </div>
        </div>

        <!-- Line Items List -->
        <div class="cart-drawer__items flex column gap-20 drawer-spacing grow-1 overflow-auto py-20 custom-scrollbar" style="padding-top: 2rem; padding-bottom: 2rem;">
      `;

      cart.forEach(item => {
        filledHtml += `
          <div class="cart-item flex gap-15 align-start" style="padding-bottom: 16px; border-bottom: 1px solid #eee;">
            <a href="/products/${item.handle}" class="cart-item__media rounded overflow-hidden flex-shrink-0" style="width: 75px; height: 100px; display: block; background: #f5f5f5;">
              <img src="${item.image}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" />
            </a>
            <div class="cart-item__details flex column grow-1" style="min-width: 0;">
              <div class="flex space-between align-start gap-10">
                <a href="/products/${item.handle}" class="h6 uppercase text-decoration-none text-color" style="font-size: 1.3rem; font-weight: 600; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.title}</a>
                <button type="button" class="bv-remove-item btn-reset pointer text-color opacity-50 hover-opacity-100" data-id="${item.id}" data-variant="${item.variant}" style="font-size: 20px; line-height: 1; padding: 0 4px; border: none; background: none; cursor: pointer;">&times;</button>
              </div>
              <div class="fs-12 text-color opacity-70" style="margin-top: 4px;">Size: <span style="font-weight: 600; color: #111;">${item.variant}</span></div>
              <div class="flex space-between align-center" style="margin-top: 14px;">
                <div class="inline-flex align-center border rounded" style="border: 1px solid #ddd; border-radius: 2px;">
                  <button type="button" class="bv-qty-btn btn-reset pointer" data-action="decrease" data-id="${item.id}" data-variant="${item.variant}" style="padding: 4px 10px; font-weight: bold; background: none; border: none; cursor: pointer;">-</button>
                  <span style="font-size: 13px; font-weight: 600; min-width: 24px; text-align: center;">${item.quantity}</span>
                  <button type="button" class="bv-qty-btn btn-reset pointer" data-action="increase" data-id="${item.id}" data-variant="${item.variant}" style="padding: 4px 10px; font-weight: bold; background: none; border: none; cursor: pointer;">+</button>
                </div>
                <div class="fs-14 fw-700 text-color" style="font-size: 14px; font-weight: 700;">${formatMoney(item.price * item.quantity)}</div>
              </div>
            </div>
          </div>
        `;
      });

      filledHtml += `
        </div>

        <!-- Footer -->
        <div class="cart-drawer__footer drawer-spacing border-top py-20" style="padding-top: 2rem; padding-bottom: 2rem; background: #fff;">
          <div class="flex space-between align-center mb-10" style="margin-bottom: 10px;">
            <span class="h6 uppercase fw-600" style="font-size: 1.4rem;">Subtotal</span>
            <span class="h5 fw-700" style="font-size: 1.6rem; font-weight: 700;">${formatMoney(total)}</span>
          </div>
          <p class="fs-11 text-color opacity-70 mb-15" style="font-size: 1.1rem; color: #777; margin-bottom: 15px;">Taxes and shipping calculated at checkout</p>
          <button type="button" id="bv-checkout-btn" class="block w-full btn pointer btn-primary text-center" style="width: 100%; padding: 14px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">CHECKOUT • ${formatMoney(total)}</button>
        </div>
      `;

      filledContainer.innerHTML = filledHtml;

      // Attach item action handlers
      filledContainer.querySelectorAll('.bv-qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const variant = btn.getAttribute('data-variant');
          const action = btn.getAttribute('data-action');
          updateQuantity(id, variant, action === 'increase' ? 1 : -1);
        });
      });

      filledContainer.querySelectorAll('.bv-remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const variant = btn.getAttribute('data-variant');
          removeFromCart(id, variant);
        });
      });

      const checkoutBtn = filledContainer.querySelector('#bv-checkout-btn');
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
          alert('Checkout initialized! Order amount: ' + formatMoney(total) + '\nFree shipping applied. Thank you for shopping with Blurg Village!');
        });
      }
    }
  }

  function openCartDrawer() {
    const drawer = document.querySelector('cart-drawer, #sections--27862677192855__cart-drawer');
    if (!drawer) return;

    drawer.classList.remove('invisible', 'content-hidden');
    drawer.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.style.display = 'block';
    drawer.style.visibility = 'visible';

    const modalInner = drawer.querySelector('.modal-inner');
    if (modalInner) {
      modalInner.style.transform = 'translateX(0)';
      modalInner.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    const overlay = drawer.querySelector('.modal-overlay');
    if (overlay) {
      overlay.style.opacity = '0.5';
      overlay.style.visibility = 'visible';
    }

    document.body.style.overflow = 'hidden';
    updateCartUI();
  }

  function closeCartDrawer() {
    const drawer = document.querySelector('cart-drawer, #sections--27862677192855__cart-drawer');
    if (!drawer) return;

    const modalInner = drawer.querySelector('.modal-inner');
    if (modalInner) {
      modalInner.style.transform = 'translateX(100%)';
    }
    const overlay = drawer.querySelector('.modal-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
    }

    setTimeout(() => {
      drawer.classList.add('invisible', 'content-hidden');
      drawer.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');
      drawer.style.display = 'none';
      document.body.style.overflow = '';
    }, 250);
  }

  // -------------------------------------------------------------
  // 2. SEARCH ENGINE (Drawer, Live Autocomplete)
  // -------------------------------------------------------------
  let catalogProducts = [];

  async function loadCatalog() {
    try {
      const res = await fetch('/products.json?limit=250');
      const data = await res.json();
      catalogProducts = data.products || [];
    } catch (e) {
      console.warn('Could not load products.json for search', e);
    }
  }

  function openSearchDrawer() {
    let searchDrawer = document.querySelector('action-search, #sections--27862677192855__header-search');
    if (!searchDrawer) return;

    searchDrawer.classList.remove('invisible', 'content-hidden');
    searchDrawer.classList.add('active');
    searchDrawer.style.display = 'block';
    searchDrawer.style.visibility = 'visible';

    const input = searchDrawer.querySelector('input[type="search"], input[name="q"], .search__input');
    if (input) {
      input.focus();
    }
    document.body.style.overflow = 'hidden';
  }

  function closeSearchDrawer() {
    let searchDrawer = document.querySelector('action-search, #sections--27862677192855__header-search');
    if (!searchDrawer) return;

    searchDrawer.classList.add('invisible', 'content-hidden');
    searchDrawer.classList.remove('active');
    searchDrawer.style.display = 'none';
    document.body.style.overflow = '';
  }

  function renderSearchResults(query, container) {
    if (!container) return;
    const q = query.toLowerCase().trim();
    if (!q) {
      container.innerHTML = '';
      return;
    }

    const matches = catalogProducts.filter(p => {
      return p.title.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
        (p.product_type && p.product_type.toLowerCase().includes(q));
    }).slice(0, 8);

    if (matches.length === 0) {
      container.innerHTML = `
        <div style="padding: 30px 20px; text-align: center; color: #666; font-size: 14px;">
          No products found for "${query}". Try searching for "Baggy", "Bootcut", "Jeans", or "Tee".
        </div>
      `;
      return;
    }

    let html = `
      <div style="padding: 15px 0;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #888; margin-bottom: 12px; letter-spacing: 0.05em;">
          PRODUCTS (${matches.length})
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
    `;

    matches.forEach(p => {
      const img = (p.images && p.images[0]) ? p.images[0].src : '/cdn/shop/files/BLURGVILLAGE_LOGO_f5b5e1be-b25f-4efc-bc4b-877bd09d2808.webp';
      const price = p.variants && p.variants[0] ? '₹' + Math.round(p.variants[0].price).toLocaleString('en-IN') : '₹1,299';

      html += `
        <a href="/products/${p.handle}" style="display: flex; gap: 10px; text-decoration: none; color: inherit; padding: 8px; border-radius: 4px; transition: background 0.15s; background: #fafafa;">
          <img src="${img}" alt="${p.title}" style="width: 50px; height: 65px; object-fit: cover; border-radius: 2px; flex-shrink: 0;" />
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.title}</div>
            <div style="font-size: 12px; font-weight: 700; color: #111; margin-top: 4px;">${price}</div>
          </div>
        </a>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // -------------------------------------------------------------
  // 3. ANNOUNCEMENT BAR ROTATOR
  // -------------------------------------------------------------
  function setupAnnouncementBar() {
    const bar = document.querySelector('announcement-bar, .section-announcement-bar');
    if (!bar) return;
    const slides = bar.querySelectorAll('.swiper-slide, [class*="announcement-bar__item"]');
    if (slides.length <= 1) return;

    let activeIdx = 0;
    slides.forEach((s, idx) => {
      s.style.display = idx === 0 ? 'block' : 'none';
    });

    setInterval(() => {
      slides[activeIdx].style.display = 'none';
      activeIdx = (activeIdx + 1) % slides.length;
      slides[activeIdx].style.display = 'block';
    }, 4000);
  }

  // -------------------------------------------------------------
  // 4. PRODUCT PAGE FORM INTERCEPTION
  // -------------------------------------------------------------
  function setupProductForms() {
    document.addEventListener('submit', function (e) {
      const form = e.target.closest('form');
      if (!form) return;
      const action = form.getAttribute('action') || '';
      if (action.includes('/cart/add') || form.classList.contains('product-form')) {
        e.preventDefault();
        e.stopPropagation();

        const titleEl = document.querySelector('.product__title, h1');
        const title = titleEl ? titleEl.textContent.trim() : 'Blurg Product';

        const priceEl = document.querySelector('.price-item--sale, .price-item--regular, .price__regular .price-item');
        let price = 1299;
        if (priceEl) {
          const match = priceEl.textContent.replace(/[^0-9.]/g, '');
          if (match) price = parseFloat(match);
        }

        const sizeInput = form.querySelector('input[name*="option"]:checked, select[name*="option"], input[name="id"]');
        let variant = '28';
        if (sizeInput) {
          variant = sizeInput.value || '28';
        }

        const imgEl = document.querySelector('.product__media img, .media img');
        const img = imgEl ? (imgEl.src || imgEl.getAttribute('data-src')) : '';

        const qtyInput = form.querySelector('input[name="quantity"]');
        const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

        addToCart({
          id: String(Date.now()),
          title: title,
          price: price,
          variant: variant,
          image: img,
          quantity: quantity
        });
      }
    });

    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.product-form__submit, [name="add"], .btn-add-to-cart, #AddToCart, .gk-btn-main');
      if (btn) {
        const form = btn.closest('form');
        if (form) {
          e.preventDefault();
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
    });
  }

  // -------------------------------------------------------------
  // 5. GLOBAL EVENT DELEGATION (Drawers, Overlays, Buttons)
  // -------------------------------------------------------------
  function setupGlobalListeners() {
    document.addEventListener('click', function (e) {
      // Cart trigger clicks
      const cartTrigger = e.target.closest('#cart-icon-bubble, [href="/cart"], .view-cart, .header__icon-cart');
      if (cartTrigger) {
        e.preventDefault();
        openCartDrawer();
        return;
      }

      // Search trigger clicks
      const searchTrigger = e.target.closest('#search-icon-bubble, .header-search, [href="/search"], .search-icon');
      if (searchTrigger) {
        e.preventDefault();
        openSearchDrawer();
        return;
      }

      // Close modal overlay clicks
      if (e.target.matches('modal-overlay, .modal-overlay')) {
        closeCartDrawer();
        closeSearchDrawer();
        return;
      }

      // Close buttons in cart or search modal
      if (e.target.closest('.modal__close, .modal-button-close, [is="button-close-model"], [aria-label="Close"], .btn-close')) {
        closeCartDrawer();
        closeSearchDrawer();
        return;
      }

      // Mobile Menu Trigger
      const menuTrigger = e.target.closest('.header__icon--menu, [aria-controls="Menu-Drawer"], .btn-menu-drawer');
      if (menuTrigger) {
        e.preventDefault();
        const menuDrawer = document.getElementById('Menu-Drawer');
        if (menuDrawer) {
          menuDrawer.classList.toggle('active');
          menuDrawer.classList.toggle('invisible');
        }
        return;
      }
    });

    // Search typing live filtering
    document.addEventListener('input', function (e) {
      if (e.target.matches('input[type="search"], input[name="q"], .search__input')) {
        const resultsContainer = document.querySelector('.predictive-search, .search-results, #predictive-search-results');
        renderSearchResults(e.target.value, resultsContainer);
      }
    });

    // Escape key closes drawers
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeCartDrawer();
        closeSearchDrawer();
      }
    });
  }

  // -------------------------------------------------------------
  // 6. PRODUCT PAGE ENGINE (Gallery Navigation, Drift Zoom, Swatches, Stepper, Accordions, Lightbox)
  // -------------------------------------------------------------
  function getHighResImageUrl(img) {
    if (!img) return '';
    const srcset = img.getAttribute('data-srcset') || img.srcset || '';
    if (srcset) {
      const parts = srcset.split(',').map(s => s.trim().split(/\s+/)[0]).filter(Boolean);
      if (parts.length > 0) {
        // Return first or cleanest candidate, strip width constraint
        return parts[0].replace(/([?&])width=\d+&?/g, '$1').replace(/[?&]$/, '');
      }
    }
    const src = img.getAttribute('src') || img.src || '';
    return src.replace(/([?&])width=\d+&?/g, '$1').replace(/[?&]$/, '');
  }

  function setupProductGallery() {
    const mainViewer = document.querySelector('[id^="GalleryMainViewer-"], .media-main-swiper, .swiper-wrapper-main');
    if (!mainViewer) return;

    const mainWrapper = mainViewer.querySelector('.swiper-wrapper');
    const mainSlides = mainWrapper ? Array.from(mainWrapper.querySelectorAll('.swiper-slide')) : [];
    if (mainSlides.length === 0) return;

    const thumbViewer = document.querySelector('[id^="GalleryThumbnailViewer-"], .media-thumb-swiper, .swiper-wrapper-thumbnail');
    const thumbWrapper = thumbViewer ? thumbViewer.querySelector('.swiper-wrapper') : null;
    const thumbSlides = thumbWrapper ? Array.from(thumbWrapper.querySelectorAll('.swiper-slide')) : [];

    const prevBtn = mainViewer.querySelector('.swiper-button-prev, [is="swiper-button-prev"]');
    const nextBtn = mainViewer.querySelector('.swiper-button-next, [is="swiper-button-next"]');
    const paginationEl = mainViewer.querySelector('.swiper-pagination');

    let activeIndex = 0;
    const totalSlides = mainSlides.length;

    // Ensure slides have proper images and data-zoom attributes
    mainSlides.forEach((slide, idx) => {
      const img = slide.querySelector('img');
      if (img) {
        const highRes = getHighResImageUrl(img);
        slide.setAttribute('data-zoom', highRes);
        if (!img.src || img.src.includes('data:image')) {
          img.src = highRes;
        }
      }
    });

    // Zoom Pane & Lens Elements for Drift Zoom
    let zoomPane = document.getElementById('bv-drift-zoom-pane');
    if (!zoomPane) {
      zoomPane = document.createElement('div');
      zoomPane.id = 'bv-drift-zoom-pane';
      zoomPane.className = 'drift-zoom-pane bv-custom-drift-pane';
      zoomPane.innerHTML = '<img id="bv-drift-zoom-img" alt="Product Zoom" />';
      document.body.appendChild(zoomPane);
    }
    const zoomImg = zoomPane.querySelector('img');

    let zoomLens = document.getElementById('bv-drift-zoom-lens');
    if (!zoomLens) {
      zoomLens = document.createElement('div');
      zoomLens.id = 'bv-drift-zoom-lens';
      zoomLens.className = 'drift-bounding-box bv-custom-drift-lens';
      document.body.appendChild(zoomLens);
    }

    const ZOOM_FACTOR = 2.5;
    let isHoveringGallery = false;
    let lastMouseX = null;
    let lastMouseY = null;

    function updateZoomPaneContent() {
      const activeSlide = mainSlides[activeIndex];
      if (!activeSlide) return;
      const img = activeSlide.querySelector('img');
      if (!img) return;
      const highRes = activeSlide.getAttribute('data-zoom') || getHighResImageUrl(img);
      if (zoomImg && zoomImg.getAttribute('data-active-src') !== highRes) {
        zoomImg.setAttribute('data-active-src', highRes);
        zoomImg.src = highRes;
      }
    }

    function showZoom(e) {
      if (window.innerWidth < 768) return;
      if (e && e.target && e.target.closest && e.target.closest('.swiper-arrow, .media-zoom-button, .swiper-button-prev, .swiper-button-next')) {
        hideZoom();
        return;
      }

      const activeSlide = mainSlides[activeIndex];
      if (!activeSlide) return;
      const img = activeSlide.querySelector('img');
      if (!img) return;

      isHoveringGallery = true;
      updateZoomPaneContent();

      const rect = activeSlide.getBoundingClientRect();
      const pageX = window.scrollX || window.pageXOffset || 0;
      const pageY = window.scrollY || window.pageYOffset || 0;

      // Position zoom pane strictly to the right of the gallery image
      const paneLeft = rect.right + pageX + 16;
      const paneTop = rect.top + pageY;
      const availableWidth = window.innerWidth - rect.right - 28;
      const paneWidth = Math.min(540, Math.max(340, availableWidth));
      const paneHeight = rect.height;

      zoomPane.style.left = `${paneLeft}px`;
      zoomPane.style.top = `${paneTop}px`;
      zoomPane.style.width = `${paneWidth}px`;
      zoomPane.style.height = `${paneHeight}px`;
      zoomPane.style.display = 'block';
      zoomPane.style.opacity = '1';

      // Lens dimensions based on zoom factor
      const lensWidth = Math.round(paneWidth / ZOOM_FACTOR);
      const lensHeight = Math.round(paneHeight / ZOOM_FACTOR);
      zoomLens.style.width = `${lensWidth}px`;
      zoomLens.style.height = `${lensHeight}px`;
      zoomLens.style.display = 'block';

      if (e && typeof e.clientX === 'number') {
        updateZoom(e);
      }
    }

    function hideZoom() {
      isHoveringGallery = false;
      if (zoomPane) {
        zoomPane.style.opacity = '0';
        zoomPane.style.display = 'none';
      }
      if (zoomLens) {
        zoomLens.style.display = 'none';
      }
    }

    function updateZoom(e) {
      if (window.innerWidth < 768) return;
      if (!e) return;

      if (e.target && e.target.closest && e.target.closest('.swiper-arrow, .media-zoom-button, .swiper-button-prev, .swiper-button-next')) {
        hideZoom();
        return;
      }

      const activeSlide = mainSlides[activeIndex];
      if (!activeSlide) return;

      const rect = activeSlide.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      lastMouseX = mouseX;
      lastMouseY = mouseY;

      // Hide if mouse wanders outside active slide bounds
      if (mouseX < rect.left || mouseX > rect.right || mouseY < rect.top || mouseY > rect.bottom) {
        hideZoom();
        return;
      }

      const pageX = window.scrollX || window.pageXOffset || 0;
      const pageY = window.scrollY || window.pageYOffset || 0;

      // Auto-restore zoom if it was hidden (e.g. after scrolling or re-entering)
      if (!isHoveringGallery || zoomPane.style.display === 'none') {
        isHoveringGallery = true;
        updateZoomPaneContent();

        const paneLeft = rect.right + pageX + 16;
        const paneTop = rect.top + pageY;
        const availableWidth = window.innerWidth - rect.right - 28;
        const paneWidth = Math.min(540, Math.max(340, availableWidth));
        const paneHeight = rect.height;

        zoomPane.style.left = `${paneLeft}px`;
        zoomPane.style.top = `${paneTop}px`;
        zoomPane.style.width = `${paneWidth}px`;
        zoomPane.style.height = `${paneHeight}px`;
        zoomPane.style.display = 'block';
        zoomPane.style.opacity = '1';

        const lensWidth = Math.round(paneWidth / ZOOM_FACTOR);
        const lensHeight = Math.round(paneHeight / ZOOM_FACTOR);
        zoomLens.style.width = `${lensWidth}px`;
        zoomLens.style.height = `${lensHeight}px`;
        zoomLens.style.display = 'block';
      }

      const relX = mouseX - rect.left;
      const relY = mouseY - rect.top;

      const paneWidth = parseFloat(zoomPane.style.width) || 500;
      const paneHeight = parseFloat(zoomPane.style.height) || rect.height;

      const lensWidth = paneWidth / ZOOM_FACTOR;
      const lensHeight = paneHeight / ZOOM_FACTOR;

      let lensLeft = relX - lensWidth / 2;
      let lensTop = relY - lensHeight / 2;

      if (lensLeft < 0) lensLeft = 0;
      if (lensLeft > rect.width - lensWidth) lensLeft = rect.width - lensWidth;
      if (lensTop < 0) lensTop = 0;
      if (lensTop > rect.height - lensHeight) lensTop = rect.height - lensHeight;

      zoomLens.style.left = `${rect.left + pageX + lensLeft}px`;
      zoomLens.style.top = `${rect.top + pageY + lensTop}px`;

      // Translate high-res image inside zoom pane
      if (zoomImg) {
        const zoomImgWidth = rect.width * ZOOM_FACTOR;
        const zoomImgHeight = rect.height * ZOOM_FACTOR;
        zoomImg.style.width = `${zoomImgWidth}px`;
        zoomImg.style.height = `${zoomImgHeight}px`;

        const tx = -(lensLeft * ZOOM_FACTOR);
        const ty = -(lensTop * ZOOM_FACTOR);
        zoomImg.style.transform = `translate3d(${tx}px, ${ty}px, 0px)`;
      }
    }

    function handleScroll() {
      if (window.innerWidth < 768 || lastMouseX === null || lastMouseY === null) return;
      const activeSlide = mainSlides[activeIndex];
      if (!activeSlide) return;

      const rect = activeSlide.getBoundingClientRect();

      // Check if the last known mouse position is still within active slide
      if (lastMouseX >= rect.left && lastMouseX <= rect.right && lastMouseY >= rect.top && lastMouseY <= rect.bottom) {
        const pageX = window.scrollX || window.pageXOffset || 0;
        const pageY = window.scrollY || window.pageYOffset || 0;

        const paneLeft = rect.right + pageX + 16;
        const paneTop = rect.top + pageY;
        const availableWidth = window.innerWidth - rect.right - 28;
        const paneWidth = Math.min(540, Math.max(340, availableWidth));
        const paneHeight = rect.height;

        zoomPane.style.left = `${paneLeft}px`;
        zoomPane.style.top = `${paneTop}px`;
        zoomPane.style.width = `${paneWidth}px`;
        zoomPane.style.height = `${paneHeight}px`;
        zoomPane.style.display = 'block';
        zoomPane.style.opacity = '1';

        const lensWidth = Math.round(paneWidth / ZOOM_FACTOR);
        const lensHeight = Math.round(paneHeight / ZOOM_FACTOR);
        zoomLens.style.width = `${lensWidth}px`;
        zoomLens.style.height = `${lensHeight}px`;
        zoomLens.style.display = 'block';

        const relX = lastMouseX - rect.left;
        const relY = lastMouseY - rect.top;

        let lensLeft = relX - lensWidth / 2;
        let lensTop = relY - lensHeight / 2;

        if (lensLeft < 0) lensLeft = 0;
        if (lensLeft > rect.width - lensWidth) lensLeft = rect.width - lensWidth;
        if (lensTop < 0) lensTop = 0;
        if (lensTop > rect.height - lensHeight) lensTop = rect.height - lensHeight;

        zoomLens.style.left = `${rect.left + pageX + lensLeft}px`;
        zoomLens.style.top = `${rect.top + pageY + lensTop}px`;

        if (zoomImg) {
          const zoomImgWidth = rect.width * ZOOM_FACTOR;
          const zoomImgHeight = rect.height * ZOOM_FACTOR;
          zoomImg.style.width = `${zoomImgWidth}px`;
          zoomImg.style.height = `${zoomImgHeight}px`;

          const tx = -(lensLeft * ZOOM_FACTOR);
          const ty = -(lensTop * ZOOM_FACTOR);
          zoomImg.style.transform = `translate3d(${tx}px, ${ty}px, 0px)`;
        }
      } else {
        hideZoom();
      }
    }

    // Attach zoom listeners to active slide container
    mainViewer.addEventListener('mouseenter', showZoom);
    mainViewer.addEventListener('mousemove', updateZoom);
    mainViewer.addEventListener('mouseleave', function () {
      lastMouseX = null;
      lastMouseY = null;
      hideZoom();
    });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Slider State Management
    function goToSlide(index, smooth = true) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;

      activeIndex = index;

      // Hardware-accelerated smooth slide transformation
      if (mainWrapper) {
        mainWrapper.style.display = 'flex';
        mainWrapper.style.flexDirection = 'row';
        mainWrapper.style.transition = smooth ? 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
        mainWrapper.style.transform = `translate3d(-${activeIndex * 100}%, 0px, 0px)`;
      }

      // Update slide active state
      mainSlides.forEach((s, idx) => {
        s.classList.toggle('swiper-slide-active', idx === activeIndex);
      });

      // Update counter (e.g., "1 / 10")
      if (paginationEl) {
        paginationEl.textContent = `${activeIndex + 1} / ${totalSlides}`;
      }

      // Update thumbnail indicators
      thumbSlides.forEach((ts, idx) => {
        const isActive = idx === activeIndex;
        ts.classList.toggle('active-thumb', isActive);
        ts.classList.toggle('swiper-slide-thumb-active', isActive);
        if (isActive) {
          ts.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });

      // Update zoom pane target if currently hovering
      if (isHoveringGallery) {
        updateZoomPaneContent();
      }
    }

    // Initial setup
    goToSlide(0, false);

    // Make Prev/Next buttons interactive
    const galleryScope = mainViewer.closest('.product__media-gallery') || mainViewer.closest('.block__media-gallery') || mainViewer;
    const allPrevBtns = Array.from(galleryScope.querySelectorAll('.swiper-button-prev, [is="swiper-button-prev"]'));
    const allNextBtns = Array.from(galleryScope.querySelectorAll('.swiper-button-next, [is="swiper-button-next"]'));

    allPrevBtns.forEach(btn => {
      btn.classList.remove('invisible');
      btn.style.cursor = 'pointer';
      btn.addEventListener('mouseenter', hideZoom);
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        goToSlide(activeIndex - 1);
      });
    });

    allNextBtns.forEach(btn => {
      btn.classList.remove('invisible');
      btn.style.cursor = 'pointer';
      btn.addEventListener('mouseenter', hideZoom);
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        goToSlide(activeIndex + 1);
      });
    });

    // Thumbnail Clicks
    thumbSlides.forEach((thumb, idx) => {
      thumb.style.cursor = 'pointer';
      thumb.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        goToSlide(idx);
      });
    });

    // Mobile Swipe Gesture
    let touchStartX = 0;
    let touchStartY = 0;
    mainViewer.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    mainViewer.addEventListener('touchend', function (e) {
      if (e.changedTouches && e.changedTouches[0]) {
        const diffX = e.changedTouches[0].clientX - touchStartX;
        const diffY = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < 0) {
            goToSlide(activeIndex + 1);
          } else {
            goToSlide(activeIndex - 1);
          }
        }
      }
    }, { passive: true });
  }

  // Size Variant Pill Selection
  function setupVariantSelector() {
    const variantInputs = document.querySelectorAll('.variant-input, .product-variants__input li');
    const sizeLegend = document.querySelector('.product-variants-info .option_value, legend .option_value');

    variantInputs.forEach(item => {
      const radio = item.querySelector('input[type="radio"], input.variant-options');
      const label = item.querySelector('label, .text-swatch-label');
      if (!label) return;

      label.addEventListener('click', function () {
        if (radio) {
          radio.checked = true;
          const val = radio.getAttribute('data-option-value') || radio.value || label.textContent.trim();
          if (sizeLegend) {
            sizeLegend.textContent = val;
          }
        }
        document.querySelectorAll('.text-swatch-label').forEach(l => l.classList.remove('active-size'));
        label.classList.add('active-size');
      });
    });
  }

  // Quantity Stepper (- and +)
  function setupQuantityStepper() {
    const qtyInputEl = document.querySelector('quantity-input input[name="quantity"], input#Quantity-template--27862681616535__main');
    const minusBtn = document.querySelector('quantity-input button[name="minus"]');
    const plusBtn = document.querySelector('quantity-input button[name="plus"]');
    const priceDetail = document.querySelector('.total-price__detail');

    let basePrice = 1899;
    if (priceDetail) {
      const match = priceDetail.textContent.replace(/[^0-9]/g, '');
      if (match) {
        const val = parseFloat(match);
        basePrice = val > 10000 ? val / 100 : val;
      }
    }

    function updatePriceDisplay(qty) {
      if (qtyInputEl) qtyInputEl.value = qty;
      if (priceDetail) {
        priceDetail.textContent = 'Rs. ' + Math.round(basePrice * qty).toLocaleString('en-IN') + '.00';
      }
    }

    if (minusBtn) {
      minusBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const current = parseInt(qtyInputEl?.value) || 1;
        updatePriceDisplay(Math.max(1, current - 1));
      });
    }

    if (plusBtn) {
      plusBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const current = parseInt(qtyInputEl?.value) || 1;
        updatePriceDisplay(current + 1);
      });
    }

    if (qtyInputEl) {
      qtyInputEl.addEventListener('input', function () {
        const current = parseInt(qtyInputEl.value) || 1;
        updatePriceDisplay(Math.max(1, current));
      });
    }
  }

  // Accordion Dropdowns
  function setupAccordions() {
    document.querySelectorAll('details.collapsible-row, details[is="collapsible-row"]').forEach(detail => {
      const summary = detail.querySelector('summary');
      if (summary) {
        summary.style.cursor = 'pointer';
        summary.addEventListener('click', function () {
          // Native details handles open attribute, arrow rotation handled via CSS
        });
      }
    });
  }

  // Fullscreen Lightbox Zoom Modal
  function setupLightboxZoom() {
    let lightboxModal = document.getElementById('bv-lightbox-modal');
    if (!lightboxModal) {
      lightboxModal = document.createElement('div');
      lightboxModal.id = 'bv-lightbox-modal';
      lightboxModal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:999999;align-items:center;justify-content:center;cursor:zoom-out;';
      lightboxModal.innerHTML = `
        <button type="button" id="bv-lightbox-close" style="position:absolute;top:20px;right:25px;background:none;border:none;color:#fff;font-size:36px;cursor:pointer;line-height:1;z-index:10;">&times;</button>
        <img id="bv-lightbox-img" style="max-width:90vw;max-height:90vh;object-fit:contain;border-radius:4px;box-shadow:0 10px 40px rgba(0,0,0,0.5);cursor:default;" />
      `;
      document.body.appendChild(lightboxModal);

      lightboxModal.addEventListener('click', function (e) {
        if (e.target.id === 'bv-lightbox-modal' || e.target.id === 'bv-lightbox-close') {
          lightboxModal.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    }

    document.addEventListener('click', function (e) {
      const zoomBtn = e.target.closest('.media-zoom-button, [is="media-zoom-button"]');
      if (zoomBtn) {
        e.preventDefault();
        const activeSlide = zoomBtn.closest('.swiper-slide') || document.querySelector('.swiper-slide-active');
        const img = activeSlide ? activeSlide.querySelector('img') : null;
        if (img) {
          const highRes = activeSlide.getAttribute('data-zoom') || getHighResImageUrl(img);
          const modalImg = document.getElementById('bv-lightbox-img');
          if (modalImg) modalImg.src = highRes;
          lightboxModal.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }
      }
    });
  }

  // Inject Dedicated High-Precision Gallery Styles
  function injectProductGalleryStyles() {
    if (document.getElementById('bv-gallery-enhancement-styles')) return;
    const style = document.createElement('style');
    style.id = 'bv-gallery-enhancement-styles';
    style.textContent = `
      /* Gallery Slides Flow */
      .swiper-wrapper-main {
        overflow: hidden !important;
        position: relative !important;
        width: 100% !important;
      }
      .swiper-wrapper-main .swiper-wrapper {
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        width: 100% !important;
        will-change: transform !important;
      }
      .swiper-wrapper-main .swiper-slide {
        flex: 0 0 100% !important;
        width: 100% !important;
        max-width: 100% !important;
        position: relative !important;
        cursor: crosshair !important;
      }

      /* Product Media Gallery Container Stacking Context */
      .product-detail__media {
        position: relative !important;
        z-index: 10 !important;
      }
      .product__media-gallery {
        position: relative !important;
      }

      /* Gallery Actions Wrapper */
      .swiper-actions {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none !important;
        z-index: 10000 !important;
      }

      /* Gallery Navigation Arrows - Always visible & interactive, no flickering */
      .media-main-swiper .swiper-actions .swiper-arrow,
      .swiper-wrapper-main .swiper-actions .swiper-arrow,
      .product__media-gallery .swiper-actions .swiper-arrow,
      .swiper-actions .swiper-arrow {
        opacity: 0.9 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        cursor: pointer !important;
        z-index: 10001 !important;
        width: 44px !important;
        height: 44px !important;
        background-color: #000000 !important;
        border: 1px solid #000000 !important;
        border-radius: 50% !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        position: absolute !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25) !important;
        transition: opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease !important;
      }
      .swiper-actions .swiper-button-prev {
        left: 20px !important;
        right: auto !important;
      }
      .swiper-actions .swiper-button-next {
        right: 20px !important;
        left: auto !important;
      }
      .swiper-actions .swiper-arrow:hover {
        opacity: 1 !important;
        transform: translateY(-50%) scale(1.12) !important;
        background-color: #111111 !important;
      }
      .swiper-actions .swiper-arrow svg {
        fill: #ffffff !important;
        stroke: #ffffff !important;
        color: #ffffff !important;
        width: 12px !important;
        height: 16px !important;
      }

      /* Zoom in Button on Slide Hover */
      .media-zoom-button .show-on-hover {
        transition: opacity 0.2s ease, visibility 0.2s ease !important;
      }
      .swiper-slide:hover .media-zoom-button .show-on-hover {
        visibility: visible !important;
        opacity: 1 !important;
      }

      /* Thumbnails Strip */
      .swiper-wrapper-thumbnail .swiper-wrapper {
        display: flex !important;
        gap: 10px !important;
        overflow-x: auto !important;
        scrollbar-width: thin !important;
        padding: 4px 0 !important;
      }
      .swiper-wrapper-thumbnail .swiper-slide {
        flex: 0 0 75px !important;
        width: 75px !important;
        height: 100px !important;
        cursor: pointer !important;
        border-radius: 4px !important;
        overflow: hidden !important;
        border: 2px solid transparent !important;
        opacity: 0.6 !important;
        transition: border-color 0.2s, opacity 0.2s !important;
      }
      .swiper-wrapper-thumbnail .swiper-slide:hover {
        opacity: 1 !important;
      }
      .swiper-wrapper-thumbnail .swiper-slide.active-thumb,
      .swiper-wrapper-thumbnail .swiper-slide.swiper-slide-thumb-active {
        border-color: #000000 !important;
        opacity: 1 !important;
      }

      /* Drift Zoom Pane (Positioned Right Beside Gallery Image) */
      .bv-custom-drift-pane,
      .drift-zoom-pane {
        position: absolute !important;
        z-index: 99999 !important;
        background-color: #ffffff !important;
        border: 1px solid rgba(0, 0, 0, 0.1) !important;
        border-radius: 8px !important;
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15) !important;
        overflow: hidden !important;
        pointer-events: none !important;
        display: none;
        opacity: 0;
        transition: opacity 0.15s ease-out !important;
      }
      .bv-custom-drift-pane img,
      .drift-zoom-pane img {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        max-width: none !important;
        max-height: none !important;
        object-fit: cover !important;
      }

      /* Drift Bounding Box (Lens on Gallery Image) */
      .bv-custom-drift-lens,
      .drift-bounding-box {
        position: absolute !important;
        z-index: 9998 !important;
        pointer-events: none !important;
        background-color: rgba(0, 0, 0, 0.15) !important;
        border: 1px solid rgba(255, 255, 255, 0.85) !important;
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.25) !important;
        border-radius: 4px !important;
        display: none;
      }

      /* Variant Size Swatch Buttons */
      .variant-input input[type="radio"]:checked + .text-swatch-label,
      .variant-input .text-swatch-label.active-size {
        background-color: #000000 !important;
        color: #ffffff !important;
        border-color: #000000 !important;
      }
      .variant-input input[type="radio"]:checked + .text-swatch-label span,
      .variant-input .text-swatch-label.active-size span {
        color: #ffffff !important;
      }
      .variant-input .text-swatch-label {
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }
      .variant-input .text-swatch-label:hover {
        border-color: #000000 !important;
      }

      /* Accordion Dropdown Animation & Arrow */
      details.collapsible-row summary {
        cursor: pointer !important;
        user-select: none !important;
      }
      details.collapsible-row summary .icon-rotate {
        transition: transform 0.3s ease !important;
      }
      details.collapsible-row[open] summary .icon-rotate {
        transform: rotate(180deg) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // -------------------------------------------------------------
  // 7. INITIALIZATION ON DOM READY
  // -------------------------------------------------------------
  function init() {
    loadCatalog();
    updateCartUI();
    setupAnnouncementBar();
    setupProductForms();
    setupGlobalListeners();

    // Product page enhancements
    injectProductGalleryStyles();
    setupProductGallery();
    setupVariantSelector();
    setupQuantityStepper();
    setupAccordions();
    setupLightboxZoom();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

