import { apiGet } from "./api.js";
import { updateCartBadge } from "./cart.js";
import {
    $,
    escapeHtml,
    formatINR,
    getQueryParam,
    showNotice,
    truncate
} from "./utils.js";

const PRODUCT_PLACEHOLDER = "../assets/images/placeholder-product.png";

const state = {
    products: [],
    total: 0
};

const renderProducts = (container) => {
    container.innerHTML = "";

    if (!state.products.length) {
        showNotice(container, {
            icon: "🔧",
            title: "No products found",
            message:
                "We couldn't find any products matching your filters. " +
                "Try clearing the filters or check back soon."
        });
        return;
    }

    state.products.forEach((product) => {
        const categoryName =
            product.category?.name ||
            product.category ||
            "Hardware";

        const card = document.createElement("article");
        card.className = "card product-card";

        const image = product.image_url
            ? product.image_url
            : PRODUCT_PLACEHOLDER;

        card.innerHTML = `
            <img
                src="${escapeHtml(image)}"
                alt="${escapeHtml(product.name)}"
                loading="lazy"
                style="width:100%;height:220px;object-fit:contain;"
            >
            <div style="padding-top:1rem;">
                <span class="eyebrow">${escapeHtml(categoryName)}</span>
                <h3>
                    <a href="product-details.html?id=${encodeURIComponent(product.id)}">
                        ${escapeHtml(product.name)}
                    </a>
                </h3>
                <p>${escapeHtml(truncate(product.description, 110))}</p>
                <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-top:1rem;">
                    <strong>${formatINR(product.price)}</strong>
                    <a href="product-details.html?id=${encodeURIComponent(product.id)}" class="btn btn-primary">
                        View Details
                    </a>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
};

const loadProducts = async (container, params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            query.set(key, value);
        }
    });

    const count = document.getElementById("product-count");
    if (count) count.textContent = "Loading products…";

    try {
        const data = await apiGet(`/products?${query.toString()}`);
        state.products = data.products || [];
        state.total = data.total || 0;

        renderProducts(container);

        if (count) {
            count.textContent =
                `${state.total} Product${state.total === 1 ? "" : "s"} Available`;
        }
    } catch (error) {
        renderProducts(container);
        showNotice(container, {
            icon: "⚠️",
            title: "Couldn't load products",
            message: error.message
        });
        if (count) count.textContent = "Unavailable";
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const container = $("#product-list .grid-3");
    if (!container) return;

    const form = document.getElementById("product-filter-form");

    // Honour ?category= and ?q= from the URL (header search, category tiles).
    const urlCategory = getQueryParam("category");
    const urlQuery = getQueryParam("q");
    const urlPrice = getQueryParam("price");
    const urlSort = getQueryParam("sort");

    if (urlCategory) {
        const select = document.getElementById("category");
        if (select) select.value = urlCategory;
    }

    if (urlPrice) {
        const select = document.getElementById("price-range");
        if (select && [...select.options].some((o) => o.value === urlPrice)) {
            select.value = urlPrice;
        }
    }

    if (urlSort) {
        const select = document.getElementById("sort");
        if (select && [...select.options].some((o) => o.value === urlSort)) {
            select.value = urlSort;
        }
    }

    loadProducts(container, {
        category: urlCategory,
        q: urlQuery,
        price: urlPrice,
        sort: urlSort
    });

    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        loadProducts(container, {
            category: document.getElementById("category")?.value,
            price: document.getElementById("price-range")?.value,
            sort: document.getElementById("sort")?.value
        });
    });

    form?.addEventListener("reset", () => {
        // Let the browser clear the form first, then reload everything.
        setTimeout(() => {
            loadProducts(container, {});
        }, 0);
    });

    updateCartBadge();
});
