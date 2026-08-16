export const $ = (selector, root = document) =>
    root.querySelector(selector);

export const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

export const escapeHtml = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

export const formatINR = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export const getQueryParam = (name) =>
    new URLSearchParams(window.location.search).get(name);

export const setText = (id, text) => {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
};

export const truncate = (text, length = 120) => {
    const value = String(text ?? "");
    return value.length > length
        ? `${value.slice(0, length).trim()}…`
        : value;
};

// Creates a small centered notice (empty state / error state) inside a grid.
export const showNotice = (container, { icon = "ℹ️", title, message }) => {
    if (!container) return;
    container.innerHTML = "";
    const notice = document.createElement("div");
    notice.className = "empty-state";
    notice.style.cssText =
        "text-align:center;padding:3rem 1rem;grid-column:1 / -1;";
    notice.innerHTML = `
        <div aria-hidden="true" style="font-size:3rem;margin-bottom:1rem;">${icon}</div>
        <h3>${escapeHtml(title)}</h3>
        <p class="text-secondary">${escapeHtml(message)}</p>
    `;
    container.appendChild(notice);
};

export const starRating = (rating) => {
    const value = Number(rating || 0);
    const full = Math.round(value);
    return "★".repeat(Math.max(0, Math.min(5, full))) +
        "☆".repeat(Math.max(0, 5 - Math.min(5, full)));
};

export const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
};

export const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
};
