import { formatINR, getQueryParam, setText } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
    const urlId = getQueryParam("id");

    let last = null;
    try {
        last = JSON.parse(localStorage.getItem("fixkart_last_order") || "null");
    } catch {
        last = null;
    }

    const orderId = urlId || last?.id || "";
    const number = document.getElementById("order-number");

    if (number) {
        number.textContent = orderId
            ? `#FK-${String(orderId).slice(0, 8).toUpperCase()}`
            : "#FK-2026-001";
    }

    const total = document.getElementById("order-total");
    if (total && last?.total !== undefined) {
        total.textContent = formatINR(last.total);
    }

    const delivery = document.getElementById("estimated-delivery");
    if (delivery) {
        const estimate = new Date();
        estimate.setDate(estimate.getDate() + 4);
        delivery.textContent = estimate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    // Keep the reference available for a page refresh.
    if (orderId && (!last || last.id !== orderId)) {
        localStorage.setItem(
            "fixkart_last_order",
            JSON.stringify({ id: orderId, total: last?.total || 0 })
        );
    }
});
