import { fetchSongs } from './api.js';
import { DOM, updateSongList, toggleLoader, displayRandomSong, populateFilterOptions, updateBandFilter, filterSongs } from './dom-utils.js';

const sortKeys = ['band', 'title'];
let currentSortKey = sortKeys[0];
let currentSortDirection = 'asc';
let isAppInitialized = false;

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

registerServiceWorker();

/**
 * Initialize the application by loading the songs and setting up event listeners.
 */
export async function initApp() {
    if (isAppInitialized) {
        console.warn('Application already initialized. Skipping duplicate initialization.');
        return;
    }
    isAppInitialized = true;

    toggleLoader(true);
    try {
        const songs = await fetchSongs();
        updateSongList(songs);
        populateFilterOptions(songs);
        setupEventListeners(songs);
    } catch (error) {
        console.error('Error fetching songs:', error)
        displayErrorMessage('There was an error loading the songs. Please try again later.');
    }
    finally {
        toggleLoader(false);
    }
}

/**
 * Display an error message on the page.
 * @param {string} message - The error message to display.
 */
function displayErrorMessage(message) {
    DOM.songList.innerHTML = `<tr><td colspan='2' style='text-align: center; color: red;'>${message}</td></tr>`;
}

/**
 * Set up event listeners for the application.
 * @param {Array} songs - Array of song objects.
 */
function setupEventListeners(songs) {
    DOM.filters.band.addEventListener('change', () => filterSongs(songs));
    DOM.filters.language.addEventListener('change', () => {
        updateBandFilter(songs);
        filterSongs(songs);
    });
    DOM.filters.title.addEventListener('input', debounce(() => filterSongs(songs), 300));
    DOM.randomSongButton.addEventListener('click', () => displayRandomSong(songs));
    DOM.headers.band.addEventListener('click', () => sortSongs(songs, 'band'));
    DOM.headers.title.addEventListener('click', () => sortSongs(songs, 'title'));
}

/**
 * Sort the songs array based on the selected column and update the song list.
 * @param {Array} songs - Array of song objects.
 * @param {string} key - The key to sort by (e.g., 'band', 'title').
 */
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
    const directionComparer = currentSortDirection === 'asc' ? 1 : -1;
    return (a, b) => {
        let compareResult = collator.compare(a[key], b[key]) * directionComparer;

        //If sort order is the same, apply additional sorting criteria
        if (compareResult === 0) {
            const alternateSortKeys = sortKeys.filter((sortKey) => sortKey !== currentSortKey);
            for (const alternativeSortKey of alternateSortKeys) {
                compareResult = collator.compare(a[alternativeSortKey], b[alternativeSortKey]);
                if (compareResult !== 0) {
                    break;
                }
            }
        }
        return compareResult;
    };
}

function updateSortIndicators(key) {
    DOM.headers.headerRow.querySelectorAll('th').forEach(header => {
        const indicator = header.querySelector('.sort-indicator');
        if (indicator) {
            indicator.className = 'sort-indicator'; // Remove any previous sorting direction
        }
        if (header.id === `${key}-header`) {
            indicator.classList.add(`sort-${currentSortDirection}`);
        }
    });
}

/**
 * Debounce a function to prevent it from being called too frequently.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {Function} - The debounced function.
 */
function debounce(func, delay) {
    let debounceTimer;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
}