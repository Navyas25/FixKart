import { apiGet, apiPatch, apiPost } from "./api.js";
import { clearSession, requireAuth } from "./auth.js";
import { $ } from "./utils.js";

const showMessage = (form, message, isError = false) => {
    let alert = form.querySelector(".profile-alert");
    if (!alert) {
        alert = document.createElement("div");
        alert.className = "profile-alert";
        alert.style.cssText =
            "margin-bottom:1rem;padding:0.75rem 1rem;border-radius:10px;" +
            "font-size:0.9rem;font-weight:600;";
        form.prepend(alert);
    }
    alert.textContent = message;
    alert.style.background = isError
        ? "rgba(239,68,68,0.1)"
        : "rgba(34,197,94,0.12)";
    alert.style.color = isError ? "#b91c1c" : "#166534";
};

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(
        'form[aria-label="Profile details form"]'
    );

    // Logout link lives in the profile sidebar.
    const logoutLink = document.querySelector(
        '.profile-nav a[href="login.html"]'
    );
    if (logoutLink) {
        logoutLink.addEventListener("click", async (event) => {
            event.preventDefault();
            try {
                await apiPost("/auth/logout");
            } catch {
                // Ignore - session is cleared locally regardless.
            }
            clearSession();
            window.location.href = "../index.html";
        });
    }

    if (!requireAuth("profile.html")) return;

    const nameInput = document.getElementById("profile-name");
    const emailInput = document.getElementById("profile-email");
    const phoneInput = document.getElementById("profile-phone");

    apiGet("/users/profile")
        .then((data) => {
            const profile = data.profile || {};
            if (nameInput) nameInput.value = profile.full_name || "";
            if (phoneInput) phoneInput.value = profile.phone || "";

            const userEmail = JSON.parse(
                localStorage.getItem("fixkart_session") || "{}"
            )?.user?.email;
            if (emailInput) emailInput.value = profile.email || userEmail || "";
            if (emailInput) emailInput.disabled = true;
        })
        .catch((error) => {
            if (form) {
                showMessage(
                    form,
                    error.message || "Could not load your profile.",
                    true
                );
            }
        });

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = "Saving…";

        try {
            const data = await apiPatch("/users/profile", {
                full_name: nameInput?.value.trim() || undefined,
                phone: phoneInput?.value.trim() || undefined
            });

            showMessage(form, "Profile updated successfully.");
            localStorage.setItem(
                "fixkart_session",
                JSON.stringify({
                    ...JSON.parse(localStorage.getItem("fixkart_session") || "{}"),
                    profile: data.profile
                })
            );
        } catch (error) {
            showMessage(form, error.message || "Could not update your profile.", true);
        } finally {
            button.disabled = false;
            button.textContent = "Save Changes";
        }
    });
});
