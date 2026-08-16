import { API_BASE_URL } from "./config.js";

const SESSION_KEY = "fixkart_session";

function getToken() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        return session?.access_token || null;
    } catch {
        return null;
    }
}

async function request(endpoint, options = {}) {
    const headers = { ...(options.headers || {}) };

    if (options.body) {
        headers["Content-Type"] = "application/json";
    }

    const token = getToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: "include"
        });
    } catch (error) {
        console.error("API Error:", error);
        throw new Error(
            "Cannot reach the server. Is the FixKart backend running on port 5000?"
        );
    }

    let data = null;

    try {
        data = await response.json();
    } catch {
        // No JSON body - leave data as null.
    }

    if (!response.ok) {
        const message =
            data?.error?.message ||
            data?.message ||
            data?.error ||
            `API request failed (${response.status})`;

        throw new Error(message);
    }

    // Unwrap the { success, data } envelope so callers get the payload directly.
    if (
        data &&
        typeof data === "object" &&
        data.success === true &&
        data.data !== undefined
    ) {
        return data.data;
    }

    return data;
}

export function apiGet(endpoint) {
    return request(endpoint, {
        method: "GET"
    });
}

export function apiPost(endpoint, data) {
    return request(endpoint, {
        method: "POST",
        body: JSON.stringify(data || {})
    });
}

export function apiPatch(endpoint, data) {
    return request(endpoint, {
        method: "PATCH",
        body: JSON.stringify(data || {})
    });
}

export function apiDelete(endpoint) {
    return request(endpoint, {
        method: "DELETE"
    });
}
