import { fetchSongs } from './api-utils.js';
import { updateSongList, toggleLoader, displayRandomSong, populateFilterOptions, updateBandFilter, filterSongs } from './dom-utils.js';

const sortKeys = ['band', 'title'];
let currentSortKey = sortKeys[0];
let currentSortDirection = "asc";

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
    toggleLoader(true);
    try {
        const songs = await fetchSongs();
        updateSongList(songs);
        populateFilterOptions(songs);
        setupEventListeners(songs);
    } catch (error) {
        console.error('Error fetching songs:', error)
        alert('There was an error loading the songs.');
    }
    finally {
        toggleLoader(false);
    }
}

/**
 * Set up event listeners for the application.
 * @param {Array} songs - Array of song objects.
 */
function setupEventListeners(songs) {
    const languageFilter = document.getElementById('language-filter');
    const bandFilter = document.getElementById('band-filter');
    const titleSearchInput = document.getElementById('title-search');
    const randomSongButton = document.getElementById('random-song-button');
    const bandHeader = document.getElementById('band-header');
    const titleHeader = document.getElementById('title-header');

    bandFilter.addEventListener('change', () => filterSongs(songs));
    languageFilter.addEventListener('change', () => {
        updateBandFilter(songs);
        filterSongs(songs);
    });
    titleSearchInput.addEventListener('input', debounce(() => filterSongs(songs), 300));
    randomSongButton.addEventListener('click', () => displayRandomSong(songs));
    bandHeader.addEventListener('click', () => sortSongs(songs, 'band'));
    titleHeader.addEventListener('click', () => sortSongs(songs, 'title'));
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

        //If sort order is the same,apply additional sorting criteria
        if (compareResult === 0) {
            sortKeys.filter((sortKey) => sortKey !== currentSortKey)
                .forEach((alternativeSortKey) => {
                    compareResult = collator.compare(a[alternativeSortKey], b[alternativeSortKey])
                    if (compareResult !== 0)
                        return compareResult;
                });
        }
        return compareResult;
    };
}

function updateSortIndicators(key) {
    const songsListHeader = document.getElementById('songs-list-header');
    songsListHeader.querySelectorAll('th').forEach(header => {
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