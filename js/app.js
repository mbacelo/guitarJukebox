if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        let serviceWorkerPath='../serviceWorker.js';
      navigator.serviceWorker
        .register(serviceWorkerPath)
        .then(registration => console.log('service worker registered', registration.scope))
        .catch(error => console.log('service worker not registered', error))
    })
  }


let songs;
const sortKeys = ['band', 'title'];
let currentSortKey = sortKeys[0];
let currentSortDirection = "asc";

const languageFilter = document.getElementById('language');
const bandFilter = document.getElementById('band');
const searchInput = document.getElementById('search');
const songList = document.getElementById('song-list');
const randomSongBtn = document.getElementById('random-song-btn');
const randomSongDisplay = document.getElementById('random-song-display');
const loader = document.getElementById('loader');
const sortBand = document.getElementById('sort-band');
const sortTitle = document.getElementById('sort-title');
const songsListHeader = document.getElementById('songs-list-header');

function getUniqueValues(entities, key) {
    return [...new Set(songs.map(entity => entity[key]))];
}

function populateFilterOptions() {
    const languages = getUniqueValues(songs, 'language');
    languageFilter.innerHTML = '<option value="">All</option>';
    languages.forEach(language => {
        const option = document.createElement('option');
        option.value = language;
        option.textContent = language;
        languageFilter.appendChild(option);
    });

    updateBandFilter();
}

function updateBandFilter() {
    const language = languageFilter.value;
    const bands = getUniqueValues(songs, 'band').filter(band => {
        return language === '' || songs.find(song => song.band === band && song.language === language);
    });

    bandFilter.innerHTML = '<option value="">All</option>';
    bands.forEach(band => {
        const option = document.createElement('option');
        option.value = band;
        option.textContent = band;
        bandFilter.appendChild(option);
    });
}

function filterSongs() {
    const filteredSongs = getFilteredSongs();
    displaySongs(filteredSongs);
}

function getFilteredSongs() {
    const language = languageFilter.value;
    const band = bandFilter.value;
    const search = searchInput.value.toLowerCase();

    return songs.filter(song => {
        return (
            (language === '' || song.language === language) &&
            (band === '' || song.band === band) &&
            (search === '' || song.title.toLowerCase().includes(search))
        );
    });
}

function displaySongs(filteredSongs) {
    songList.innerHTML = '';
    filteredSongs.forEach(song => {
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

        if (song.notes) {
            const songNotes = document.createElement('i');
            songLinkCell.appendChild(songNotes);
            songNotes.outerHTML = `<i class="fas fa-info-circle tooltip-icon" data-tippy-content="${song.notes}"></i>`;
        }

        tr.appendChild(songLinkCell);

        songList.appendChild(tr);
    });

    randomSongDisplay.innerHTML = '';

    tippy('.tooltip-icon', {
        placement: 'auto', // Automatically positions the tooltip
        arrow: true, // Adds an arrow pointing to the icon
        interactive: true, // Allows interaction with the tooltip (click, hover, etc.)
    });
}

function pickRandomSong() {
    const filteredSongs = getFilteredSongs();
    if (filteredSongs.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredSongs.length);
        const randomSong = filteredSongs[randomIndex];
        // Remove the animation class
        randomSongDisplay.classList.remove('random-song-animation');
        // Force a reflow to restart the animation
        void randomSongDisplay.offsetWidth;
        // Add the random song and the animation class back
        let tooltipHTML = "";
        if (randomSong.notes) {
            tooltipHTML = `<i class="fas fa-info-circle tooltip-icon" id="note-tooltip-random-song" data-tippy-content="${randomSong.notes}"></i>`;
        }

        randomSongDisplay.innerHTML = `<a href="${randomSong.url}" target="_blank">${randomSong.title} - ${randomSong.band}</a>${tooltipHTML}`;

        randomSongDisplay.classList.add('random-song-animation');

        tippy('#note-tooltip-random-song', {
            placement: 'bottom-end',
            arrow: true,
            interactive: true, // Allows interaction with the tooltip (click, hover, etc.)
        });
    }
}

