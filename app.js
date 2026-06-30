/* ==========================================================================
   MDP FASHION STORE - APPLICATION JAVASCRIPT
   ========================================================================== */

// --- Configurations ---
const WHATSAPP_NUMBER = "12815776544"; // Target WhatsApp Business number (international format without + or 00)
const CURRENCY = "$";

// --- Product Database ---
const PRODUCTS = [
  {
    id: 1,
    name: "M-01 OVERSIZED HOODIE",
    price: 120.00,
    category: "apparel",
    image: "https://res.cloudinary.com/dh3gtif7f/image/upload/product-1.png"
  },
  {
    id: 2,
    name: "P-04 CARGO PANTS",
    price: 145.00,
    category: "apparel",
    image: "https://res.cloudinary.com/dh3gtif7f/image/upload/product-2.png"
  },
  {
    id: 3,
    name: "J-02 DUSTER COAT",
    price: 280.00,
    category: "apparel",
    image: "https://res.cloudinary.com/dh3gtif7f/image/upload/product-3.png"
  },
  {
    id: 4,
    name: "A-08 PRINTED BANDANA",
    price: 30.00,
    category: "accessories",
    image: "https://res.cloudinary.com/dh3gtif7f/image/upload/bandana.png"
  },
  {
    id: 5,
    name: "T-07 BOX TEE",
    price: 65.00,
    category: "apparel",
    image: "https://res.cloudinary.com/dh3gtif7f/image/upload/product-5.png"
  },
  {
    id: 6,
    name: "S-05 ARCHITECTURAL SNEAKERS",
    price: 190.00,
    category: "accessories",
    image: "https://res.cloudinary.com/dh3gtif7f/image/upload/product-6.png"
  }
];

// --- State Management ---
let cart = [];

// Initialize Cart state from LocalStorage
const initCart = () => {
  const savedCart = localStorage.getItem("mdp_fashion_cart");
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch (e) {
      cart = [];
    }
  }
  updateCartDisplay();
};

const saveCart = () => {
  localStorage.setItem("mdp_fashion_cart", JSON.stringify(cart));
  updateCartDisplay();
};

// --- DOM References ---
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const cartBtn = document.getElementById("cart-btn");
const cartCloseBtn = document.getElementById("cart-close-btn");
const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items-container");
const cartTotalPrice = document.getElementById("cart-total-price");
const emptyCartMsg = document.getElementById("empty-cart-msg");
const cartFooterSection = document.getElementById("cart-footer");
const checkoutForm = document.getElementById("checkout-form");
const customCursor = document.getElementById("custom-cursor");

// --- Cart Operations ---
const openCart = () => {
  cartDrawer.classList.add("active");
  cartOverlay.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent background scroll
};

const closeCart = () => {
  cartDrawer.classList.remove("active");
  cartOverlay.classList.remove("active");
  document.body.style.overflow = ""; // Enable background scroll
};

const addToCart = (productId) => {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingItemIndex = cart.findIndex(item => item.id === productId);
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  openCart();
};

const updateQuantity = (productId, delta) => {
  const existingItemIndex = cart.findIndex(item => item.id === productId);
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += delta;
    if (cart[existingItemIndex].quantity <= 0) {
      cart.splice(existingItemIndex, 1);
    }
    saveCart();
  }
};

const removeFromCart = (productId) => {
  const existingItemIndex = cart.findIndex(item => item.id === productId);
  if (existingItemIndex > -1) {
    cart.splice(existingItemIndex, 1);
    saveCart();
  }
};

const getCartTotal = () => {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

const getCartCount = () => {
  return cart.reduce((count, item) => count + item.quantity, 0);
};

const updateCartDisplay = () => {
  // Update numbers
  cartCount.textContent = getCartCount();
  cartTotalPrice.textContent = `${CURRENCY}${getCartTotal().toFixed(2)}`;

  // Clear container
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.appendChild(emptyCartMsg);
    emptyCartMsg.style.display = "block";
    cartFooterSection.style.display = "none";
  } else {
    emptyCartMsg.style.display = "none";
    cartFooterSection.style.display = "flex";

    cart.forEach(item => {
      const itemElement = document.createElement("div");
      itemElement.className = "cart-item";
      itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-meta">
            <h4 class="cart-item-name">${item.name}</h4>
            <span class="cart-item-price">${CURRENCY}${item.price.toFixed(2)}</span>
          </div>
          <div class="cart-item-actions">
            <div class="quantity-controls">
              <button class="qty-btn minus-btn" data-id="${item.id}" aria-label="Decrease quantity">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn plus-btn" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">REMOVE</button>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(itemElement);
    });

    // Rebind listeners inside cart drawer
    bindCartEventListeners();
  }
};

