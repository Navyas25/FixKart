import { apiGet } from "./api.js";
import { addToCart, updateCartBadge } from "./cart.js";
import { $, escapeHtml, formatINR, getQueryParam, setText } from "./utils.js";

const PRODUCT_PLACEHOLDER = "../assets/images/placeholder-product.png";

const renderProduct = (product) => {
    document.title = `${product.name} | FixKart`;

    const image = document.getElementById("product-detail-image");
    if (image) {
        image.src = product.image_url || PRODUCT_PLACEHOLDER;
        image.alt = product.name;
    }

    setText(
        "product-detail-category",
        product.category?.name || product.category || "Hardware"
    );
    setText("product-detail-name", product.name);
    setText("product-detail-price", formatINR(product.price));

    const stock = document.getElementById("product-detail-stock");
    if (stock) {
        const inStock = Number(product.stock || 0) > 0;
        stock.textContent = inStock ? "In Stock" : "Out of Stock";
        stock.style.background = inStock
            ? "rgba(34,197,94,0.12)"
            : "rgba(239,68,68,0.12)";
        stock.style.color = inStock ? "#166534" : "#b91c1c";
    }

    const description = document.getElementById("product-detail-description");
    if (description) description.textContent = product.description || "";

    const unit = document.getElementById("product-detail-unit");
    if (unit && product.unit) {
        unit.textContent = `Unit: ${product.unit}`;
    }

    const addButton = document.getElementById("product-detail-add");
    if (addButton) {
        addButton.disabled = !(Number(product.stock || 0) > 0);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const productId = getQueryParam("id");
    const container = document.getElementById("product-detail");

    if (!productId) {
        if (container) {
            container.innerHTML =
                '<p class="text-secondary" style="padding:2rem;">' +
                "No product selected. <a href='products.html'>Browse products</a>.</p>";
        }
        return;
    }

    const form = document.getElementById("add-to-cart-form");

    form?.addEventListener("submit", (event) => {
        event.preventDefault();

        const quantity = Number(
            document.getElementById("product-detail-quantity")?.value || 1
        );
        const product = window.__fixkartProduct || {};

        addToCart(productId, quantity, product);
        updateCartBadge();

        const button = document.getElementById("product-detail-add");
        if (button) {
            const original = button.textContent;
            button.textContent = "✓ Added to Cart";
            setTimeout(() => {
                button.textContent = original;
            }, 1500);
        }
    });

    apiGet(`/products/${productId}`)
        .then((data) => {
            window.__fixkartProduct = data.product;
            renderProduct(data.product);
        })
        .catch((error) => {
            const name = document.getElementById("product-detail-name");
            if (name) name.textContent = "Product not found";
            setText(
                "product-detail-price",
                error.message || "Could not load this product"
            );
        });

    updateCartBadge();
});
