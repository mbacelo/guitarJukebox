export async function fetchSongs() {
    if (isLocalhost()) {
        return loadSongsForLocalTesting();
    }
    return await fetchSongsFromAPI();
}

function isLocalhost() {
    return location.hostname === "localhost" || location.hostname === "127.0.0.1";
}

async function fetchSongsFromAPI() {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbyYOOuMhFxVgppb_ZmnsB4MgbVfDuxR0WMdKfoN-BbFD1cHSFq75mupaP6yz9PXHspc/exec';

    try {
        const response = await fetch(scriptUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        throw new Error('Failed to fetch songs: ' + error.message);
    }
}

async function loadSongsForLocalTesting() {
    const songs = [
        { title: 'Song01', language: 'English', band: 'A band name that is too long to fit here, really really long. Trust me. Is long as hell man. Who came up with this name?', url: 'https://example.com/song1', notes: 'Video of the song https://www.myvideo.com' },
        { title: 'Song02', language: 'Spanish', band: 'Band2', url: 'https://example.com/song2' },
        { title: 'Song03', language: 'French', band: 'Band3', url: 'https://example.com/song3' },
        { title: 'Song04', language: 'English', band: 'Band2', url: 'https://example.com/song4' },
        { title: 'Song05', language: 'English', band: 'Band1', url: 'https://example.com/song5' },
        { title: 'Song06', language: 'English', band: 'Band3', url: 'https://example.com/song6' },
        { title: 'Song07', language: 'French', band: 'Band2', url: 'https://example.com/song7', notes: 'Another note' },
        { title: 'Song08', language: 'French', band: 'Band3', url: 'https://example.com/song6' },
        { title: 'Song09', language: 'Spanish', band: 'Band1', url: 'https://example.com/song6' },
        { title: 'Song10', language: 'Spanish', band: 'Band2', url: 'https://example.com/song6' },
        { title: 'Song11', language: 'Spanish', band: 'Band2', url: 'https://example.com/song6' },
        { title: 'Song12', language: 'Spanish', band: 'Band3', url: 'https://example.com/song6' },
        { title: 'Song13', language: 'Spanish', band: 'Band1', url: 'https://example.com/song6' },
    ];

    return new Promise(resolve => setTimeout(() => resolve(songs), 500));
}