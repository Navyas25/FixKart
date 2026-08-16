import { getQueryParam, setText } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
    const urlId = getQueryParam("id");

    let last = null;
    try {
        last = JSON.parse(localStorage.getItem("fixkart_last_booking") || "null");
    } catch {
        last = null;
    }

    const bookingId = urlId || last?.id || "";

    setText(
        "booking-number",
        bookingId
            ? `#FK-${String(bookingId).slice(0, 8).toUpperCase()}`
            : "#FK-2026-00125"
    );

    if (last?.scheduled_at) {
        const date = new Date(last.scheduled_at);
        if (!Number.isNaN(date.getTime())) {
            setText(
                "booking-schedule",
                date.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                })
            );
            setText(
                "booking-schedule-time",
                date.toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit"
                })
            );
        }
    }

    if (bookingId && (!last || last.id !== bookingId)) {
        localStorage.setItem(
            "fixkart_last_booking",
            JSON.stringify({ id: bookingId, scheduled_at: last?.scheduled_at || "" })
        );
    }
});
