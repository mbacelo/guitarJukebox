import { fetchSongs } from './api.js';
import { DOM, toggleLoader, populateFilterOptions, updateBandFilter, filterSongs, setOnClearFilters, shareApp } from './dom-utils.js';
import { initBandCombobox, setOnBandFilterChange, setBandFilterValue } from './band-combobox.js';
import { displayRandomSong } from './random-song.js';

const sortKeys = ['band', 'title'];
let currentSortKey = null;
let currentSortDirection = 'asc';

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker
                .register('serviceWorker.js')
                .then(registration => console.log('Service worker registered:', registration.scope))
                .catch(error => console.log('Service worker registration failed:', error))
        })
    }
}

export async function initApp() {
    registerServiceWorker();
    await loadSongs();
}

async function loadSongs() {
    DOM.songList.innerHTML = '';
    toggleLoader(true);
    try {
        const songs = await fetchSongs();
        populateFilterOptions(songs);
        setupEventListeners(songs);
        sortSongs(songs, 'band');
    } catch (error) {
        console.error('Error fetching songs:', error)
        displayErrorMessage('There was an error loading the songs.');
    }
    finally {
        toggleLoader(false);
    }
}

function displayErrorMessage(message) {
    DOM.songList.innerHTML = '';
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 3;
    cell.className = 'error-cell';

    const text = document.createElement('p');
    text.className = 'error-message';
    text.textContent = message;
    cell.appendChild(text);

    const retryButton = document.createElement('button');
    retryButton.type = 'button';
    retryButton.className = 'empty-state-action';
    retryButton.innerHTML = '<i class="fa-solid fa-rotate-right" aria-hidden="true"></i> Retry';
    retryButton.addEventListener('click', () => loadSongs());
    cell.appendChild(retryButton);

    row.appendChild(cell);
    DOM.songList.appendChild(row);
}

function setupEventListeners(songs) {
    initBandCombobox();
    setOnBandFilterChange(() => filterSongs(songs));
    DOM.filters.language.addEventListener('change', () => {
        updateBandFilter(songs);
        filterSongs(songs);
    });
    DOM.filters.title.addEventListener('input', debounce(() => filterSongs(songs), 300));
    DOM.randomSongButton.addEventListener('click', () => displayRandomSong(songs));
    DOM.headers.band.addEventListener('click', () => sortSongs(songs, 'band'));
    DOM.headers.title.addEventListener('click', () => sortSongs(songs, 'title'));
    DOM.shareAppButton.addEventListener('click', shareApp);

    setOnClearFilters(() => {
        DOM.filters.language.value = '';
        setBandFilterValue('');
        DOM.filters.title.value = '';
        updateBandFilter(songs);
        filterSongs(songs);
    });
}

function sortSongs(songs, key) {
    updateSortDirection(key);
    songs.sort(createComparer(key));
    updateSortIndicators(key);
    filterSongs(songs);
}

function updateSortDirection(key) {
    if (currentSortKey === key) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortKey = key;
        currentSortDirection = 'asc';
    }
}

function createComparer(key) {
    const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
    const directionMultiplier = currentSortDirection === 'asc' ? 1 : -1;
    return (a, b) => {
        let result = collator.compare(a[key], b[key]) * directionMultiplier;
        if (result !== 0) return result;

        // Tiebreaker: compare on the other sort key(s)
        for (const altKey of sortKeys.filter(k => k !== currentSortKey)) {
            result = collator.compare(a[altKey], b[altKey]);
            if (result !== 0) return result;
        }
        return result;
    };
}

function updateSortIndicators(key) {
    DOM.headers.headerRow.querySelectorAll('th').forEach(header => {
        const indicator = header.querySelector('.sort-indicator');
        if (!indicator) return;
        indicator.className = 'sort-indicator';
        if (header.id === `${key}-header`) {
            indicator.classList.add(`sort-${currentSortDirection}`);
            header.setAttribute('aria-sort', currentSortDirection === 'asc' ? 'ascending' : 'descending');
        } else {
            header.removeAttribute('aria-sort');
        }
    });
}

function debounce(func, delay) {
    let debounceTimer;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
}
