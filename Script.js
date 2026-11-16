/* ==========================================================
   Kitchen Counter - script.js
   1. Your images   2. Menu data and login settings   3. Helpers
   4. Shopping cart 5. Screens (login first)   6. Menu and start-up
   ========================================================== */
(function () {
  "use strict";

  /* ---------- 1. PUT YOUR IMAGES HERE ----------
     Copy your photos into an "images" folder next to this file,
     then type each path between the quotes.
     Leave "" to keep an empty IMAGE box. Square photos look best. */
  var IMAGES = {
    "margherita":     "4.png",   // e.g. "images/margherita.jpg"
    "pepperoni":      "16.png",
    "four-cheese":    "15.png",
    "garden":         "14.png",
    "classic-beef":   "13.png",
    "double-cheese":  "12.png",
    "crispy-chicken": "11.png",
    "mushroom-swiss": "10.png",
    "lemonade":       "9.png",
    "iced-tea":       "8.png",
    "cola":           "7.png",
    "mango-smoothie": "6.png"
  };

  /* ---------- 2. Menu data ---------- */
  var CATEGORIES = ["Pizza", "Burgers", "Drinks"];
  var DELIVERY_FEE = 3;
  var FREE_DELIVERY_OVER = 30;

  var ITEMS = [
    { id: "margherita",     name: "Margherita Pizza",      cat: "Pizza",   price: 12, desc: "Tomato sauce, fresh mozzarella and basil on a thin, blistered crust." },
    { id: "pepperoni",      name: "Pepperoni Pizza",       cat: "Pizza",   price: 14, desc: "Spicy pepperoni, mozzarella and a touch of chilli oil." },
    { id: "four-cheese",    name: "Four Cheese Pizza",     cat: "Pizza",   price: 15, desc: "Mozzarella, cheddar, parmesan and gorgonzola, finished with honey." },
    { id: "garden",         name: "Garden Veggie Pizza",   cat: "Pizza",   price: 13, desc: "Peppers, olives, red onion and sweetcorn on tomato sauce." },
    { id: "classic-beef",   name: "Classic Beef Burger",   cat: "Burgers", price: 10, desc: "Grilled beef patty, lettuce, tomato and house sauce in a toasted bun." },
    { id: "double-cheese",  name: "Double Cheese Burger",  cat: "Burgers", price: 13, desc: "Two beef patties, two slices of melted cheddar, pickles and onion." },
    { id: "crispy-chicken", name: "Crispy Chicken Burger", cat: "Burgers", price: 11, desc: "Buttermilk fried chicken, slaw and spicy mayo." },
    { id: "mushroom-swiss", name: "Mushroom Swiss Burger", cat: "Burgers", price: 12, desc: "Beef patty, sauteed mushrooms and Swiss cheese." },
    { id: "lemonade",       name: "Fresh Lemonade",        cat: "Drinks",  price: 4,  desc: "Pressed lemons, a little sugar, lots of ice." },
    { id: "iced-tea",       name: "Iced Tea",              cat: "Drinks",  price: 4,  desc: "Black tea brewed daily, lightly sweetened, served over ice." },
    { id: "cola",           name: "Cola",                  cat: "Drinks",  price: 3,  desc: "Classic cola served ice cold." },
    { id: "mango-smoothie", name: "Mango Smoothie",        cat: "Drinks",  price: 6,  desc: "Ripe mango blended with yogurt and a squeeze of lime." }
  ];

  /* ---------- 3. Helpers ---------- */
  function $(id) { return document.getElementById(id); }

  function findItem(id) {
    for (var i = 0; i < ITEMS.length; i++) {
      if (ITEMS[i].id === id) { return ITEMS[i]; }
    }
    return null;
  }

  function money(n) { return "$" + n.toFixed(2); }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* Photo from IMAGES, or an empty IMAGE box if no path is set */
  function imageHtml(item) {
    var src = IMAGES[item.id];
    if (src) {
      return '<img class="art" src="' + escapeHtml(src) + '" alt="' + escapeHtml(item.name) + '">';
    }
    return '<div class="art ph" role="img" aria-label="Empty image slot for ' + escapeHtml(item.name) + '"><span>IMAGE</span></div>';
  }

  /* ---------- 4. Shopping cart (saved in localStorage) ---------- */
  var CART_KEY = "kitchen-counter-cart";
  var cart = {};          // { itemId: quantity }
  var filter = "All";     // current Shop filter
  var order = null;       // set after Place order
  var USER_KEY = "kitchen-counter-user";
  var user = null;        // username of the signed-in person, or null
  var justLoggedIn = false;   // show the welcome message once on Home

  function loadCart() {
    try {
      var saved = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
      if (saved && typeof saved === "object") { cart = saved; }
    } catch (e) { cart = {}; }
  }

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* storage blocked */ }
  }

  function cartIds() {
    return Object.keys(cart).filter(function (id) { return cart[id] > 0 && findItem(id); });
  }

  function cartCount() {
    return cartIds().reduce(function (sum, id) { return sum + cart[id]; }, 0);
  }

  function cartSubtotal() {
    return cartIds().reduce(function (sum, id) { return sum + cart[id] * findItem(id).price; }, 0);
  }

  function deliveryFee() {
    return cartSubtotal() >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
  }

  function addToCart(id)      { cart[id] = (cart[id] || 0) + 1; saveCart(); updateBadge(); }
  function increaseItem(id)   { cart[id] = (cart[id] || 0) + 1; saveCart(); updateBadge(); }
  function decreaseItem(id)   { cart[id] = Math.max(0, (cart[id] || 0) - 1); saveCart(); updateBadge(); }
  function removeFromCart(id) { delete cart[id]; saveCart(); updateBadge(); }
  function clearCart()        { cart = {}; saveCart(); updateBadge(); }

  function updateBadge() {
    var badges = document.querySelectorAll(".badge");
    for (var i = 0; i < badges.length; i++) { badges[i].textContent = cartCount(); }
  }

  /* ---------- 5. Screens ---------- */
  function cardHtml(item) {
    return '<article class="card">' +
      '<a class="pic" href="#product-' + item.id + '" aria-label="View ' + escapeHtml(item.name) + '">' + imageHtml(item) + '</a>' +
      '<div class="body">' +
        '<span class="tag">' + item.cat + '</span>' +
        '<a href="#product-' + item.id + '"><h3>' + escapeHtml(item.name) + '</h3></a>' +
        '<div class="row"><span class="price">' + money(item.price) + '</span>' +
        '<button class="btn sm" type="button" data-add="' + item.id + '">Add to cart</button></div>' +
      '</div></article>';
  }

  function showHome() {
    var banner = $("welcome-banner");
    banner.hidden = !(user && justLoggedIn);
    if (!banner.hidden) {
      banner.innerHTML = '<span class="welcome-success">Login successful.</span> Welcome, ' + escapeHtml(user) + '!';
    }
    justLoggedIn = false;
    $("featured").innerHTML = [findItem("margherita"), findItem("classic-beef")].map(cardHtml).join("");
    var slots = document.querySelectorAll("[data-cat-art]");
    for (var i = 0; i < slots.length; i++) {
      var cat = slots[i].getAttribute("data-cat-art");
      var first = ITEMS.filter(function (it) { return it.cat === cat; })[0];
      slots[i].innerHTML = imageHtml(first);
    }
  }

  function showShop() {
    var list = ITEMS.filter(function (it) { return filter === "All" || it.cat === filter; });
    $("product-grid").innerHTML = list.map(cardHtml).join("");
    var buttons = document.querySelectorAll(".filters [data-filter]");
    for (var i = 0; i < buttons.length; i++) {
      var f = buttons[i].getAttribute("data-filter");
      var n = f === "All" ? ITEMS.length : ITEMS.filter(function (it) { return it.cat === f; }).length;
      buttons[i].querySelector(".count").textContent = n;
      buttons[i].setAttribute("aria-pressed", f === filter);
    }
  }

  function showProduct(id) {
    var box = $("product-detail");
    var item = findItem(id);
    if (!item) {
      box.innerHTML = '<div class="empty"><h2>We could not find that item</h2><a class="btn" href="#shop">Back to the menu</a></div>';
      $("related-grid").innerHTML = "";
      return;
    }
    box.innerHTML =
      '<p class="crumb"><a href="#shop">Shop</a> / ' + item.cat + '</p>' +
      '<div class="product"><div class="big">' + imageHtml(item) + '</div>' +
      '<div class="info"><h1>' + escapeHtml(item.name) + '</h1>' +
      '<p class="price">' + money(item.price) + '</p>' +
      '<p class="muted">' + escapeHtml(item.desc) + '</p>' +
      '<button class="btn" type="button" data-add="' + item.id + '">Add to cart</button></div></div>';
    var related = ITEMS.filter(function (it) { return it.cat === item.cat && it.id !== item.id; }).slice(0, 3);
    $("related-grid").innerHTML = related.map(cardHtml).join("");
  }

  function showCart() {
    var root = $("cart-root");
    var ids = cartIds();
    if (ids.length === 0) {
      root.innerHTML = '<div class="empty"><p>Your cart is empty.</p><a class="btn" href="#shop" data-filter="All">Browse the menu</a></div>';
      return;
    }
    var rows = ids.map(function (id) {
      var item = findItem(id), qty = cart[id];
      return '<tr>' +
        '<td><div class="itemcell">' + imageHtml(item) +
          '<div><a href="#product-' + id + '">' + escapeHtml(item.name) + '</a>' +
          '<div><button class="linkbtn" type="button" data-remove="' + id + '">Remove</button></div></div></div></td>' +
        '<td class="r"><div class="qty">' +
          '<button type="button" data-dec="' + id + '" aria-label="Less ' + escapeHtml(item.name) + '">&minus;</button>' +
          '<span>' + qty + '</span>' +
          '<button type="button" data-inc="' + id + '" aria-label="More ' + escapeHtml(item.name) + '">+</button></div></td>' +
        '<td class="r price">' + money(qty * item.price) + '</td></tr>';
    }).join("");
    root.innerHTML =
      '<div class="tablewrap"><table><thead><tr><th>Item</th><th class="r">Qty</th><th class="r">Price</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="totalbar"><span class="t">Total ' + money(cartSubtotal()) + '</span><a class="btn" href="#checkout">Checkout</a></div>';
  }

  function showCheckout() {
    var root = $("checkout-root");

    if (order) {
      root.innerHTML =
        '<div class="ok"><h2>Thanks, ' + escapeHtml(order.name) + '. Order ' + order.id + ' is placed.</h2>' +
        '<p class="muted">Total ' + money(order.total) + '. This is a demo, so nothing was actually ordered.</p></div>' +
        '<p><a class="btn" href="#shop" data-filter="All">Order something else</a></p>';
      return;
    }

    var ids = cartIds();
    if (ids.length === 0) {
      root.innerHTML = '<div class="empty"><p>Add something to your cart before checking out.</p><a class="btn" href="#shop" data-filter="All">Browse the menu</a></div>';
      return;
    }

    var lines = ids.map(function (id) {
      return '<li>' + cart[id] + ' &times; ' + escapeHtml(findItem(id).name) + '</li>';
    }).join("");
    var sub = cartSubtotal(), fee = deliveryFee();

    root.innerHTML =
      '<div class="twocol">' +
        '<form id="checkout-form" novalidate><h2>Delivery</h2>' +
          '<label for="c-name">Name<input id="c-name" name="name" autocomplete="name" required></label>' +
          '<label for="c-addr">Address<input id="c-addr" name="address" autocomplete="street-address" required></label>' +
          '<label for="c-contact">Email / phone<input id="c-contact" name="contact" autocomplete="email" required></label>' +
          '<p id="checkout-error" class="note" role="alert" hidden></p>' +
          '<div><button class="btn" type="submit">Place order</button></div>' +
        '</form>' +
        '<aside class="summary"><h2>Summary</h2><ul>' + lines + '</ul>' +
          '<div class="line"><span>Items</span><span>' + money(sub) + '</span></div>' +
          '<div class="line"><span>Delivery</span><span>' + (fee ? money(fee) : "Free") + '</span></div>' +
          '<div class="line sum-total"><span>Total</span><span>' + money(sub + fee) + '</span></div>' +
          '<p class="note">Delivery is $' + DELIVERY_FEE + ', free over $' + FREE_DELIVERY_OVER + '.</p></aside>' +
      '</div>';

    $("checkout-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var form = e.target;
      var name = form.elements.name.value.trim();
      var address = form.elements.address.value.trim();
      var contact = form.elements.contact.value.trim();
      if (!name || !address || !contact) {
        var error = $("checkout-error");
        error.textContent = "Please fill in your name, address and email or phone.";
        error.hidden = false;
        return;
      }
      order = { id: "#" + (1000 + Math.floor(Math.random() * 9000)), name: name.split(" ")[0], total: sub + fee };
      clearCart();
      showCheckout();
      window.scrollTo(0, 0);
    });
  }

  /* Login screen (the first page) */
  function loadUser() {
    try { user = sessionStorage.getItem(USER_KEY) || null; } catch (e) { user = null; }
  }

  function saveUser() {
    try {
      if (user) { sessionStorage.setItem(USER_KEY, user); } else { sessionStorage.removeItem(USER_KEY); }
    } catch (e) { /* storage blocked */ }
  }

  function goTo(hash) {
    if (location.hash === hash) { route(); } else { location.hash = hash; }
  }

  /* Returns "" when the login is fine, otherwise the message to show */
  function checkLogin(name, pass) {
    if (!name || !pass) { return "Please enter your username and password."; }
    return "";
  }

  function showLogin() {
    $("login-box").hidden = !!user;
    $("signedInPanel").hidden = !user;
    if (user) {
      $("welcomeMessage").innerHTML = '<span class="welcome-success">Login successful.</span> Welcome, ' + escapeHtml(user) + '!';
    }
    $("formMessage").textContent = "";
  }

  function logout() {
    user = null;
    saveUser();
    $("loginForm").reset();
    goTo("#login");
  }

  /* ---------- 6. Menu, clicks and start-up ---------- */
  var SCREENS = { login: showLogin, home: showHome, shop: showShop, cart: showCart, checkout: showCheckout, about: function () {} };

  /* Show one screen. The address decides which: #home, #shop, #product-margherita, #cart ... */
  function route() {
    var hash = (location.hash || "#home").slice(1);
    var name = hash, productId = null;
    if (hash.indexOf("product-") === 0) { name = "product"; productId = hash.slice(8); }
    if (name !== "product" && !SCREENS[name]) { name = "home"; }
    if (!user) { name = "login"; productId = null; }   // sign in first
    document.body.classList.toggle("signed-out", !user);
    if (name !== "checkout") { order = null; }

    var views = document.querySelectorAll(".view");
    for (var i = 0; i < views.length; i++) { views[i].hidden = views[i].id !== "view-" + name; }

    var links = document.querySelectorAll("[data-nav]");
    var current = name === "product" ? "products" : name === "checkout" ? "cart" : name;
    for (var j = 0; j < links.length; j++) {
      if (links[j].getAttribute("data-nav") === current) { links[j].setAttribute("aria-current", "page"); }
      else { links[j].removeAttribute("aria-current"); }
    }

    if (name === "product") { showProduct(productId); }
    else { SCREENS[name](); }

    $("site-links").classList.remove("open");
    $("menu-toggle").setAttribute("aria-expanded", "false");
    updateBadge();
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("button, a");
    if (!t) { return; }

    if (t.hasAttribute("data-add")) {
      addToCart(t.getAttribute("data-add"));
      var old = t.textContent;
      t.textContent = "Added";
      setTimeout(function () { t.textContent = old; }, 900);
      return;
    }
    if (t.hasAttribute("data-filter")) {
      filter = t.getAttribute("data-filter");
      if (location.hash === "#shop") { showShop(); }   // already on Shop: just redraw
      return;
    }
    if (t.hasAttribute("data-inc"))         { increaseItem(t.getAttribute("data-inc")); showCart(); }
    else if (t.hasAttribute("data-dec"))    { decreaseItem(t.getAttribute("data-dec")); showCart(); }
    else if (t.hasAttribute("data-remove")) { removeFromCart(t.getAttribute("data-remove")); showCart(); }
  });

  $("menu-toggle").addEventListener("click", function () {
    var open = $("site-links").classList.toggle("open");
    this.setAttribute("aria-expanded", open);
  });

  $("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("username").value.trim();
    var problem = checkLogin(name, $("password").value);
    if (problem) { $("formMessage").textContent = problem; return; }
    user = name;
    justLoggedIn = true;
    saveUser();
    this.reset();
    $("password").type = "password";
    $("togglePassword").textContent = "Show";
    goTo("#home");
  });

  $("togglePassword").addEventListener("click", function () {
    var field = $("password");
    var hidden = field.type === "password";
    field.type = hidden ? "text" : "password";
    this.textContent = hidden ? "Hide" : "Show";
  });

  $("logout-btn").addEventListener("click", logout);
  $("logout-panel").addEventListener("click", logout);

  $("contact-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var status = $("contact-status");
    status.textContent = "Thanks. This is a demo form, so your message was not sent.";
    status.hidden = false;
    this.reset();
  });

  window.addEventListener("hashchange", function () { route(); window.scrollTo(0, 0); });
  loadCart();
  loadUser();
  route();
})();