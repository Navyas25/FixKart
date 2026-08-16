import { apiPost } from "./api.js";
import { requireAuth } from "./auth.js";
import { $, getQueryParam } from "./utils.js";

const showFormError = (form, message) => {
    let alert = form.querySelector(".booking-alert");
    if (!alert) {
        alert = document.createElement("div");
        alert.className = "booking-alert";
        alert.style.cssText =
            "margin-bottom:1rem;padding:0.75rem 1rem;border-radius:10px;" +
            "background:rgba(239,68,68,0.1);color:#b91c1c;" +
            "font-size:0.9rem;font-weight:600;";
        form.prepend(alert);
    }
    alert.textContent = message;
};

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("booking-form");
    if (!form) return;

    const professionalId = getQueryParam("professional_id");
    const serviceId = getQueryParam("service_id");

    // Minimum selectable date: today.
    const dateInput = document.getElementById("booking-date");
    if (dateInput) {
        dateInput.min = new Date().toISOString().split("T")[0];
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = "Confirming…";

        const date = document.getElementById("booking-date")?.value;
        const time = document.getElementById("booking-time")?.value;
        const address = document.getElementById("booking-address")?.value.trim();
        const notes = document.getElementById("booking-notes")?.value.trim();

        if (!date || !time) {
            showFormError(form, "Please choose a preferred date and time.");
            button.disabled = false;
            button.textContent = "Confirm Booking";
            return;
        }

        const scheduledAt = new Date(`${date}T${time}:00`);

        try {
            if (!requireAuth("booking.html")) {
                button.disabled = false;
                button.textContent = "Confirm Booking";
                return;
            }

            const payload = {
                professional_id: professionalId,
                scheduled_at: scheduledAt.toISOString()
            };

            if (serviceId) payload.service_id = serviceId;
            if (address) payload.address = address;
            if (notes) payload.notes = notes;

            const data = await apiPost("/bookings", payload);

            localStorage.setItem(
                "fixkart_last_booking",
                JSON.stringify({
                    id: data.booking.id,
                    scheduled_at: data.booking.scheduled_at
                })
            );

            window.location.href =
                `booking-confirmation.html?id=${encodeURIComponent(data.booking.id)}`;
        } catch (error) {
            showFormError(form, error.message || "Could not create your booking.");
            button.disabled = false;
            button.textContent = "Confirm Booking";
        }
    });
});
