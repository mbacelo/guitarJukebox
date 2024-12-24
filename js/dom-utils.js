export const DOM = {
    songList: document.getElementById('song-list'),
    randomSongContainer: document.getElementById('random-song-container'),
    randomSongButton: document.getElementById('random-song-button'),
    loader: document.getElementById('loader'),
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

/**
 * Update the list of songs displayed on the page.
 * @param {Array<{band: string, title: string, url: string, notes?: string}>} songs - Array of song objects.
 */
export function updateSongList(songs) {
    DOM.songList.innerHTML = ''; // Clear current list
    const fragment = document.createDocumentFragment();

    songs.forEach(song => {
        const tr = document.createElement('tr');

        // Create and append the band name cell
        const bandCell = document.createElement('td');
        bandCell.textContent = song.band;
        tr.appendChild(bandCell);

        // Create and append the song link cell
        const songLinkCell = document.createElement('td');
        const songLink = document.createElement('a');
        songLink.href = song.url;
        songLink.target = '_blank';
        songLink.textContent = song.title;
        songLinkCell.appendChild(songLink);

        // Create and append notes tooltip, if any
        if (song.notes) {
            const songNotes = document.createElement('i');
            songLinkCell.appendChild(songNotes);
            songNotes.outerHTML = `<i class='fas fa-info-circle tooltip-icon' data-tippy-content='${song.notes}'></i>`;
        }

        tr.appendChild(songLinkCell);
        fragment.appendChild(tr);
    });

    DOM.songList.appendChild(fragment);
    DOM.randomSongContainer.innerHTML = '';

    //Initialize tooltip configuration for each song note
    initializeTooltip('.tooltip-icon');
}

function initializeTooltip(selector, options = {}) {
    tippy(selector, {
        placement: 'auto', // Automatically positions the tooltip
        arrow: true, // Adds an arrow pointing to the icon
        interactive: true, // Allows interaction with the tooltip (click, hover, etc.)
    });
}

export function toggleLoader(isLoading) {
    DOM.loader.style.display = isLoading ? 'block' : 'none';
}

/**
 * Pick random song
 * @param {Array} songs - Array of song objects.
 */
export function displayRandomSong(songs) {
    const filteredSongs = getFilteredSongs(songs);
    if (filteredSongs.length > 0) {

        const randomSong = getRandomSong(filteredSongs, songs);

        // Remove the animation class
        DOM.randomSongContainer.classList.remove('random-song-animation');
        // Force a reflow to restart the animation
        void DOM.randomSongContainer.offsetWidth;
        // Add the random song and the animation class back
        let tooltipHTML = '';
        if (randomSong.notes) {
            tooltipHTML = `<i class='fas fa-info-circle tooltip-icon' id='note-tooltip-random-song' data-tippy-content='${randomSong.notes}'></i>`;
        }

        DOM.randomSongContainer.innerHTML = `<a href='${randomSong.url}' target='_blank'>${randomSong.title} - ${randomSong.band}</a>${tooltipHTML}`;

        DOM.randomSongContainer.classList.add('random-song-animation');

        tippy('#note-tooltip-random-song', {
            placement: 'bottom-end',
            arrow: true,
            interactive: true, // Allows interaction with the tooltip (click, hover, etc.)
        });
    }
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

    const filteredSongs = songs.filter(song => {        
        const matchesBandFilter = !bandFilterValue || song.band === bandFilterValue;
        const matchesLanguageFilter = !languageFilterValue || song.language === languageFilterValue;
        
        if(matchesBandFilter && matchesLanguageFilter && titleSearchValue){ //avoid performing search by title if other criteria don't match or if the search input is empty
            return !titleSearchValue || normalizeString(song.title).includes(titleSearchValue);
        }
        
        return matchesBandFilter && matchesLanguageFilter;
    });

    return filteredSongs;
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
    return [...new Set(objectList.map(entity => entity[key]))];
}

function getRandomSong(filteredSongs, fullSongsList) {
    const returnedSongsUrlsKey = 'returnedSongsUrls'; // Key for localStorage
    let returnedSongsUrls = JSON.parse(localStorage.getItem(returnedSongsUrlsKey)) || [];

    // If all songs have been returned, reset the returned songs list, and start again
    if (returnedSongsUrls.length === fullSongsList.length) {
        returnedSongsUrls = [];
    }

    // Find the remaining items
    //let remainingSongs = filteredSongs.filter(song => !returnedSongsUrls.includes(song.url));
    let remainingSongs = filteredSongs.filter(song => {
        let result = !returnedSongsUrls.includes(song.url);
        return result;
    });

    // If there are no new songs to display, but the list is filtered, display any song from the filtered list
    let trackSong = true;
    if (remainingSongs.length === 0 && filteredSongs.length < fullSongsList.length) {
        remainingSongs = filteredSongs;
        trackSong = false;
    }

    // Pick a random item from the remaining items
    const randomIndex = Math.floor(Math.random() * remainingSongs.length);
    const randomSong = remainingSongs[randomIndex];

    if (trackSong) {
        // Update the used items list
        returnedSongsUrls.push(randomSong.url);
        localStorage.setItem(returnedSongsUrlsKey, JSON.stringify(returnedSongsUrls));
    }

    return randomSong;
}