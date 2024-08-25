const randomSongsHistory = [];

/**
 * Update the list of songs displayed on the page.
 * @param {Array<{band: string, title: string, url: string, notes?: string}>} songs - Array of song objects.
 */
export function updateSongList(songs) {
    const songList = document.getElementById('song-list');
    songList.innerHTML = ''; // Clear current list
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
            songNotes.outerHTML = `<i class="fas fa-info-circle tooltip-icon" data-tippy-content="${song.notes}"></i>`;
        }

        tr.appendChild(songLinkCell);
        fragment.appendChild(tr);        
    });

    songList.appendChild(fragment);

    const randomSongContainer = document.getElementById('random-song-container');
    randomSongContainer.innerHTML = '';

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

export function toggleLoader(show) {
    document.getElementById('loader').style.display = show ? 'block' : 'none';
}

/**
 * Pick random song
 * @param {Array} songs - Array of song objects.
 */
export function displayRandomSong(songs) {
    const filteredSongs = getFilteredSongs(songs);
    if (filteredSongs.length > 0) {

        let randomIndex, randomSong;
        let attemptsCounter = 0;
        do {
            randomIndex = Math.floor(Math.random() * filteredSongs.length);
            randomSong = filteredSongs[randomIndex];
            attemptsCounter++;
        } while (randomSongsHistory.includes(randomSong.url) && attemptsCounter < filterSongs.length)

        randomSongsHistory.push(randomSong.url);

        const randomSongContainer = document.getElementById('random-song-container');
        // Remove the animation class
        randomSongContainer.classList.remove('random-song-animation');
        // Force a reflow to restart the animation
        void randomSongContainer.offsetWidth;
        // Add the random song and the animation class back
        let tooltipHTML = "";
        if (randomSong.notes) {
            tooltipHTML = `<i class="fas fa-info-circle tooltip-icon" id="note-tooltip-random-song" data-tippy-content="${randomSong.notes}"></i>`;
        }

        randomSongContainer.innerHTML = `<a href="${randomSong.url}" target="_blank">${randomSong.title} - ${randomSong.band}</a>${tooltipHTML}`;

        randomSongContainer.classList.add('random-song-animation');

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

function getFilteredSongs(songs) {
    const titleSearchValue = document.getElementById('title-search').value.toLowerCase();
    const bandFilterValue = document.getElementById('band-filter').value;
    const languageFilterValue = document.getElementById('language-filter').value;

    const filteredSongs = songs.filter(song => {
        const matchesTitleSearch = !titleSearchValue || song.title.toLowerCase().includes(titleSearchValue);
        const matchesBandFilter = !bandFilterValue || song.band === bandFilterValue;
        const matchesLanguageFilter = !languageFilterValue || song.language === languageFilterValue;
        return matchesTitleSearch && matchesBandFilter && matchesLanguageFilter;
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
    const bandFilter = document.getElementById('band-filter');
    const languageFilter = document.getElementById('language-filter');
    const language = languageFilter.value;

    const uniqueBands = getUniqueValues(songs, 'band').filter(band => {
        return language === '' || songs.find(song => song.band === band && song.language === language);
    });
    uniqueBands.sort();

    populateOptions(bandFilter, uniqueBands);
}

function updateLanguageFilter(songs) {
    const languageFilter = document.getElementById('language-filter');
    const uniqueLanguages = getUniqueValues(songs, 'language');
    uniqueLanguages.sort();
    populateOptions(languageFilter, uniqueLanguages);
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