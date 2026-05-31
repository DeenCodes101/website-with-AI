/* Syela Cakes - simple multi-page app (no backend)
   - Menu + featured cakes
   - Cart stored in localStorage
   - Checkout summary generator
   - Custom cake request summary generator
   - Contact message summary generator
*/

const CONTACT = {
  location: "Osu-Accra",
  phone: "0300111661",
  email: "syelacakes@gmail.com",
};

const CURRENCY = "GH₵";

/** @type {{id:string,name:string,price:number,category:string,description:string,image:string,featured?:boolean}[]} */
const PRODUCTS = [
  {
    id: "chocolate-cake",
    name: "Chocolate cake",
    price: 900,
    category: "Cake",
    description: "Rich chocolate layers with silky ganache finish.",
    image:
      "https://images.unsplash.com/photo-1607478900766-efe13248b125?auto=format&fit=crop&w=1400&q=80",
    featured: true,
  },
  {
    id: "vanilla-cake",
    name: "Vanilla cake",
    price: 650,
    category: "Cake",
    description: "Soft vanilla sponge with creamy frosting.",
    image:
      "https://images.unsplash.com/photo-1525640932057-b18561aca9b5?auto=format&fit=crop&w=1400&q=80",
    featured: true,
  },
  {
    id: "red-velvet",
    name: "Red velvet",
    price: 950,
    category: "Cake",
    description: "Classic red velvet with smooth cream-cheese frosting.",
    image:
      "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&w=1400&q=80",
    featured: true,
  },
  {
    id: "carrot-cake",
    name: "Carrot cake",
    price: 850,
    category: "Cake",
    description: "Spiced carrot cake with a light cream-cheese finish.",
    image:
      "https://images.unsplash.com/photo-1519869491916-8ca6f615d6bd?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fruit-cake",
    name: "Fruit cake",
    price: 1200,
    category: "Cake",
    description: "Moist cake topped with fresh fruits and glaze.",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "banana-cake",
    name: "Banana cake",
    price: 600,
    category: "Cake",
    description: "Banana-infused sponge with a warm, comforting taste.",
    image:
      "https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "cheese-cake",
    name: "Cheese cake",
    price: 1100,
    category: "Cake",
    description: "Creamy cheesecake with a buttery biscuit base.",
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1400&q=80",
    featured: true,
  },
  {
    id: "strawberry-cake",
    name: "Strawberry cake",
    price: 1000,
    category: "Cake",
    description: "Strawberry-forward cake with fresh berry topping.",
    image:
      "https://images.unsplash.com/photo-1525059337994-6f2a1311b4d4?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "cookies-cream",
    name: "Cookies & cream cake",
    price: 1050,
    category: "Cake",
    description: "Chocolate cookie crumble with vanilla cream layers.",
    image:
      "https://images.unsplash.com/photo-1607877742574-a45b0d98ce74?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "cup-cakes",
    name: "Cup cakes",
    price: 300,
    category: "Cupcakes",
    description: "Box of cupcakes with fluffy frosting (starter price).",
    image:
      "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=1400&q=80",
    featured: true,
  },
  {
    id: "muffins",
    name: "Muffins",
    price: 300,
    category: "Muffins",
    description: "Golden muffins—perfect for breakfast or gifting.",
    image:
      "https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "signature-deluxe",
    name: "Signature deluxe (2-tier)",
    price: 1500,
    category: "Cake",
    description: "Premium celebration cake with deluxe finishing.",
    image:
      "https://images.unsplash.com/photo-1542826438-bd32f43f3f3e?auto=format&fit=crop&w=1400&q=80",
  },
];

const LS_CART_KEY = "syela_cakes_cart_v1";

function formatMoney(amount) {
  return `${CURRENCY} ${amount.toLocaleString("en-GH")}`;
}