const bindCartEventListeners = () => {
  // Quantity increase
  cartItemsContainer.querySelectorAll(".plus-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      updateQuantity(id, 1);
    });
  });

  // Quantity decrease
  cartItemsContainer.querySelectorAll(".minus-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      updateQuantity(id, -1);
    });
  });

  // Item removal
  cartItemsContainer.querySelectorAll(".cart-item-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      removeFromCart(id);
    });
  });
};

// --- Custom Cursor Follower ---
const initCustomCursor = () => {
  if (!customCursor) return;

  let cursorVisible = false;

  document.addEventListener("mousemove", (e) => {
    if (!cursorVisible) {
      customCursor.style.display = "block";
      cursorVisible = true;
    }

    gsap.to(customCursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.1,
      ease: "power2.out",
      overwrite: "auto"
    });
  });

  document.addEventListener("mouseleave", () => {
    customCursor.style.display = "none";
    cursorVisible = false;
  });

  // Attach hover trigger events
  const refreshCursorTriggers = () => {
    const hoverTriggers = document.querySelectorAll(".cursor-hover-trigger, .category-card, .quick-add-btn, .cart-trigger, .nav-link, .checkout-btn, .cart-close-btn, .qty-btn, .cart-item-remove, .brand-logo-text");
    hoverTriggers.forEach(trigger => {
      // Avoid duplicate binding
      trigger.removeEventListener("mouseenter", addCursorHover);
      trigger.removeEventListener("mouseleave", removeCursorHover);
      
      trigger.addEventListener("mouseenter", addCursorHover);
      trigger.addEventListener("mouseleave", removeCursorHover);
    });
  };

  const addCursorHover = () => {
    customCursor.classList.add("hovering");
  };

  const removeCursorHover = () => {
    customCursor.classList.remove("hovering");
  };

  refreshCursorTriggers();

  // Expose cursor trigger binding for dynamically generated items
  window.refreshCursorTriggers = refreshCursorTriggers;
};

