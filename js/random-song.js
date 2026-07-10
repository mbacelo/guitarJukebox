import { DOM, getFilteredSongs, initializeTooltip, createShareButton } from './dom-utils.js';

const RETURNED_SONGS_KEY = 'returnedSongsUrls';

export function displayRandomSong(songs) {
    const filteredSongs = getFilteredSongs(songs);
    if (filteredSongs.length === 0) return;

    const randomSong = pickRandomSong(filteredSongs, songs);

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

    const shareButton = createShareButton(randomSong, `Share "${randomSong.title}" by ${randomSong.band}`, { labeled: true });
    actions.appendChild(shareButton);

    meta.appendChild(actions);
    card.appendChild(meta);

    DOM.randomSongContainer.appendChild(card);

    if (randomSong.notes) {
        initializeTooltip('#note-tooltip-random-song', { placement: 'bottom-end' });
    }

    DOM.randomSongContainer.classList.add('random-song-animation');
}

function dismissRandomSong() {
    DOM.randomSongContainer.classList.remove('random-song-animation');
    DOM.randomSongContainer.innerHTML = '';
}

function pickRandomSong(filteredSongs, fullSongsList) {
    let returnedUrls = loadReturnedUrls();

    if (returnedUrls.length >= fullSongsList.length) {
        returnedUrls = [];
    }

    let remainingSongs = filteredSongs.filter(song => !returnedUrls.includes(song.url));

    if (remainingSongs.length === 0) {
        const filteredUrls = new Set(filteredSongs.map(song => song.url));
        returnedUrls = returnedUrls.filter(url => !filteredUrls.has(url));
        remainingSongs = filteredSongs;
    }

    const randomSong = remainingSongs[Math.floor(Math.random() * remainingSongs.length)];
    returnedUrls.push(randomSong.url);
    saveReturnedUrls(returnedUrls);

    return randomSong;
}

function loadReturnedUrls() {
    try {
        const stored = localStorage.getItem(RETURNED_SONGS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.warn('Failed to load from localStorage:', error);
        return [];
    }
}

function saveReturnedUrls(urls) {
    try {
        localStorage.setItem(RETURNED_SONGS_KEY, JSON.stringify(urls));
    } catch (error) {
        console.warn('Failed to save to localStorage:', error);
    }
}