function safeParseJson(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function getCart() {
  /** @type {{[id:string]: number}} */
  const raw = safeParseJson(localStorage.getItem(LS_CART_KEY) || "{}", {});
  if (!raw || typeof raw !== "object") return {};
  for (const k of Object.keys(raw)) {
    if (typeof raw[k] !== "number" || raw[k] <= 0) delete raw[k];
  }
  return raw;
}

function setCart(cart) {
  localStorage.setItem(LS_CART_KEY, JSON.stringify(cart));
  renderCartCount();
}

function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

function cartItemsDetailed() {
  const cart = getCart();
  /** @type {{product: typeof PRODUCTS[number], qty:number}[]} */
  const items = [];
  for (const [id, qty] of Object.entries(cart)) {
    const product = getProductById(id);
    if (!product) continue;
    items.push({ product, qty });
  }
  return items;
}

function cartTotal() {
  return cartItemsDetailed().reduce((sum, it) => sum + it.product.price * it.qty, 0);
}

function addToCart(id, delta = 1) {
  const product = getProductById(id);
  if (!product) return;
  const cart = getCart();
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  setCart(cart);
  renderCartDrawer();
  renderCheckout();
}

function setCartQty(id, qty) {
  const product = getProductById(id);
  if (!product) return;
  const cart = getCart();
  if (qty <= 0) delete cart[id];
  else cart[id] = qty;
  setCart(cart);
  renderCartDrawer();
  renderCheckout();
}

function clearCart() {
  setCart({});
  renderCartDrawer();
  renderCheckout();
}

function countCartItems() {
  const cart = getCart();
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function renderCartCount() {
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = String(countCartItems());
  });
}

function elFromHTML(html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}

function productCard(product) {
  const html = `
    <article class="card" data-product-card="${product.id}">
      <div class="card-media">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <span class="badge">${product.category}</span>
      </div>
      <div class="card-body">
        <div class="card-title">
          <h3>${product.name}</h3>
          <span class="price">${formatMoney(product.price)}</span>
        </div>
        <p class="desc">${product.description}</p>
        <div class="card-actions">
          <button class="btn btn-ghost btn-sm" type="button" data-add="${product.id}">Add to order</button>
          <div class="qty" aria-label="Adjust quantity">
            <button type="button" aria-label="Decrease" data-dec="${product.id}">−</button>
            <span data-qty="${product.id}">0</span>
            <button type="button" aria-label="Increase" data-inc="${product.id}">+</button>
          </div>
        </div>
      </div>
    </article>
  `;
  return elFromHTML(html);
}

function wireCardButtons(root = document) {
  root.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.getAttribute("data-add"), 1));
  });
  root.querySelectorAll("[data-inc]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.getAttribute("data-inc"), 1));
  });
  root.querySelectorAll("[data-dec]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.getAttribute("data-dec"), -1));
  });
}

function renderQtyBadges() {
  const cart = getCart();
  document.querySelectorAll("[data-qty]").forEach((span) => {
    const id = span.getAttribute("data-qty");
    span.textContent = String(cart[id] || 0);
  });
}

function renderFeatured() {
  const grid = document.querySelector("[data-featured-grid]");
  if (!grid) return;
  grid.innerHTML = "";
  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 6);
  featured.forEach((p) => grid.appendChild(productCard(p)));
  wireCardButtons(grid);
  renderQtyBadges();
}

function sortProducts(list, sort) {
  const copy = [...list];
  if (sort === "price-asc") copy.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") copy.sort((a, b) => b.price - a.price);
  else if (sort === "name-asc") copy.sort((a, b) => a.name.localeCompare(b.name));
  else {
    // "popular" (featured first, then name)
    copy.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.name.localeCompare(b.name));
  }
  return copy;
}

