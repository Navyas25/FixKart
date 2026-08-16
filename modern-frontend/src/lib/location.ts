// Google Maps Platform helpers for the React landing page.
//
// Set VITE_GOOGLE_MAPS_API_KEY in modern-frontend/.env to enable Places
// autocomplete + Google reverse geocoding. Google reverse geocoding needs a
// billing-enabled key; when it is missing or denied, reverseGeocode falls
// back to OpenStreetMap's free Nominatim service so the detect button can
// still show a place name (never just raw coordinates).

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

let mapsPromise: Promise<typeof google.maps> | null = null;

function loadGoogleMaps(): Promise<typeof google.maps> {
  if (!MAPS_API_KEY) {
    return Promise.reject(
      new Error("Google Maps API key missing (VITE_GOOGLE_MAPS_API_KEY)")
    );
  }

  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-fixkart-maps]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google.maps));
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
      `?key=${encodeURIComponent(MAPS_API_KEY)}` +
      `&libraries=places&v=weekly`;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return mapsPromise;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  // 1) Google Geocoding API (needs a billing-enabled key)
  if (MAPS_API_KEY) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json` +
          `?latlng=${latitude},${longitude}` +
          `&key=${encodeURIComponent(MAPS_API_KEY)}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status === "OK" && data.results?.length) {
          return data.results[0].formatted_address;
        }
      }
    } catch {
      // fall through to the free geocoder
    }
  }

  // 2) BigDataCloud - free, no key, no rate limit, CORS-enabled. Returns a
  //    clean "Bengaluru, India" style place name.
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client` +
        `?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );

    if (response.ok) {
      const data = await response.json();
      const place =
        data?.city || data?.locality || data?.principalSubdivision || "";
      const country = data?.countryName || "";
      if (place || country) {
        return [place, country].filter(Boolean).join(", ");
      }
    }
  } catch {
    // fall through to the next geocoder
  }

  // 3) OpenStreetMap Nominatim - last resort, free, no key, but rate-limited
  //    to ~1 request/second so it can return 429 under quick retries.
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse` +
        `?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data?.display_name) return null;

    const parts = String(data.display_name)
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    return parts.slice(0, 3).join(", ");
  } catch {
    return null;
  }
}

export async function detectUserLocation(): Promise<{
  latitude: number;
  longitude: number;
  address: string | null;
}> {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by this browser");
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      maximumAge: 60000
    });
  });

  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const address = await reverseGeocode(latitude, longitude);

  return { latitude, longitude, address };
}

// Attaches a Places autocomplete dropdown to an input; no-op without a key.
export function attachAutocomplete(
  input: HTMLInputElement,
  onPlace: (formattedAddress: string) => void
): void {
  if (!MAPS_API_KEY) return;

  loadGoogleMaps()
    .then((maps) => {
      if (!maps.places) return;

      const autocomplete = new maps.places.Autocomplete(input, {
        types: ["geocode"]
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place) return;
        onPlace(place.formatted_address || input.value);
      });
    })
    .catch(() => {
      // Input still works as plain text.
    });
}