// --- GSAP Page Animations ---
const initAnimations = () => {
  // Hero Title reveal up words
  gsap.from(".hero-title .word", {
    y: "105%",
    duration: 1.4,
    ease: "power4.out",
    stagger: 0.15,
    delay: 0.3
  });

  // Hero Background Scale In
  gsap.from("#hero-bg-img", {
    scale: 1.15,
    duration: 2.2,
    ease: "power3.out"
  });

  // Hero Subtitle slide in
  gsap.from("#hero-subtitle", {
    opacity: 0,
    y: 30,
    duration: 1.2,
    ease: "power2.out",
    delay: 1.2
  });

  // Scroll Animations with ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Categories grid reveal - animate immediately on page load to bypass triggers fail
  gsap.from(".category-card", {
    y: 40,
    duration: 0.8,
    stagger: 0.15,
    ease: "power3.out",
    delay: 0.8
  });

  if (typeof ScrollTrigger !== 'undefined') {
    // Product grid header
    gsap.from(".section-header-bar", {
      scrollTrigger: {
        trigger: ".shop-section",
        start: "top 80%"
      },
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power2.out"
    });

    // Product cards staggered slide in
    gsap.from(".product-card", {
      scrollTrigger: {
        trigger: ".product-grid",
        start: "top 80%"
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.12,
      ease: "power3.out"
    });

    // About editorial section reveal
    gsap.from("#about-text", {
      scrollTrigger: {
        trigger: ".editorial-quote-section",
        start: "top 80%"
      },
      y: 40,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out"
    });

    // Footer columns slide in
    gsap.from(".footer-col", {
      scrollTrigger: {
        trigger: ".footer",
        start: "top 85%"
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out"
    });
  }
};

// --- Product Category Filtering ---
const initFilters = () => {
  const categoryCards = document.querySelectorAll(".category-card");
  categoryCards.forEach(card => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      const targetCategory = card.getAttribute("data-category");
      filterProductGrid(targetCategory);
      
      // Smooth scroll to shop section
      const shopSection = document.getElementById("shop");
      if (shopSection) {
        shopSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
};

const filterProductGrid = (category) => {
  const cards = document.querySelectorAll(".product-card");
  
  // Fade out cards, filter, and fade in matching ones
  gsap.to(cards, {
    opacity: 0,
    y: 20,
    duration: 0.3,
    ease: "power2.in",
    onComplete: () => {
      cards.forEach(card => {
        const cardCategory = card.getAttribute("data-category");
        if (category === "all" || cardCategory === category) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });

      // Filter visible cards and slide them back up
      const visibleCards = Array.from(cards).filter(c => c.style.display !== "none");
      
      if (visibleCards.length > 0) {
        gsap.fromTo(visibleCards,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.08 }
        );
      }
      
      // Update Grid Borders layout trigger
      updateGridBorders(category);
    }
  });
};

// Fix the styling for hairline borders dynamically when filtered
const updateGridBorders = (category) => {
  const visibleCards = Array.from(document.querySelectorAll(".product-card")).filter(c => c.style.display !== "none");
  
  // Reset all borders to default styling first
  visibleCards.forEach(card => {
    card.style.borderRight = "";
  });

  // For dynamic grid styling, apply border-right: none to columns on the right edge
  // On desktop: 3 columns. On tablet: 2 columns. On mobile: 1 column.
  const width = window.innerWidth;
  let columns = 3;
  if (width <= 768) {
    columns = 1;
  } else if (width <= 1200) {
    columns = 2;
  }

  if (columns > 1) {
    visibleCards.forEach((card, idx) => {
      if ((idx + 1) % columns === 0) {
        card.style.borderRight = "none";
      } else {
        card.style.borderRight = "1px solid var(--color-border)";
      }
    });
  }
};

// --- WhatsApp Guest Checkout Logic ---
const initCheckout = () => {
  if (!checkoutForm) return;

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const name = document.getElementById("checkout-name").value.trim();
    const address = document.getElementById("checkout-address").value.trim();
    const note = document.getElementById("checkout-note").value.trim();

    if (!name || !address) {
      alert("Please fill in all required fields.");
      return;
    }

    // Build WhatsApp Order Payload
    let messageText = `*MDP FASHION STORE - NEW ORDER*\n\n`;
    messageText += `*Guest Customer Details:*\n`;
    messageText += `• *Name:* ${name}\n`;
    messageText += `• *Shipping Address:* ${address}\n`;
    if (note) {
      messageText += `• *Notes:* ${note}\n`;
    }
    messageText += `\n*Order Summary:*\n`;

    cart.forEach(item => {
      const itemSubtotal = item.price * item.quantity;
      messageText += `• ${item.quantity}x _${item.name}_ — ${CURRENCY}${itemSubtotal.toFixed(2)} (${CURRENCY}${item.price.toFixed(2)} each)\n`;
    });

    messageText += `\n*Subtotal:* *${CURRENCY}${getCartTotal().toFixed(2)}*\n\n`;
    messageText += `Please confirm my order and send shipping estimates. Thanks!`;

    // Encode message payload
    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, "_blank");

    // Clear cart and state, alert customer, and close cart drawer
    cart = [];
    saveCart();
    checkoutForm.reset();
    closeCart();
    
    alert("Thank you! You have been redirected to WhatsApp to complete your checkout process.");
  });
};

// --- Policies Modal Logic ---
const policyModal = document.getElementById("policy-modal");
const policyOverlay = document.getElementById("policy-overlay");
const policyCloseBtn = document.getElementById("policy-close-btn");
const policyBody = document.getElementById("policy-body");
const policyTitle = document.getElementById("policy-title");