function renderMenu() {
  const grid = document.querySelector("[data-menu-grid]");
  if (!grid) return;

  const search = document.querySelector("[data-menu-search]");
  const sort = document.querySelector("[data-menu-sort]");

  const doRender = () => {
    const q = (search?.value || "").trim().toLowerCase();
    const s = sort?.value || "popular";

    let list = PRODUCTS;
    if (q) {
      list = list.filter((p) => `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q));
    }
    list = sortProducts(list, s);

    grid.innerHTML = "";
    list.forEach((p) => grid.appendChild(productCard(p)));
    wireCardButtons(grid);
    renderQtyBadges();
  };

  doRender();
  search?.addEventListener("input", doRender);
  sort?.addEventListener("change", doRender);
}

function cartLineItem({ product, qty }) {
  const html = `
    <div class="line-item" data-line-item="${product.id}">
      <div class="thumb"><img src="${product.image}" alt="${product.name}" loading="lazy" /></div>
      <div>
        <div class="li-title">
          <strong>${product.name}</strong>
          <span class="price">${formatMoney(product.price * qty)}</span>
        </div>
        <div class="li-sub">${formatMoney(product.price)} × ${qty}</div>
        <div class="qty" style="margin-top:.55rem">
          <button type="button" aria-label="Decrease" data-line-dec="${product.id}">−</button>
          <span data-line-qty="${product.id}">${qty}</span>
          <button type="button" aria-label="Increase" data-line-inc="${product.id}">+</button>
        </div>
      </div>
      <div class="li-actions">
        <button class="remove" type="button" data-remove="${product.id}">Remove</button>
      </div>
    </div>
  `;
  return elFromHTML(html);
}

function renderCartDrawer() {
  const itemsRoot = document.querySelector("[data-cart-items]");
  const totalEl = document.querySelector("[data-cart-total]");
  if (!itemsRoot && !totalEl) return;

  const items = cartItemsDetailed();
  if (itemsRoot) {
    itemsRoot.innerHTML = "";
    if (items.length === 0) {
      itemsRoot.appendChild(
        elFromHTML(
          `<div class="muted">Your order is empty. Add cakes from the <a class="link" href="menu.html">menu</a>.</div>`
        )
      );
    } else {
      items.forEach((it) => itemsRoot.appendChild(cartLineItem(it)));
    }
  }

  if (totalEl) totalEl.textContent = formatMoney(cartTotal());

  // wire actions in drawer
  document.querySelectorAll("[data-line-inc]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.getAttribute("data-line-inc"), 1));
  });
  document.querySelectorAll("[data-line-dec]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.getAttribute("data-line-dec"), -1));
  });
  document.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => setCartQty(btn.getAttribute("data-remove"), 0));
  });
}

function openDrawer() {
  const drawer = document.querySelector("[data-cart-drawer]");
  if (!drawer) return;
  drawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  const drawer = document.querySelector("[data-cart-drawer]");
  if (!drawer) return;
  drawer.setAttribute("aria-hidden", "true");
}

function wireDrawer() {
  document.querySelectorAll("[data-cart-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      renderCartDrawer();
      openDrawer();
    });
  });
  document.querySelectorAll("[data-cart-close]").forEach((btn) => {
    btn.addEventListener("click", closeDrawer);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
}

function renderCheckout() {
  const itemsRoot = document.querySelector("[data-checkout-items]");
  const totalEl = document.querySelector("[data-checkout-total]");
  if (!itemsRoot && !totalEl) return;

  const items = cartItemsDetailed();
  if (itemsRoot) {
    itemsRoot.innerHTML = "";
    if (items.length === 0) {
      itemsRoot.appendChild(
        elFromHTML(
          `<div class="muted">No items yet. Add cakes from the <a class="link" href="menu.html">menu</a>.</div>`
        )
      );
    } else {
      items.forEach((it) => itemsRoot.appendChild(cartLineItem(it)));
    }
  }
  if (totalEl) totalEl.textContent = formatMoney(cartTotal());

  // wire actions inside checkout list
  document.querySelectorAll("[data-line-inc]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.getAttribute("data-line-inc"), 1));
  });
  document.querySelectorAll("[data-line-dec]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.getAttribute("data-line-dec"), -1));
  });
  document.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => setCartQty(btn.getAttribute("data-remove"), 0));
  });
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function buildOrderSummary(formData) {
  const items = cartItemsDetailed();
  const total = cartTotal();

  const lines = [];
  lines.push("SYELA CAKES — ORDER SUMMARY");
  lines.push(`Date created: ${new Date().toLocaleString()}`);
  lines.push("");
  lines.push("Customer");
  lines.push(`- Name: ${formData.name || ""}`);
  lines.push(`- Phone: ${formData.phone || ""}`);
  lines.push(`- Delivery: ${formData.deliveryMethod || ""}`);
  if ((formData.deliveryMethod || "").toLowerCase().includes("delivery")) {
    lines.push(`- Address: ${formData.address || ""}`);
  }
  if (formData.date) lines.push(`- Preferred date: ${formData.date}`);
  if (formData.notes) lines.push(`- Notes: ${formData.notes}`);
  lines.push("");
  lines.push("Items");
  if (items.length === 0) {
    lines.push("- (No items selected)");
  } else {
    for (const it of items) {
      lines.push(`- ${it.product.name} × ${it.qty} = ${formatMoney(it.product.price * it.qty)}`);
    }
  }
  lines.push("");
  lines.push(`Estimated total: ${formatMoney(total)}`);
  lines.push("");
  lines.push("Contact");
  lines.push(`- Location: ${CONTACT.location}`);
  lines.push(`- Phone: ${CONTACT.phone}`);
  lines.push(`- Email: ${CONTACT.email}`);
  return lines.join("\n");
}

function wireCheckoutForm() {
  const form = document.querySelector("[data-checkout-form]");
  if (!form) return;

  const clearBtn = document.querySelector("[data-clear-cart]");
  clearBtn?.addEventListener("click", () => {
    clearCart();
    const result = document.querySelector("[data-order-result]");
    if (result) result.hidden = true;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    const summary = buildOrderSummary(data);

    const result = document.querySelector("[data-order-result]");
    const out = document.querySelector("[data-order-summary]");
    if (out) out.value = summary;
    if (result) result.hidden = false;
    result?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  const copyBtn = document.querySelector("[data-copy-summary]");
  copyBtn?.addEventListener("click", async () => {
    const out = document.querySelector("[data-order-summary]");
    const ok = await copyToClipboard(out?.value || "");
    copyBtn.textContent = ok ? "Copied" : "Copy failed";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
  });
}

function buildCustomSummary(data) {
  const lines = [];
  lines.push("SYELA CAKES — CUSTOM CAKE REQUEST");
  lines.push(`Date created: ${new Date().toLocaleString()}`);
  lines.push("");
  lines.push("Customer");
  lines.push(`- Name: ${data.name || ""}`);
  lines.push(`- Phone: ${data.phone || ""}`);
  lines.push("");
  lines.push("Cake details");
  lines.push(`- Cake type: ${data.cakeType || "(not specified)"}`);
  lines.push(`- Occasion: ${data.occasion || ""}`);
  lines.push(`- Servings: ${data.servings || ""}`);
  lines.push(`- Colors: ${data.colors || ""}`);
  lines.push(`- Budget: ${data.budget || ""}`);
  if (data.date) lines.push(`- Preferred date: ${data.date}`);
  lines.push("");
  lines.push("Description");
  lines.push(data.description || "");
  lines.push("");
  lines.push("Contact");
  lines.push(`- Location: ${CONTACT.location}`);
  lines.push(`- Phone: ${CONTACT.phone}`);
  lines.push(`- Email: ${CONTACT.email}`);
  return lines.join("\n");
}

function wireCustomForm() {
  const form = document.querySelector("[data-custom-form]");
  if (!form) return;

  const fillBtn = document.querySelector("[data-fill-sample]");
  fillBtn?.addEventListener("click", () => {
    form.querySelector('[name="cakeType"]').value = "Coconut & lime cake";
    form.querySelector('[name="occasion"]').value = "Birthday";
    form.querySelector('[name="servings"]').value = "20-25";
    form.querySelector('[name="colors"]').value = "White & gold";
    form.querySelector('[name="budget"]').value = "800-1200";
    form.querySelector('[name="description"]').value =
      "Round cake, coconut flavor with lime filling. Smooth white buttercream, gold accents, fresh flowers (minimal). Write: “Happy Birthday Nana”.";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    const summary = buildCustomSummary(data);

    const result = document.querySelector("[data-custom-result]");
    const out = document.querySelector("[data-custom-summary]");
    if (out) out.value = summary;
    if (result) result.hidden = false;
    result?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  const copyBtn = document.querySelector("[data-copy-custom]");
  copyBtn?.addEventListener("click", async () => {
    const out = document.querySelector("[data-custom-summary]");
    const ok = await copyToClipboard(out?.value || "");
    copyBtn.textContent = ok ? "Copied" : "Copy failed";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
  });
}

function buildContactSummary(data) {
  const lines = [];
  lines.push("SYELA CAKES — MESSAGE");
  lines.push(`Date created: ${new Date().toLocaleString()}`);
  lines.push("");
  lines.push(`From: ${data.name || ""}`);
  lines.push(`Email: ${data.email || ""}`);
  lines.push(`Subject: ${data.subject || ""}`);
  lines.push("");
  lines.push("Message");
  lines.push(data.message || "");
  lines.push("");
  lines.push("Contact");
  lines.push(`- Phone: ${CONTACT.phone}`);
  lines.push(`- Email: ${CONTACT.email}`);
  lines.push(`- Location: ${CONTACT.location}`);
  return lines.join("\n");
}

function wireContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const fillBtn = document.querySelector("[data-fill-contact]");
  fillBtn?.addEventListener("click", () => {
    form.querySelector('[name="subject"]').value = "Order inquiry";
    form.querySelector('[name="message"]').value =
      "Hi Syela Cakes, I would like to order a red velvet cake for this weekend. Please let me know available sizes and the best price range.";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    const summary = buildContactSummary(data);
    const result = document.querySelector("[data-contact-result]");
    const out = document.querySelector("[data-contact-summary]");
    if (out) out.value = summary;
    if (result) result.hidden = false;
    result?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  const copyBtn = document.querySelector("[data-copy-contact]");
  copyBtn?.addEventListener("click", async () => {
    const out = document.querySelector("[data-contact-summary]");
    const ok = await copyToClipboard(out?.value || "");
    copyBtn.textContent = ok ? "Copied" : "Copy failed";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
  });
}

function init() {
  renderCartCount();
  wireDrawer();
  renderFeatured();
  renderMenu();
  renderCartDrawer();
  renderCheckout();
  wireCheckoutForm();
  wireCustomForm();
  wireContactForm();
  renderQtyBadges();

  // keep quantities in sync when storage changes (multiple tabs)
  window.addEventListener("storage", (e) => {
    if (e.key === LS_CART_KEY) {
      renderCartCount();
      renderQtyBadges();
      renderCartDrawer();
      renderCheckout();
    }
  });

  // global click to update qty labels (after add/remove)
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (
      t.hasAttribute("data-add") ||
      t.hasAttribute("data-inc") ||
      t.hasAttribute("data-dec") ||
      t.hasAttribute("data-line-inc") ||
      t.hasAttribute("data-line-dec") ||
      t.hasAttribute("data-remove")
    ) {
      // allow cart state to update first
      setTimeout(() => {
        renderCartCount();
        renderQtyBadges();
      }, 0);
    }
  });
}

document.addEventListener("DOMContentLoaded", init);

