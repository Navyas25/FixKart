import { apiDelete, apiGet, apiPatch, apiPost } from "./api.js";
import { requireAuth } from "./auth.js";
import { escapeHtml, showNotice, $$ } from "./utils.js";

const renderAddresses = (container, addresses) => {
    // Remove previously rendered cards but keep the section heading.
    $$("article", container).forEach((article) => article.remove());

    if (!addresses.length) {
        const notice = document.createElement("div");
        notice.style.cssText =
            "text-align:center;padding:2rem 1rem;color:var(--text-secondary, #64748b);";
        notice.innerHTML =
            "<div aria-hidden='true' style='font-size:2.5rem;margin-bottom:0.75rem;'>📍</div>" +
            "<strong>No addresses saved</strong>" +
            "<p style='margin:0.25rem 0 0;'>Add an address below to speed up checkout.</p>";
        container.appendChild(notice);
        return;
    }

    addresses.forEach((address) => {
        const article = document.createElement("article");
        article.className = "card";
        article.style.marginBottom = "1rem";

        article.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:1rem;">
                <div>
                    <span class="badge">${escapeHtml(address.is_default ? "Default" : "Address")}</span>
                    <h3 style="margin-top:0.75rem;text-transform:capitalize;">
                        ${escapeHtml(address.address_line)}
                    </h3>
                </div>
            </div>
            <div style="display:flex;gap:0.75rem;align-items:flex-start;">
                <span aria-hidden="true" style="font-size:1.25rem;">📍</span>
                <p>
                    ${escapeHtml(address.address_line)},<br>
                    ${escapeHtml(address.city || "")}${address.state ? `, ${escapeHtml(address.state)}` : ""}${address.postal_code ? ` - ${escapeHtml(address.postal_code)}` : ""}
                </p>
            </div>
            <div class="row gap-2" style="margin-top:1.5rem;flex-wrap:wrap;">
                ${
                    !address.is_default
                        ? `<button type="button" class="btn btn-outline btn-sm address-default" data-id="${escapeHtml(address.id)}">Make Default</button>`
                        : ""
                }
                <button type="button" class="btn btn-sm address-remove" data-id="${escapeHtml(address.id)}">Remove</button>
            </div>
        `;

        container.appendChild(article);
    });

    // Delegate: make default / remove.
    container.addEventListener("click", async (event) => {
        const defaultButton = event.target.closest(".address-default");
        const removeButton = event.target.closest(".address-remove");

        if (defaultButton) {
            try {
                await apiPatch(`/addresses/${defaultButton.dataset.id}`, {
                    is_default: true
                });
                await loadAddresses(container);
            } catch (error) {
                showFormError(error.message);
            }
        }

        if (removeButton) {
            try {
                await apiDelete(`/addresses/${removeButton.dataset.id}`);
                await loadAddresses(container);
            } catch (error) {
                showFormError(error.message);
            }
        }
    });
};

const showFormError = (message) => {
    const form = document.querySelector('form[aria-label="Add address form"]');
    if (!form) return;

    let alert = form.querySelector(".address-alert");
    if (!alert) {
        alert = document.createElement("div");
        alert.className = "address-alert";
        alert.style.cssText =
            "margin-bottom:1rem;padding:0.75rem 1rem;border-radius:10px;" +
            "background:rgba(239,68,68,0.1);color:#b91c1c;" +
            "font-size:0.9rem;font-weight:600;";
        form.prepend(alert);
    }
    alert.textContent = message;
};

const loadAddresses = async (container) => {
    try {
        const data = await apiGet("/addresses");
        renderAddresses(container, data.addresses || []);
    } catch (error) {
        showNotice(container, {
            icon: "⚠️",
            title: "Couldn't load addresses",
            message: error.message
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const listSection = document.getElementById("address-list");

    if (!listSection) return;

    if (!requireAuth("addresses.html")) return;

    loadAddresses(listSection);

    const form = document.querySelector('form[aria-label="Add address form"]');
    form?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;

        try {
            await apiPost("/addresses", {
                address_line: document.getElementById("new-address-line")?.value.trim(),
                city: document.getElementById("new-city")?.value.trim(),
                state: document.getElementById("new-state")?.value.trim(),
                postal_code: document.getElementById("new-postal-code")?.value.trim(),
                phone: document.getElementById("phone")?.value.trim(),
                is_default: document.getElementById("make-default")?.checked || false
            });

            form.reset();
            await loadAddresses(listSection);
        } catch (error) {
            showFormError(error.message || "Could not save the address.");
        } finally {
            button.disabled = false;
        }
    });
});
