import { getBandFilterValue, setBandOptions, setBandFilterValue } from './band-combobox.js';

export const DOM = {
    songList: document.getElementById('song-list'),
    randomSongContainer: document.getElementById('random-song-container'),
    randomSongButton: document.getElementById('random-song-button'),
    shareAppButton: document.getElementById('share-app-button'),
    loader: document.getElementById('loader'),
    songCount: document.getElementById('song-count'),
    tableContainer: document.querySelector('.table-container'),
    songTable: document.querySelector('.table-container table'),
    filters: {
        language: document.getElementById('language-filter'),
        band: document.getElementById('band-filter'),
        bandInput: document.getElementById('band-filter-input'),
        bandList: document.getElementById('band-filter-list'),
        bandClear: document.querySelector('#band-filter .combobox-clear'),
        title: document.getElementById('title-search')
    },
    headers: {
        band: document.getElementById('band-header'),
        title: document.getElementById('title-header'),
        headerRow: document.getElementById('songs-list-header')
    }
};

const APP_URL = 'https://mbacelo.github.io/guitarJukebox';

export function shareApp() {
    shareLink(APP_URL);
}

function shareLink(link) {
    if (navigator.share) {
        navigator.share({ url: link }).catch(error => {
            if (error.name !== 'AbortError') openWhatsApp(link);
        });
        return;
    }
    openWhatsApp(link);
}

function openWhatsApp(message) {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}

export function createShareButton(song, label, { labeled = false } = {}) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = labeled ? 'share-song-button share-song-button--labeled' : 'share-song-button';
    button.setAttribute('aria-label', label);
    const icon = '<i class="fa-solid fa-share-nodes" aria-hidden="true"></i>';
    button.innerHTML = labeled ? `${icon}Share song` : icon;
    button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        shareLink(song.url);
    });
    return button;
}

let emptyStateElement = null;
let onClearFiltersHandler = null;

export function setOnClearFilters(handler) {
    onClearFiltersHandler = handler;
}

export function updateSongList(songs) {
    DOM.songList.innerHTML = '';

    updateSongCount(songs.length);
    DOM.randomSongButton.disabled = songs.length === 0;

    if (songs.length === 0) {
        renderEmptyState();
        return;
    }

    hideEmptyState();

    const fragment = document.createDocumentFragment();

    songs.forEach(song => {
        const tr = document.createElement('tr');

        const bandCell = document.createElement('td');
        bandCell.className = 'cell-band';
        bandCell.textContent = song.band;
        tr.appendChild(bandCell);

        const songLinkCell = document.createElement('td');
        songLinkCell.className = 'cell-title';
        const songLink = document.createElement('a');
        songLink.href = song.url;
        songLink.target = '_blank';
        songLink.rel = 'noopener noreferrer';
        songLink.textContent = song.title;
        songLinkCell.appendChild(songLink);

        if (song.notes) {
            const songNotes = document.createElement('i');
            songNotes.className = 'fas fa-info-circle tooltip-icon';
            songNotes.setAttribute('data-tippy-content', song.notes);
            songLinkCell.appendChild(songNotes);
        }

        tr.appendChild(songLinkCell);

        const shareCell = document.createElement('td');
        shareCell.className = 'cell-share';
        const shareButton = createShareButton(song, `Share "${song.title}" by ${song.band}`);
        shareCell.appendChild(shareButton);
        tr.appendChild(shareCell);

        fragment.appendChild(tr);
    });

    DOM.songList.appendChild(fragment);

    initializeTooltip('#song-list .tooltip-icon');
}

function updateSongCount(count) {
    if (!DOM.songCount) return;
    DOM.songCount.textContent = count === 1 ? '1 song' : `${count} songs`;
}

function renderEmptyState() {
    if (!DOM.tableContainer) return;
    if (emptyStateElement && emptyStateElement.isConnected) return;

    if (DOM.songTable) {
        DOM.songTable.style.display = 'none';
    }

    emptyStateElement = document.createElement('div');
    emptyStateElement.className = 'empty-state';
    emptyStateElement.innerHTML = `
        <div class="empty-state-icon"><i class="fa-solid fa-magnifying-glass-minus" aria-hidden="true"></i></div>
        <p class="empty-state-message">No songs match your filters.</p>
        <button type="button" class="empty-state-action">Clear filters</button>
    `;

    const action = emptyStateElement.querySelector('.empty-state-action');
    action.addEventListener('click', () => {
        if (typeof onClearFiltersHandler === 'function') {
            onClearFiltersHandler();
        }
    });

    DOM.tableContainer.appendChild(emptyStateElement);
}

function hideEmptyState() {
    if (emptyStateElement && emptyStateElement.isConnected) {
        emptyStateElement.remove();
    }
    emptyStateElement = null;
    if (DOM.songTable) {
        DOM.songTable.style.display = '';
    }
}

export function initializeTooltip(selector, options = {}) {
    tippy(selector, {
        placement: 'auto',
        arrow: true,
        interactive: true,
        ...options,
    });
}

export function toggleLoader(isLoading) {
    DOM.loader.style.display = isLoading ? 'block' : 'none';
}

export function filterSongs(songs) {
    updateSongList(getFilteredSongs(songs));
}

export function normalizeString(str) {
    return str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function getFilteredSongs(songs) {
    const titleSearchValue = normalizeString(DOM.filters.title.value);
    const bandFilterValue = getBandFilterValue();
    const languageFilterValue = DOM.filters.language.value;

    return songs.filter(song => {
        if (!song.band?.trim() || !song.title?.trim()) return false;
        if (bandFilterValue && song.band !== bandFilterValue) return false;
        if (languageFilterValue && song.language !== languageFilterValue) return false;
        if (titleSearchValue && !normalizeString(song.title).includes(titleSearchValue)) return false;
        return true;
    });
}

export function populateFilterOptions(songs) {
    updateLanguageFilter(songs);
    updateBandFilter(songs);
}

export function updateBandFilter(songs) {
    const language = DOM.filters.language.value;
    const uniqueBands = getSortedUniqueValues(songs, 'band').filter(band => {
        return language === '' || songs.some(song => song.band === band && song.language === language);
    });

    setBandOptions(uniqueBands);

    const currentBand = getBandFilterValue();
    if (currentBand && !uniqueBands.includes(currentBand)) {
        setBandFilterValue('');
    }
}

function updateLanguageFilter(songs) {
    const uniqueLanguages = getSortedUniqueValues(songs, 'language');
    DOM.filters.language.innerHTML = '<option value="">All</option>';
    uniqueLanguages.forEach(language => {
        const option = document.createElement('option');
        option.value = language;
        option.textContent = language;
        DOM.filters.language.appendChild(option);
    });
}

function getSortedUniqueValues(objectList, key) {
    return [...new Set(objectList.map(entity => entity[key]))]
        .filter(value => value !== '')
        .sort();
}
