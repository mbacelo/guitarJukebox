import { testSongsData } from './test-songs-data.js';

const API_URL = 'https://script.google.com/macros/s/AKfycbyYOOuMhFxVgppb_ZmnsB4MgbVfDuxR0WMdKfoN-BbFD1cHSFq75mupaP6yz9PXHspc/exec';

export async function fetchSongs() {
    if (isLocalhost()) {
        return loadSongsForLocalTesting();
    }
    return await fetchSongsFromAPI();
}

function isLocalhost() {
    return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
}

async function fetchSongsFromAPI() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
        const response = await fetch(API_URL, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout: The server took too long to respond');
        }
        throw error;
    }
}

async function loadSongsForLocalTesting() {
    return new Promise(resolve => setTimeout(() => resolve(testSongsData), 500));
    //return new Promise((resolve, reject) => setTimeout(() => { reject(Error('My error message')); }, 500));
}