import { apiGet } from "./api.js";
import {
    escapeHtml,
    formatINR,
    showNotice,
    truncate
} from "./utils.js";

const state = {
    services: [],
    all: []
};

const renderServices = (container, services) => {
    container.innerHTML = "";

    if (!services.length) {
        showNotice(container, {
            icon: "🛠️",
            title: "No services found",
            message:
                "We couldn't find any services matching your selection. " +
                "Try a different category or check back soon."
        });
        return;
    }

    services.forEach((service) => {
        const card = document.createElement("article");
        card.className = "card card-pad";

        card.innerHTML = `
            <span class="badge badge-blue">${escapeHtml(service.category || "Service")}</span>
            <h3>${escapeHtml(service.name)}</h3>
            <p class="text-secondary">${escapeHtml(truncate(service.description, 140))}</p>
            <p class="service-price" style="margin:0.75rem 0;">
                From ${formatINR(service.base_price)}
            </p>
            <a href="service-details.html?id=${encodeURIComponent(service.id)}" class="btn btn-outline btn-sm">
                View Details
            </a>
        `;

        container.appendChild(card);
    });
};

const loadServices = async (container) => {
    try {
        const data = await apiGet("/services");
        state.all = data.services || [];
        state.services = state.all;

        const category =
            document.getElementById("service-category")?.value || "";

        const filtered = category
            ? state.all.filter((service) => service.category === category)
            : state.all;

        renderServices(container, filtered);
    } catch (error) {
        renderServices(container, []);
        showNotice(container, {
            icon: "⚠️",
            title: "Couldn't load services",
            message: error.message
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("service-list");
    if (!container) return;

    // Honour ?category= from the URL.
    const urlCategory = new URLSearchParams(window.location.search).get("category");
    if (urlCategory) {
        const select = document.getElementById("service-category");
        if (select && [...select.options].some((o) => o.value === urlCategory)) {
            select.value = urlCategory;
        }
    }

    loadServices(container);

    const filter = document.getElementById("service-filters");
    filter?.addEventListener("change", (event) => {
        if (event.target.id !== "service-category") return;
        const category = event.target.value;

        const filtered = category
            ? state.all.filter((service) => service.category === category)
            : state.all;

        renderServices(container, filtered);
    });
});
