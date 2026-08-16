import { apiGet } from "./api.js";
import { escapeHtml, formatDate, formatINR } from "./utils.js";

const setStat = (index, value) => {
    const values = document.querySelectorAll(
        "#dashboard-overview .stat-value"
    );
    if (values[index]) {
        values[index].textContent = String(value ?? "—");
    }
};

const noDataRow = (colspan, text) => {
    const tr = document.createElement("tr");
    tr.innerHTML =
        `<td colspan="${colspan}" style="text-align:center;padding:1.5rem;color:var(--text-secondary, #64748b);">${escapeHtml(text)}</td>`;
    return tr;
};

const loadProducts = async () => {
    const tbody = document.querySelector("#manage-products tbody");
    if (!tbody) return;

    try {
        const data = await apiGet("/products?limit=50");
        const products = data.products || [];
        setStat(0, products.length || data.total || 0);

        tbody.innerHTML = "";

        if (!products.length) {
            tbody.appendChild(noDataRow(6, "No products yet. Add products from the Supabase dashboard."));
            return;
        }

        products.slice(0, 10).forEach((product) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${escapeHtml(product.name)}</td>
                <td>${escapeHtml(product.category?.name || "—")}</td>
                <td>${formatINR(product.price)}</td>
                <td>${Number(product.stock) || 0}</td>
                <td>
                    <span class="badge ${Number(product.stock) > 0 ? "badge-green" : "badge-gray"}">
                        ${Number(product.stock) > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                </td>
                <td><a href="../pages/product-details.html?id=${encodeURIComponent(product.id)}" class="btn btn-outline btn-sm">View</a></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        setStat(0, "—");
    }
};

const loadServices = async () => {
    const grid = document.querySelector("#manage-services .grid");
    if (!grid) return;

    try {
        const data = await apiGet("/services");
        const services = data.services || [];
        setStat(2, services.length);

        grid.innerHTML = "";

        if (!services.length) {
            const notice = document.createElement("p");
            notice.className = "text-secondary";
            notice.style.cssText = "grid-column:1 / -1;text-align:center;padding:1.5rem;";
            notice.textContent = "No services yet. Add services from the Supabase dashboard.";
            grid.appendChild(notice);
            return;
        }

        services.forEach((service) => {
            const card = document.createElement("article");
            card.className = "service-card card";
            card.innerHTML = `
                <div class="service-icon">🛠️</div>
                <h3>${escapeHtml(service.name)}</h3>
                <p>${escapeHtml(service.description || "")}</p>
                <p class="text-secondary">${formatINR(service.base_price)} starting</p>
                <span class="badge badge-green">Active</span>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        setStat(2, "—");
    }
};

const loadProfessionals = async () => {
    const grid = document.querySelector("#manage-professionals .grid");
    if (!grid) return;

    try {
        const data = await apiGet("/professionals");
        const professionals = data.professionals || [];

        grid.innerHTML = "";

        if (!professionals.length) {
            const notice = document.createElement("p");
            notice.className = "text-secondary";
            notice.style.cssText = "grid-column:1 / -1;text-align:center;padding:1.5rem;";
            notice.textContent = "No professionals yet. Add professionals from the Supabase dashboard.";
            grid.appendChild(notice);
            return;
        }

        professionals.forEach((professional) => {
            const name = professional.profile?.full_name || "Professional";
            const initials = name
                .split(" ")
                .map((part) => part.charAt(0))
                .join("")
                .slice(0, 2)
                .toUpperCase();

            const card = document.createElement("article");
            card.className = "pro-card card";
            card.innerHTML = `
                <div class="pro-header">
                    <div class="pro-avatar">${escapeHtml(initials)}</div>
                    <div>
                        <h4>${escapeHtml(name)}</h4>
                        <div class="pro-profession">${Number(professional.rating || 0).toFixed(1)} / 5 rating</div>
                    </div>
                </div>
                <div class="pro-meta">
                    <span>⭐ ${Number(professional.rating || 0).toFixed(1)}</span>
                    <span>${Number(professional.experience_years) || 0} yrs exp.</span>
                </div>
                <span class="badge badge-verified">✓ Verified</span>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        // Non-fatal.
    }
};

const loadOrders = async () => {
    const tbody = document.querySelector("#manage-orders tbody");
    if (!tbody) return;

    try {
        const data = await apiGet("/orders");
        const orders = data.orders || [];
        setStat(1, orders.length);

        tbody.innerHTML = "";

        if (!orders.length) {
            tbody.appendChild(noDataRow(5, "No orders yet."));
            return;
        }

        orders.slice(0, 10).forEach((order) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>#FK-${escapeHtml(String(order.id).slice(0, 8).toUpperCase())}</td>
                <td>${escapeHtml(order.address?.city || "—")}</td>
                <td>${formatINR(order.total_amount)}</td>
                <td>${escapeHtml(formatDate(order.created_at))}</td>
                <td><span class="badge badge-green">${escapeHtml(order.status || "Confirmed")}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        const tr = noDataRow(5, "Sign in to view orders.");
        tbody.innerHTML = "";
        tbody.appendChild(tr);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    loadServices();
    loadProfessionals();
    loadOrders();

    // A public registered-users count is not exposed - leave a placeholder.
    setStat(3, "—");
});
