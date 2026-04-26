export const DOM = {
    songList: document.getElementById('song-list'),
    randomSongContainer: document.getElementById('random-song-container'),
    randomSongButton: document.getElementById('random-song-button'),
    shareAppButton: document.getElementById('share-app-button'),
    loader: document.getElementById('loader'),
    tableContainer: document.querySelector('.table-container'),
    songTable: document.querySelector('.table-container table'),
    filters: {
        language: document.getElementById('language-filter'),
        band: document.getElementById('band-filter'),
        title: document.getElementById('title-search')
    },
    headers: {
        band: document.getElementById('band-header'),
        title: document.getElementById('title-header'),
        headerRow: document.getElementById('songs-list-header')
    }
};

const APP_URL = 'https://mbacelo.github.io/guitarJukebox';

export function shareAppOnWhatsApp() {
    openWhatsApp(APP_URL);
}

function shareSongOnWhatsApp(song) {
    openWhatsApp(song.url);
}

function openWhatsApp(message) {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}

function createShareButton(song, label, { labeled = false } = {}) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = labeled ? 'share-song-button share-song-button--labeled' : 'share-song-button';
    button.setAttribute('aria-label', label);
    const icon = '<i class="fa-brands fa-whatsapp" aria-hidden="true"></i>';
    button.innerHTML = labeled ? `${icon}Share song` : icon;
    button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        shareSongOnWhatsApp(song);
    });
    return button;
}

let emptyStateElement = null;
let onClearFiltersHandler = null;

/**
 * Register a callback to fire when the empty-state "Clear filters" action is clicked.
 * @param {Function} handler
 */
export function setOnClearFilters(handler) {
    onClearFiltersHandler = handler;
}

/**
 * Update the list of songs displayed on the page.
 * @param {Array<{band: string, title: string, url: string, notes?: string}>} songs - Array of song objects.
 */
export function updateSongList(songs) {
    DOM.songList.innerHTML = '';

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
        const shareButton = createShareButton(song, `Share "${song.title}" by ${song.band} on WhatsApp`);
        shareCell.appendChild(shareButton);
        tr.appendChild(shareCell);

        fragment.appendChild(tr);
    });

    DOM.songList.appendChild(fragment);

    initializeTooltip('.tooltip-icon');
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

function initializeTooltip(selector, options = {}) {
    tippy(selector, {
        placement: 'auto',
        arrow: true,
        interactive: true,
    });
}

export function toggleLoader(isLoading) {
    DOM.loader.style.display = isLoading ? 'block' : 'none';
}

function dismissRandomSong() {
    DOM.randomSongContainer.classList.remove('random-song-animation');
    DOM.randomSongContainer.innerHTML = '';
}

/**
 * Pick random song
 * @param {Array} songs - Array of song objects.
 */
export function displayRandomSong(songs) {
    const filteredSongs = getFilteredSongs(songs);
    if (filteredSongs.length === 0) return;

    const randomSong = getRandomSong(filteredSongs, songs);

    DOM.randomSongContainer.classList.remove('random-song-animation');
    void DOM.randomSongContainer.offsetWidth;
    DOM.randomSongContainer.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'random-song-card';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'card-close';
    closeButton.setAttribute('aria-label', 'Dismiss random song');
    closeButton.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    closeButton.addEventListener('click', dismissRandomSong);
    card.appendChild(closeButton);

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = randomSong.title;

    if (randomSong.notes) {
        const tooltipIcon = document.createElement('i');
        tooltipIcon.className = 'fas fa-info-circle tooltip-icon';
        tooltipIcon.id = 'note-tooltip-random-song';
        tooltipIcon.setAttribute('data-tippy-content', randomSong.notes);
        title.appendChild(tooltipIcon);
    }

    card.appendChild(title);

    const byline = document.createElement('div');
    byline.className = 'card-byline';

    const band = document.createElement('span');
    band.className = 'card-band';
    band.textContent = `by ${randomSong.band}`;
    byline.appendChild(band);

    card.appendChild(byline);

    const meta = document.createElement('div');
    meta.className = 'card-meta';

    const link = document.createElement('a');
    link.className = 'card-link';
    link.href = randomSong.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Open chords →';
    meta.appendChild(link);

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const shareButton = createShareButton(randomSong, `Share "${randomSong.title}" by ${randomSong.band} on WhatsApp`, { labeled: true });
    actions.appendChild(shareButton);

    meta.appendChild(actions);

    card.appendChild(meta);

    DOM.randomSongContainer.appendChild(card);

    if (randomSong.notes) {
        tippy('#note-tooltip-random-song', {
            placement: 'bottom-end',
            arrow: true,
            interactive: true,
        });
    }

    DOM.randomSongContainer.classList.add('random-song-animation');
}