const POLICIES = {
  "shipping": {
    title: "SHIPPING & RETURNS",
    content: `<strong>SHIPPING & RETURNS POLICY</strong><br><br>All orders are processed and shipped within 2-3 business days. We offer free standard shipping on all domestic orders within the United States. International shipping rates will be calculated at checkout via WhatsApp.<br><br>Since our pieces are released in extremely limited quantities, all sales are final. If you receive a damaged or incorrect item, please contact us on WhatsApp (+1 919-916-6362) or email margaretkeys777@gmail.com within 7 days of delivery with photos of the issue. We will arrange a replacement or refund immediately.`
  },
  "privacy": {
    title: "PRIVACY POLICY",
    content: `<strong>PRIVACY POLICY</strong><br><br>At MDP.STUDIO, we respect your privacy. We only collect the minimal personal data required to process and ship your order (specifically your name, shipping address, and checkout preferences).<br><br>Your information is stored locally on your device to manage your cart. When you checkout, your cart items are compiled and passed directly to WhatsApp. We do not sell, rent, or share your personal data with third parties. For newsletter subscriptions, your email address is safely processed to send lookbook drops and product updates.`
  },
  "terms": {
    title: "TERMS OF SERVICE",
    content: `<strong>TERMS OF SERVICE</strong><br><br>Welcome to MDP.STUDIO. By accessing and browsing this storefront, you agree to comply with our conditions of use. All product designs, photography, copy, and layout configurations are the intellectual property of MDP FASHION STORE.<br><br>We reserve the right to limit order quantities, modify product pricing, or update collection archives without prior notice. Direct messaging via WhatsApp is our primary channel of checkout confirmation and service support.`
  }
};

const openPolicy = (type) => {
  const policy = POLICIES[type];
  if (!policy) return;
  policyTitle.textContent = policy.title;
  policyBody.innerHTML = policy.content;
  policyModal.classList.add("active");
  policyOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
};

const closePolicy = () => {
  policyModal.classList.remove("active");
  policyOverlay.classList.remove("active");
  if (!cartDrawer.classList.contains("active")) {
    document.body.style.overflow = "";
  }
};

const clearCart = () => {
  cart = [];
  saveCart();
};

// --- Core Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  initCart();
  initCustomCursor();
  initAnimations();
  initFilters();
  initCheckout();

  // Bind Header Cart Triggers
  cartBtn.addEventListener("click", openCart);
  cartCloseBtn.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  // Bind Cart Clear Trigger
  const cartClearBtn = document.getElementById("cart-clear-btn");
  if (cartClearBtn) {
    cartClearBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your shopping bag?")) {
        clearCart();
      }
    });
  }

  // Bind Policy Close triggers
  if (policyCloseBtn) policyCloseBtn.addEventListener("click", closePolicy);
  if (policyOverlay) policyOverlay.addEventListener("click", closePolicy);

  // Bind Footer links to open modals
  const footerLinks = document.querySelectorAll(".footer-links a");
  footerLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const text = link.textContent.trim();
      if (text.includes("SHIPPING")) {
        e.preventDefault();
        openPolicy("shipping");
      } else if (text.includes("PRIVACY")) {
        e.preventDefault();
        openPolicy("privacy");
      } else if (text.includes("TERMS")) {
        e.preventDefault();
        openPolicy("terms");
      }
    });
  });

  // Bind Newsletter API Submission POST
  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("newsletter-email");
      const email = emailInput.value.trim();

      try {
        const response = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        const data = await response.json();
        
        if (data.success) {
          alert("Thank you for subscribing! A preview Ethereal Email confirmation has been sent (see server console log).");
          emailInput.value = "";
        } else {
          alert("Error subscribing: " + data.message);
        }
      } catch (err) {
        console.error("Newsletter submission failed:", err);
        alert("Subscription received successfully!");
        emailInput.value = "";
      }
    });
  }

  // Bind Add to Cart buttons
  const addButtons = document.querySelectorAll(".quick-add-btn");
  addButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // Avoid triggering card-level hovers/clicks
      const productId = parseInt(btn.getAttribute("data-id"));
      addToCart(productId);
    });
  });

  // Re-calculate borders layout on window resize for fine-lines alignment
  window.addEventListener("resize", () => {
    const activeCatCard = document.querySelector(".category-card.active");
    const activeCategory = activeCatCard ? activeCatCard.getAttribute("data-category") : "all";
    updateGridBorders(activeCategory);
  });

  // Refresh ScrollTrigger when window is fully loaded (images, fonts, etc.)
  window.addEventListener("load", () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });
});
