import { apiPost } from "./api.js";
import { clearCart, getCart } from "./cart.js";
import { isLoggedIn, requireAuth } from "./auth.js";
import { $, formatINR } from "./utils.js";

const showFormError = (message) => {
    const form = document.getElementById("checkout-form");
    if (!form) return;

    let alert = document.getElementById("checkout-alert");
    if (!alert) {
        alert = document.createElement("div");
        alert.id = "checkout-alert";
        alert.style.cssText =
            "margin-bottom:1rem;padding:0.75rem 1rem;border-radius:10px;" +
            "background:rgba(239,68,68,0.1);color:#b91c1c;" +
            "font-size:0.9rem;font-weight:600;";
        form.prepend(alert);
    }
    alert.textContent = message;
};

const renderSummary = () => {
    const items = getCart();
    const subtotal = items.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0
    );

    const subtotalEl = document.getElementById("checkout-subtotal");
    const deliveryEl = document.getElementById("checkout-delivery");
    const totalEl = document.getElementById("checkout-total");

    if (subtotalEl) subtotalEl.textContent = formatINR(subtotal);
    if (deliveryEl) deliveryEl.textContent = "Free";
    if (totalEl) totalEl.textContent = formatINR(subtotal);
};

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("checkout-form");
    if (!form) return;

    const items = getCart();

    if (!items.length) {
        // Nothing to check out - send the user back to the cart.
        window.location.href = "cart.html";
        return;
    }

    renderSummary();

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = "Placing order…";

        try {
            if (!requireAuth("checkout.html")) {
                button.disabled = false;
                button.textContent = "Place Order";
                return;
            }

            const addressLine = document.getElementById("address-line")?.value.trim();
            const city = document.getElementById("city")?.value.trim();
            const postalCode = document.getElementById("postal-code")?.value.trim();
            const phone = document.getElementById("phone")?.value.trim();
            const fullName = document.getElementById("full-name")?.value.trim();

            if (!addressLine || !city || !postalCode) {
                showFormError("Please fill in your delivery address.");
                button.disabled = false;
                button.textContent = "Place Order";
                return;
            }

            // 1. Save the delivery address, get its id.
            const addressData = await apiPost("/addresses", {
                address_line: addressLine,
                city,
                state: "",
                postal_code: postalCode,
                phone: phone || "",
                is_default: false
            });

            // 2. Create the order with server-side pricing.
            const orderData = await apiPost("/orders", {
                items: items.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity
                })),
                address_id: addressData.address.id
            });

            // 3. Success - clear the cart and show the confirmation page.
            const order = orderData.order;
            clearCart();

            localStorage.setItem(
                "fixkart_last_order",
                JSON.stringify({
                    id: order.id,
                    total: order.total_amount
                })
            );

            window.location.href =
                `order-confirmation.html?id=${encodeURIComponent(order.id)}`;
        } catch (error) {
            showFormError(error.message || "Could not place your order.");
            button.disabled = false;
            button.textContent = "Place Order";
        }
    });
});
