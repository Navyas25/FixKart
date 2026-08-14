import { apiGet } from "./api.js";

async function loadProducts() {
    try {
        const data = await apiGet("/products");

        console.log(data);
    } catch (error) {
        console.error("Failed to load products:", error);
    }
}

loadProducts();