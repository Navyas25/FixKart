import { apiGet } from "./api.js";
import { requireAuth } from "./auth.js";
import {
    escapeHtml,
    formatDateTime,
    formatINR,
    showNotice
} from "./utils.js";

const shortId = (id) =>
    id ? `#FK-${String(id).slice(0, 8).toUpperCase()}` : "#FK-…";

const renderOrders = (container, orders) => {
    container.innerHTML = "";

    if (!orders.length) {
        showNotice(container, {
            icon: "📦",
            title: "No orders yet",
            message:
                "When you place a hardware order it will show up here."
        });
        return;
    }

    orders.forEach((order) => {
        const items = order.items || [];

        const article = document.createElement("article");
        article.className = "card";
        article.style.marginBottom = "1.25rem";

        article.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;">
                <div>
                    <span class="eyebrow">Hardware Order</span>
                    <h2>${shortId(order.id)}</h2>
                    <p class="text-secondary">${escapeHtml(formatDateTime(order.created_at))}</p>
                </div>
                <span style="display:inline-flex;align-items:center;padding:0.4rem 0.8rem;border-radius:999px;background:rgba(34,197,94,0.12);font-size:0.85rem;font-weight:600;text-transform:capitalize;">
                    ${escapeHtml(order.status || "Confirmed")}
                </span>
            </div>
            <hr class="divider" style="margin:1rem 0;">
            <div style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
                <div>
                    ${items
                        .map(
                            (item) => `
                        <p style="margin:0.25rem 0;">
                            ${escapeHtml(item.product?.name || "Product")}
                            × ${Number(item.quantity) || 1}
                            <span class="text-secondary">
                                (${formatINR(item.unit_price)} each)
                            </span>
                        </p>
                    `
                        )
                        .join("")}
                </div>
                <strong>${formatINR(order.total_amount)}</strong>
            </div>
        `;

        container.appendChild(article);
    });
};

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("order-list");
    if (!container) return;

    if (!requireAuth("orders.html")) return;

    apiGet("/orders")
        .then((data) => renderOrders(container, data.orders || []))
        .catch((error) => {
            if (String(error.message || "").toLowerCase().includes("token")) {
                localStorage.removeItem("fixkart_session");
                window.location.href = "login.html?next=orders.html";
                return;
            }
            showNotice(container, {
                icon: "⚠️",
                title: "Couldn't load orders",
                message: error.message
            });
        });
});
