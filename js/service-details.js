import { apiGet } from "./api.js";
import { escapeHtml, formatINR, getQueryParam, setText } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
    const serviceId = getQueryParam("id");

    if (!serviceId) {
        const name = document.getElementById("service-detail-name");
        if (name) name.textContent = "No service selected";
        return;
    }

    apiGet(`/services/${serviceId}`)
        .then((data) => {
            const service = data.service;
            if (!service) throw new Error("Service not found");

            document.title = `${service.name} | FixKart`;
            setText("service-detail-name", service.name);
            setText(
                "service-detail-category",
                service.category || "Service"
            );
            setText("service-detail-description", service.description || "");
            setText("service-detail-price", `From ${formatINR(service.base_price)}`);

            const link = document.getElementById("service-detail-link");
            if (link) {
                link.href =
                    `professionals.html?service=${encodeURIComponent(service.id)}`;
            }
        })
        .catch((error) => {
            setText(
                "service-detail-name",
                "Service not found"
            );
            setText(
                "service-detail-description",
                error.message || "Could not load this service."
            );
        });
});