/**
 * Filter the list of songs based on the search input, band filter, and language filter.
 * @param {Array} songs - Array of song objects.
 */
export function filterSongs(songs) {
    const filteredSongs = getFilteredSongs(songs);
    updateSongList(filteredSongs);
}

function normalizeString(str) {
    return str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function getFilteredSongs(songs) {
    const titleSearchValue = normalizeString(DOM.filters.title.value);
    const bandFilterValue = DOM.filters.band.value;
    const languageFilterValue = DOM.filters.language.value;

    return songs.filter(song => {
        if (!song.band?.trim() || !song.title?.trim()) return false;
        if (bandFilterValue && song.band !== bandFilterValue) return false;
        if (languageFilterValue && song.language !== languageFilterValue) return false;
        if (titleSearchValue && !normalizeString(song.title).includes(titleSearchValue)) return false;
        return true;
    });
}

/**
 * Populate filter options for both band and language based on the fetched songs.
 * @param {Array} songs - Array of song objects.
 */
export function populateFilterOptions(songs) {
    updateLanguageFilter(songs);
    updateBandFilter(songs);
}

export function updateBandFilter(songs) {
    const language = DOM.filters.language.value;

    const uniqueBands = getUniqueValues(songs, 'band').filter(band => {
        return language === '' || songs.find(song => song.band === band && song.language === language);
    });
    uniqueBands.sort();

    populateOptions(DOM.filters.band, uniqueBands);
}

function updateLanguageFilter(songs) {
    const uniqueLanguages = getUniqueValues(songs, 'language');
    uniqueLanguages.sort();
    populateOptions(DOM.filters.language, uniqueLanguages);
}


function populateOptions(selectElement, list) {
    selectElement.innerHTML = '<option value="">All</option>';
    list.forEach(listElement => {
        const option = document.createElement('option');
        option.value = listElement;
        option.textContent = listElement;
        selectElement.appendChild(option);
    });
}

function getUniqueValues(objectList, key) {
    return [...new Set(objectList.map(entity => entity[key]))].filter(value => value !== '');
}

function getRandomSong(filteredSongs, fullSongsList) {
    const returnedSongsUrlsKey = 'returnedSongsUrls';
    let returnedSongsUrls = [];

    try {
        const stored = localStorage.getItem(returnedSongsUrlsKey);
        if (stored) {
            returnedSongsUrls = JSON.parse(stored);
        }
    } catch (error) {
        console.warn('Failed to load from localStorage:', error);
        returnedSongsUrls = [];
    }

    if (returnedSongsUrls.length >= fullSongsList.length) {
        returnedSongsUrls = [];
    }

    let remainingSongs = filteredSongs.filter(song => !returnedSongsUrls.includes(song.url));

    if (remainingSongs.length === 0) {
        const filteredUrls = new Set(filteredSongs.map(song => song.url));
        returnedSongsUrls = returnedSongsUrls.filter(url => !filteredUrls.has(url));
        remainingSongs = filteredSongs;
    }

    const randomIndex = Math.floor(Math.random() * remainingSongs.length);
    const randomSong = remainingSongs[randomIndex];

    returnedSongsUrls.push(randomSong.url);
    try {
        localStorage.setItem(returnedSongsUrlsKey, JSON.stringify(returnedSongsUrls));
    } catch (error) {
        console.warn('Failed to save to localStorage:', error);
    }

    return randomSong;
}
