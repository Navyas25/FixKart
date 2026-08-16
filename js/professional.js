import { apiGet } from "./api.js";
import { requireAuth, getSession } from "./auth.js";
import { setText } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
    if (!requireAuth("../pages/login.html")) return;

    // Welcome the signed-in user in the profile settings card.
    const session = getSession();
    if (session?.user?.email) {
        setText("professional-email", session.user.email);
    }

    apiGet("/users/profile")
        .then((data) => {
            const profile = data.profile;
            if (profile?.full_name) {
                setText("professional-name", profile.full_name);
            }
        })
        .catch(() => {
            // Non-fatal - header still shows login state.
        });

    // Booking stats: upcoming vs completed.
    apiGet("/bookings")
        .then((data) => {
            const bookings = data.bookings || [];
            const now = Date.now();

            const upcoming = bookings.filter(
                (booking) =>
                    new Date(booking.scheduled_at || booking.created_at).getTime() >= now
            ).length;

            const completed = bookings.length - upcoming;

            setText("professional-bookings-upcoming", String(upcoming));
            setText("professional-bookings-completed", String(completed));
        })
        .catch(() => {
            setText("professional-bookings-upcoming", "0");
            setText("professional-bookings-completed", "0");
        });
});
