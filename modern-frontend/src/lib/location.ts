// Google Maps Platform helpers for the React landing page.
//
// Set VITE_GOOGLE_MAPS_API_KEY in modern-frontend/.env to enable Places
// autocomplete + reverse geocoding. Without a key, location detection falls
// back to the browser's raw latitude/longitude.

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
  if (!MAPS_API_KEY) return null;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json` +
        `?latlng=${latitude},${longitude}` +
        `&key=${encodeURIComponent(MAPS_API_KEY)}`
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.status !== "OK" || !data.results?.length) return null;

    return data.results[0].formatted_address;
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
