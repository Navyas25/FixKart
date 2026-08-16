import { apiPost } from "./api.js";
import { $ } from "./utils.js";

const SESSION_KEY = "fixkart_session";

/* =========================================
   SESSION HELPERS
========================================= */

export const getSession = () => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const setSession = (session) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
};

export const isLoggedIn = () => Boolean(getSession()?.access_token);

export const currentUser = () => getSession()?.user || null;

// Redirects to the login page (preserving an optional ?next= target).
export const requireAuth = (nextPath) => {
    if (!isLoggedIn()) {
        const target = nextPath || window.location.pathname.split("/").pop();
        window.location.href = `login.html?next=${encodeURIComponent(target)}`;
        return false;
    }
    return true;
};

export const redirectAfterLogin = () => {
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.href = next || "../index.html";
};

/* =========================================
   ERROR / MESSAGE HELPERS
========================================= */

const showMessage = (form, message, isError = true) => {
    let alert = form.querySelector(".auth-alert");

    if (!alert) {
        alert = document.createElement("div");
        alert.className = "auth-alert";
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

const setLoading = (button, loading) => {
    if (!button) return;
    button.disabled = loading;
    button.textContent = loading ? "Please wait…" : button.dataset.originalText || button.textContent;
};

/* =========================================
   LOGIN FORM
========================================= */

const handleLogin = () => {
    const form = document.getElementById("login-form-main");
    if (!form) return;

    const button = form.querySelector('button[type="submit"]');
    button.dataset.originalText = button.textContent;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("login-email")?.value.trim();
        const password = document.getElementById("login-password")?.value;

        if (!email || !password) {
            showMessage(form, "Please enter your email and password.");
            return;
        }

        setLoading(button, true);

        try {
            const data = await apiPost("/auth/login", { email, password });

            if (data.session) {
                setSession(data.session);
            } else {
                showMessage(form, "Login successful, but no session was returned.", false);
                return;
            }

            redirectAfterLogin();
        } catch (error) {
            showMessage(form, error.message || "Login failed. Please try again.");
            setLoading(button, false);
        }
    });
};

/* =========================================
   REGISTER FORM
========================================= */

const handleRegister = () => {
    const form = document.querySelector(
        'form[aria-label="Registration form"], #register-form'
    );
    if (!form) return;

    const button = form.querySelector('button[type="submit"]');
    button.dataset.originalText = button.textContent;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("register-name")?.value.trim();
        const email = document.getElementById("register-email")?.value.trim();
        const password = document.getElementById("register-password")?.value;
        const confirm = document.getElementById("register-confirm-password")?.value;

        if (!name || !email || !password) {
            showMessage(form, "Please fill in all the fields.");
            return;
        }

        if (password !== confirm) {
            showMessage(form, "Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            showMessage(form, "Password must be at least 8 characters.");
            return;
        }

        setLoading(button, true);

        try {
            const data = await apiPost("/auth/register", { name, email, password });

            if (data.session) {
                setSession(data.session);
                redirectAfterLogin();
                return;
            }

            showMessage(
                form,
                "Registration successful! If email confirmation is enabled, " +
                    "check your inbox to activate your account.",
                false
            );
            setLoading(button, false);
        } catch (error) {
            showMessage(form, error.message || "Registration failed. Please try again.");
            setLoading(button, false);
        }
    });
};

/* =========================================
   LOGOUT
========================================= */

const handleLogout = () => {
    const links = document.querySelectorAll("[data-action='logout']");

    links.forEach((link) => {
        link.addEventListener("click", async (event) => {
            event.preventDefault();
            try {
                await apiPost("/auth/logout");
            } catch {
                // Session is cleared locally regardless of the network result.
            }
            clearSession();
            window.location.href = link.dataset.redirect || "../index.html";
        });
    });
};

/* =========================================
   INIT
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    handleLogin();
    handleRegister();
    handleLogout();
});
