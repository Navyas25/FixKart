import { apiGet } from "./api.js";
import {
    $,
    $$,
    escapeHtml,
    formatINR,
    showNotice
} from "./utils.js";

const CART_KEY = "fixkart_cart";

/* =========================================
   CART STATE (localStorage)
========================================= */

export const getCart = () => {
    try {
        const raw = localStorage.getItem(CART_KEY);
        const items = raw ? JSON.parse(raw) : [];
        return Array.isArray(items) ? items : [];
    } catch {
        return [];
    }
};

const saveCart = (items) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartBadge();
};

export const cartCount = () =>
    getCart().reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

export const cartSubtotal = () =>
    getCart().reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0
    );

export const addToCart = (productId, quantity = 1, product = {}) => {
    const items = getCart();
    const existing = items.find((item) => item.product_id === productId);

    if (existing) {
        existing.quantity += Number(quantity) || 1;
    } else {
        items.push({
            product_id: productId,
            quantity: Number(quantity) || 1,
            name: product.name || "",
            price: Number(product.price) || 0,
            image_url: product.image_url || ""
        });
    }

    saveCart(items);
    return items;
};

export const updateQuantity = (productId, quantity) => {
    let items = getCart();
    const existing = items.find((item) => item.product_id === productId);

    if (!existing) return items;

    if (quantity <= 0) {
        items = items.filter((item) => item.product_id !== productId);
    } else {
        existing.quantity = quantity;
    }

    saveCart(items);
    return items;
};

export const removeFromCart = (productId) => {
    const items = getCart().filter((item) => item.product_id !== productId);
    saveCart(items);
    return items;
};

export const clearCart = () => {
    saveCart([]);
};

/* =========================================
   CART BADGE
========================================= */

export const updateCartBadge = () => {
    const count = cartCount();
    $$(".badge-count").forEach((badge) => {
        badge.textContent = String(count);
    });
};

/* =========================================
   CART PAGE
========================================= */

const renderEmptyCart = (container) => {
    const empty = document.getElementById("empty-cart");
    if (empty) empty.style.display = "block";

    const list = container.querySelector(".card");
    if (list) {
        $$(".cart-line", list).forEach((line) => line.remove());
    }

    const count = document.getElementById("cart-items-count");
    if (count) count.textContent = "0";

    const subtotal = document.getElementById("cart-subtotal");
    const delivery = document.getElementById("cart-delivery");
    const tax = document.getElementById("cart-tax");
    const total = document.getElementById("cart-total");
    const checkout = document.getElementById("checkout-button");

    if (subtotal) subtotal.textContent = formatINR(0);
    if (delivery) delivery.textContent = "Free";
    if (tax) tax.textContent = formatINR(0);
    if (total) total.textContent = formatINR(0);
    if (checkout) {
        checkout.style.pointerEvents = "none";
        checkout.style.opacity = "0.5";
    }
};

const renderCartItem = (item) => {
    const line = document.createElement("article");
    line.className = "cart-line";
    line.dataset.productId = item.product_id;

    const image = item.image_url
        ? `<img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}">`
        : `<img src="../assets/images/placeholder-product.png" alt="${escapeHtml(item.name)}">`;

    line.innerHTML = `
        <div class="cart-line-media">${image}</div>
        <div>
            <h3>${escapeHtml(item.name)}</h3>
            <p>Hardware Product</p>
            <strong>${formatINR(item.price)}</strong>
        </div>
        <div class="qty-control">
            <button type="button" class="qty-decrease" aria-label="Decrease quantity">−</button>
            <input type="number" class="cart-quantity" min="1" value="${Number(item.quantity) || 1}" aria-label="Product quantity">
            <button type="button" class="qty-increase" aria-label="Increase quantity">+</button>
        </div>
        <strong class="cart-line-total">${formatINR((Number(item.price) || 0) * (Number(item.quantity) || 1))}</strong>
        <button type="button" class="btn btn-outline cart-remove">Remove</button>
    `;

    return line;
};

const updateSummary = () => {
    const items = getCart();
    const subtotal = cartSubtotal();
    const delivery = items.length ? 0 : 0;
    const tax = 0;
    const total = subtotal + delivery + tax;

    const count = document.getElementById("cart-items-count");
    const subtotalEl = document.getElementById("cart-subtotal");
    const deliveryEl = document.getElementById("cart-delivery");
    const taxEl = document.getElementById("cart-tax");
    const totalEl = document.getElementById("cart-total");

    if (count) count.textContent = String(cartCount());
    if (subtotalEl) subtotalEl.textContent = formatINR(subtotal);
    if (deliveryEl) deliveryEl.textContent = delivery === 0 ? "Free" : formatINR(delivery);
    if (taxEl) taxEl.textContent = formatINR(tax);
    if (totalEl) totalEl.textContent = formatINR(total);
};

// Re-fetch fresh product details from the API, falling back to the snapshot.
const enrichCart = async (items) => {
    if (!items.length) return items;

    const ids = items.map((item) => item.product_id).join(",");

    try {
        const data = await apiGet(`/products?ids=${encodeURIComponent(ids)}`);
        const products = data.products || [];
        const byId = new Map(products.map((p) => [p.id, p]));

        const enriched = items.map((item) => {
            const product = byId.get(item.product_id);
            if (!product) return null;
            return {
                ...item,
                name: product.name || item.name,
                price: Number(product.price) || item.price,
                image_url: product.image_url || item.image_url
            };
        });

        const valid = enriched.filter(Boolean);
        if (valid.length !== items.length) {
            saveCart(valid);
        }
        return valid;
    } catch {
        return items;
    }
};

const renderCartPage = async () => {
    const container = document.getElementById("cart-items");
    if (!container) return;

    let items = await enrichCart(getCart());

    const empty = document.getElementById("empty-cart");
    const card = container.querySelector(".card");

    if (!items.length) {
        renderEmptyCart(container);
        return;
    }

    if (empty) empty.style.display = "none";

    // Remove previously rendered lines (keep the wrapper card).
    if (card) {
        $$(".cart-line", card).forEach((line) => line.remove());
    }

    const target = card || container;
    items.forEach((item) => target.appendChild(renderCartItem(item)));

    const checkout = document.getElementById("checkout-button");
    if (checkout) {
        checkout.style.pointerEvents = "";
        checkout.style.opacity = "";
    }

    updateSummary();
};

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("cart-items");

    if (container) {
        // Listeners attach once; handlers re-render.
        container.addEventListener("click", async (event) => {
            const line = event.target.closest(".cart-line");
            if (!line) return;

            const productId = line.dataset.productId;
            const input = line.querySelector(".cart-quantity");
            let quantity = Number(input?.value) || 1;

            if (event.target.closest(".qty-increase")) {
                quantity += 1;
            } else if (event.target.closest(".qty-decrease")) {
                quantity -= 1;
            } else if (event.target.closest(".cart-remove")) {
                removeFromCart(productId);
                await renderCartPage();
                return;
            } else {
                return;
            }

            const updated = updateQuantity(productId, quantity);
            await renderCartPage();
        });

        container.addEventListener("change", (event) => {
            if (!event.target.classList.contains("cart-quantity")) return;
            const line = event.target.closest(".cart-line");
            if (!line) return;

            const quantity = Math.max(1, Math.floor(Number(event.target.value) || 1));
            event.target.value = String(quantity);
            updateQuantity(line.dataset.productId, quantity);
            renderCartPage();
        });

        renderCartPage();
    }

    updateCartBadge();
});
