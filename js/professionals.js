import { apiGet } from "./api.js";
import {
    $,
    escapeHtml,
    showNotice,
    starRating,
    truncate
} from "./utils.js";

const PRO_PLACEHOLDER = "../assets/images/placeholder-professional.png";

const state = {
    all: [],
    filtered: []
};

const professionalName = (professional) =>
    professional.profile?.full_name ||
    professional.full_name ||
    "FixKart Professional";

const renderProfessionals = (container) => {
    container.innerHTML = "";

    if (!state.filtered.length) {
        showNotice(container, {
            icon: "🧑‍🔧",
            title: "No professionals found",
            message:
                "We couldn't find any professionals matching your filters. " +
                "Try adjusting your search or check back soon."
        });
        return;
    }

    state.filtered.forEach((professional) => {
        const name = professionalName(professional);
        const avatar =
            professional.profile?.avatar_url ||
            professional.avatar_url ||
            PRO_PLACEHOLDER;
        const rating = Number(professional.rating || 0);

        const card = document.createElement("article");
        card.className = "card professional-card";

        card.innerHTML = `
            <img
                src="${escapeHtml(avatar)}"
                alt="${escapeHtml(name)} profile photo"
                loading="lazy"
            >
            <div class="card-content">
                <span class="badge">${rating >= 4.5 ? "★ Top Rated" : "Verified"}</span>
                <h3>
                    <a href="professional-profile.html?id=${encodeURIComponent(professional.id)}">
                        ${escapeHtml(name)}
                    </a>
                </h3>
                <p class="text-primary">
                    ${escapeHtml(truncate(professional.bio || "Home service professional", 80))}
                </p>
                <div class="professional-rating">
                    ${starRating(rating)}
                    <span>${rating ? rating.toFixed(1) : "—"}</span>
                </div>
                <a href="professional-profile.html?id=${encodeURIComponent(professional.id)}" class="btn btn-primary">
                    View Profile
                </a>
            </div>
        `;

        container.appendChild(card);
    });
};

const applyFilters = (container) => {
    const profession = document.getElementById("profession")?.value || "";
    const location = document
        .getElementById("professional-location")
        ?.value.trim()
        .toLowerCase() || "";
    const minRating = Number(document.getElementById("professional-rating")?.value) || 0;

    state.filtered = state.all.filter((professional) => {
        const name = professionalName(professional).toLowerCase();
        const bio = (professional.bio || "").toLowerCase();
        const haystack = `${name} ${bio} ${professional.location || ""}`.toLowerCase();

        if (profession && !bio.includes(profession) && !name.includes(profession)) {
            return false;
        }

        if (location && !haystack.includes(location)) {
            return false;
        }

        if (minRating && Number(professional.rating || 0) < minRating) {
            return false;
        }

        return true;
    });

    renderProfessionals(container);
};

const loadProfessionals = async (container) => {
    try {
        const data = await apiGet("/professionals");
        state.all = data.professionals || [];
        applyFilters(container);
    } catch (error) {
        renderProfessionals(container);
        showNotice(container, {
            icon: "⚠️",
            title: "Couldn't load professionals",
            message: error.message
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const container = $("#professional-list .grid-3");
    if (!container) return;

    loadProfessionals(container);

    const form = document.getElementById("professional-filter-form");
    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        applyFilters(container);
    });
});