function sortSongs(key) {
    if (currentSortKey === key) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc'
    }
    else {
        currentSortKey = key;
        currentSortDirection = 'asc';
    }

    const directionComparer = currentSortDirection === 'asc' ? 1 : -1;

    let compareResult;
    songs.sort((a, b) => {
        if (a[currentSortKey]) {
            compareResult = a[currentSortKey].localeCompare(b[currentSortKey]) * directionComparer;
        }

        if (compareResult === 0) {
            sortKeys.filter((sortKey) => sortKey !== currentSortKey)
                .forEach((alternativeSortKey) => {
                    if (a[alternativeSortKey]) {
                        compareResult = a[alternativeSortKey].localeCompare(b[alternativeSortKey]);

                        if (compareResult !== 0)
                            return compareResult;
                    }
                });
        }
        return compareResult;
    });

    songsListHeader.querySelectorAll('th').forEach(header => {
        const indicator = header.querySelector('.sort-indicator');
        if (indicator) {
            indicator.className = 'sort-indicator'; // Remove any previous sorting direction
        }

        if (header.id === `sort-${key}`)
            indicator.classList.add(`sort-${currentSortDirection}`);
    });

    filterSongs();
}

languageFilter.addEventListener('change', () => {
    updateBandFilter();
    filterSongs();
});
bandFilter.addEventListener('change', filterSongs);
searchInput.addEventListener('input', filterSongs);
randomSongBtn.addEventListener('click', pickRandomSong);
sortBand.addEventListener('click', () => sortSongs('band'));
sortTitle.addEventListener('click', () => sortSongs('title'));

function loadSongs() {
    var scriptUrl = 'https://script.google.com/macros/s/AKfycbyYOOuMhFxVgppb_ZmnsB4MgbVfDuxR0WMdKfoN-BbFD1cHSFq75mupaP6yz9PXHspc/exec';

    fetch(scriptUrl)
        .then(response => response.json())
        .then(data => { getSongsListSuccess(data) })
        .catch(error => console.error('Error fetching songs:', error));
}

function getSongsListSuccess(songList) {
    songs = songList;
    populateFilterOptions();
    displaySongs(songs);
    loader.style.display = 'none';
}

function getSongsListError(error) {
    console.error('Error fetching songs:', error)
    alert('Error fetching songs:' + error.message);
    loader.style.display = 'none';
}

function loadSongsTest() {
    songs = [
        { title: 'Song01', language: 'English', band: 'A band name that is to long to fit here, really really long. Trust me. Is long as hell man. Who came up with this name?', url: 'https://example.com/song1', notes: 'Video of the song https://www.myvideo.com' },
        { title: 'Song02', language: 'Spanish', band: 'Band2', url: 'https://example.com/song2' },
        { title: 'Song03', language: 'French', band: 'Band3', url: 'https://example.com/song3' },
        { title: 'Song04', language: 'English', band: 'Band2', url: 'https://example.com/song4' },
        { title: 'Song05', language: 'Spanish', band: 'Band1', url: 'https://example.com/song5' },
        { title: 'Song06', language: 'Spanish', band: 'Band3', url: 'https://example.com/song6' },
        { title: 'Song07', language: 'Spanish', band: 'Band2', url: 'https://example.com/song7', notes: 'Another note' },
        { title: 'Song08', language: 'Spanish', band: 'Band3', url: 'https://example.com/song6' },
        { title: 'Song09', language: 'Spanish', band: 'Band1', url: 'https://example.com/song6' },
        { title: 'Song10', language: 'Spanish', band: 'Band2', url: 'https://example.com/song6' },
        { title: 'Song11', language: 'Spanish', band: 'Band2', url: 'https://example.com/song6' },
        { title: 'Song12', language: 'Spanish', band: 'Band3', url: 'https://example.com/song6' },
        { title: 'Song13', language: 'Spanish', band: 'Band1', url: 'https://example.com/song6' },
    ];

    populateFilterOptions();
    setTimeout(() => {
        displaySongs(songs);
        loader.style.display = 'none'
    }
        , 2000);
}      