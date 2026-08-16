import { apiGet } from "./api.js";
import {
    escapeHtml,
    getQueryParam,
    setText,
    showNotice,
    starRating
} from "./utils.js";

const PRO_PLACEHOLDER = "../assets/images/placeholder-professional.png";

const renderServices = (container, professional) => {
    if (!container) return;

    // The professionals table doesn't expose a services list yet, so show a
    // friendly placeholder built from the professional's bio and experience.
    container.innerHTML = "";

    const cards = [
        {
            title: `${professional.experience_years || 5}+ Years Experience`,
            text:
                professional.bio ||
                "Trusted professional providing reliable home services."
        },
        {
            title: `${professional.rating || 4.8}/5 Rated`,
            text:
                "Rated by customers for quality, punctuality and professionalism."
        },
        {
            title: "Verified on FixKart",
            text:
                "Background and skill checks completed before joining the platform."
        }
    ];

    cards.forEach((card) => {
        const article = document.createElement("article");
        article.className = "card";
        article.innerHTML = `
            <h3>${escapeHtml(card.title)}</h3>
            <p>${escapeHtml(card.text)}</p>
        `;
        container.appendChild(article);
    });
};

const renderReviews = (container) => {
    if (!container) return;
    showNotice(container, {
        icon: "💬",
        title: "No reviews yet",
        message: "Reviews from customers will appear here once available."
    });
};

document.addEventListener("DOMContentLoaded", () => {
    const professionalId = getQueryParam("id");

    if (!professionalId) {
        const name = document.getElementById("professional-detail-name");
        if (name) name.textContent = "No professional selected";
        return;
    }

    apiGet(`/professionals/${professionalId}`)
        .then((data) => {
            const professional = data.professional;
            if (!professional) throw new Error("Professional not found");

            const name =
                professional.profile?.full_name ||
                professional.full_name ||
                "FixKart Professional";

            document.title = `${name} | FixKart`;

            const image = document.getElementById("professional-detail-image");
            if (image) {
                image.src =
                    professional.profile?.avatar_url ||
                    professional.avatar_url ||
                    PRO_PLACEHOLDER;
                image.alt = name;
            }

            setText("professional-detail-name", name);
            setText(
                "professional-detail-eyebrow",
                Number(professional.rating || 0) >= 4.5
                    ? "★ Top Rated Professional"
                    : "Verified Professional"
            );

            const role = document.getElementById("professional-detail-role");
            if (role) {
                role.textContent =
                    professional.profession ||
                    (professional.bio || "Home service professional")
                        .split(".")[0]
                        .slice(0, 60);
            }

            const bio = document.getElementById("professional-detail-bio");
            if (bio) {
                bio.textContent =
                    professional.bio ||
                    "Experienced FixKart professional providing reliable and affordable home services.";
            }

            setText(
                "professional-detail-experience",
                `${professional.experience_years || "—"} Years`
            );
            setText(
                "professional-detail-rating",
                `${Number(professional.rating || 0).toFixed(1)} / 5`
            );
            setText(
                "professional-detail-jobs",
                `${professional.jobs_completed || "—"}`
            );

            const book = document.getElementById("professional-detail-book");
            if (book) {
                book.href =
                    `booking.html?professional_id=${encodeURIComponent(professional.id)}`;
            }

            renderServices(
                document.querySelector("#professional-services .grid-3"),
                professional
            );
            renderReviews(
                document.querySelector("#professional-reviews .grid-2")
            );
        })
        .catch((error) => {
            setText("professional-detail-name", "Professional not found");
            setText(
                "professional-detail-bio",
                error.message || "Could not load this professional."
            );
        });
});
