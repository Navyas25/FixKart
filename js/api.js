import { API_BASE_URL } from "./config.js";

async function request(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data?.error?.message ||
                data?.message ||
                "API request failed"
            );
        }

        return data;

    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

export function apiGet(endpoint) {
    return request(endpoint, {
        method: "GET"
    });
}

export function apiPost(endpoint, data) {
    return request(endpoint, {
        method: "POST",
        body: JSON.stringify(data)
    });
}

export function apiPatch(endpoint, data) {
    return request(endpoint, {
        method: "PATCH",
        body: JSON.stringify(data)
    });
}

export function apiDelete(endpoint) {
    return request(endpoint, {
        method: "DELETE"
    });
}