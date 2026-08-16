import { apiGet } from "./api.js";
import { requireAuth } from "./auth.js";
import {
    escapeHtml,
    formatDateTime,
    showNotice
} from "./utils.js";

const shortId = (id) =>
    id ? `#FK-${String(id).slice(0, 8).toUpperCase()}` : "#FK-…";

const renderBookings = (container, bookings) => {
    container.innerHTML = "";

    if (!bookings.length) {
        showNotice(container, {
            icon: "🗓️",
            title: "No bookings yet",
            message:
                "When you book a professional it will show up here."
        });
        return;
    }

    bookings.forEach((booking) => {
        const serviceName =
            booking.service?.name || "Home service";
        const professionalName =
            booking.professional?.profile?.full_name ||
            booking.professional?.full_name ||
            "FixKart Professional";

        const article = document.createElement("article");
        article.className = "card";
        article.style.marginBottom = "1.25rem";

        article.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1.5rem;flex-wrap:wrap;">
                <div>
                    <span class="eyebrow">Booking</span>
                    <h2>${shortId(booking.id)}</h2>
                    <p class="text-secondary">
                        ${escapeHtml(serviceName)} with ${escapeHtml(professionalName)}
                    </p>
                </div>
                <span style="padding:0.45rem 0.8rem;border-radius:999px;background:#dcfce7;color:#166534;font-weight:600;text-transform:capitalize;">
                    ${escapeHtml(booking.status || "Confirmed")}
                </span>
            </div>
            <hr class="divider" style="margin:1rem 0;">
            <div style="display:grid;gap:0.35rem;">
                <p style="margin:0;">
                    <strong>Scheduled:</strong>
                    ${escapeHtml(formatDateTime(booking.scheduled_at))}
                </p>
                ${
                    booking.notes
                        ? `<p style="margin:0;" class="text-secondary">${escapeHtml(booking.notes)}</p>`
                        : ""
                }
            </div>
        `;

        container.appendChild(article);
    });
};

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("booking-list");
    if (!container) return;

    if (!requireAuth("bookings.html")) return;

    apiGet("/bookings")
        .then((data) => renderBookings(container, data.bookings || []))
        .catch((error) => {
            if (String(error.message || "").toLowerCase().includes("token")) {
                localStorage.removeItem("fixkart_session");
                window.location.href = "login.html?next=bookings.html";
                return;
            }
            showNotice(container, {
                icon: "⚠️",
                title: "Couldn't load bookings",
                message: error.message
            });
        });
});
