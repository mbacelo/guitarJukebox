const API_URL = 'https://script.google.com/macros/s/AKfycbyYOOuMhFxVgppb_ZmnsB4MgbVfDuxR0WMdKfoN-BbFD1cHSFq75mupaP6yz9PXHspc/exec';
const API_TIMEOUT_MS = 10000;

export async function fetchSongs() {
    if (isLocalhost()) {
        // Cache-busting query: browsers cache a *failed* dynamic import in the
        // module map, which would make the Retry button a dead end in dev
        const { testSongsData } = await import(`./test-songs-data.js?t=${Date.now()}`);
        return new Promise(resolve => setTimeout(() => resolve(testSongsData), 500));
    }
    return fetchSongsFromAPI();
}

function isLocalhost() {
    return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
}

async function fetchSongsFromAPI() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
        const response = await fetch(API_URL, { signal: controller.signal });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout: The server took too long to respond');
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}
