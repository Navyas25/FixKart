import { GOOGLE_MAPS_API_KEY } from "./config.js";

/* =========================================
   GOOGLE MAPS PLATFORM LOCATION HELPERS
=========================================
   Uses the Google Maps JavaScript API (Places for autocomplete) and the
   Geocoding API (reverse geocoding of browser-coordinates into an address).

   The API key lives in js/config.js. You can also inject one at runtime with:

       <script>window.__FIXKART_GMAPS_KEY__ = "AIza..."</script>

   If no key is configured the helpers degrade gracefully: detection falls
   back to raw latitude/longitude and autocomplete is skipped.
========================================= */

export const getMapsApiKey = () =>
    window.__FIXKART_GMAPS_KEY__ || GOOGLE_MAPS_API_KEY || "";

let mapsPromise = null;

// Loads the Maps JavaScript API once and resolves with window.google.maps.
export const loadGoogleMaps = () => {
    const key = getMapsApiKey();

    if (!key) {
        return Promise.reject(
            new Error("Google Maps API key is not configured (js/config.js)")
        );
    }

    if (mapsPromise) return mapsPromise;

    mapsPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector(
            "script[data-fixkart-maps]"
        );

        if (existing) {
            existing.addEventListener("load", () =>
                resolve(window.google.maps)
            );
            existing.addEventListener("error", () =>
                reject(new Error("Failed to load Google Maps"))
            );
            return;
        }

        const script = document.createElement("script");
        script.dataset.fixkartMaps = "1";
        script.async = true;
        script.src =
            `https://maps.googleapis.com/maps/api/js` +
            `?key=${encodeURIComponent(key)}` +
            `&libraries=places&v=weekly`;

        script.onload = () => resolve(window.google.maps);
        script.onerror = () =>
            reject(new Error("Failed to load Google Maps"));
        document.head.appendChild(script);
    });

    return mapsPromise;
};

// Reverse geocodes coordinates into a human-readable address via the
// Geocoding API. Returns null when no key is configured or nothing is found.
export const reverseGeocode = async (latitude, longitude) => {
    const key = getMapsApiKey();

    if (!key) return null;

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json` +
                `?latlng=${latitude},${longitude}` +
                `&key=${encodeURIComponent(key)}`
        );

        if (!response.ok) return null;

        const data = await response.json();

        if (data.status !== "OK" || !data.results?.length) {
            return null;
        }

        return data.results[0].formatted_address;
    } catch {
        return null;
    }
};

// Gets the browser's location, then converts it to an address when possible.
// Resolves to { latitude, longitude, address }.
export const detectUserLocation = async () => {
    if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser");
    }

    const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 60000
        });
    });

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const address = await reverseGeocode(latitude, longitude);

    return { latitude, longitude, address };
};

// Attaches a Google Places autocomplete dropdown to an input. Falls back to
// plain typing when no key is configured.
export const attachAutocomplete = (input, { onPlace } = {}) => {
    if (!input || !getMapsApiKey()) return;

    loadGoogleMaps()
        .then((maps) => {
            if (!maps.places) return;

            const autocomplete = new maps.places.Autocomplete(input, {
                types: ["geocode"]
            });

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();

                if (!place) return;

                input.value =
                    place.formatted_address || input.value;

                input.dataset.placeId = place.place_id || "";
                input.dataset.latitude = String(place.geometry?.location?.lat?.() ?? "");
                input.dataset.longitude = String(place.geometry?.location?.lng?.() ?? "");

                if (typeof onPlace === "function") {
                    onPlace(place);
                }
            });
        })
        .catch(() => {
            // No key or load failure - the input keeps working as plain text.
        });
};

/* =========================================
   CLASSIC SITE WIRING
========================================= */

// Wires up every [data-location-autocomplete] input and the hero
// #detect-location button (home page).
export const initLocationControls = () => {
    const detectButton = document.getElementById("detect-location");
    const locationInput = document.getElementById("location-input");

    if (detectButton && locationInput) {
        detectButton.addEventListener("click", async () => {
            if (!navigator.geolocation) {
                locationInput.value = "Location not supported";
                return;
            }

            locationInput.value = "Detecting location...";

            try {
                const { latitude, longitude, address } =
                    await detectUserLocation();

                locationInput.value =
                    address ||
                    `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

                locationInput.dataset.latitude = String(latitude);
                locationInput.dataset.longitude = String(longitude);
            } catch {
                locationInput.value = "Unable to detect location";
            }
        });
    }

    document
        .querySelectorAll("[data-location-autocomplete]")
        .forEach((input) => attachAutocomplete(input));
};
