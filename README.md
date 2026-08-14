# Guitar Jukebox 🎸

A Progressive Web App for browsing a curated list of guitar songs — filter by language, band, or title, sort the list, and let it pick a random song when you can't decide what to play.

**Live app:** https://mbacelo.github.io/guitarJukebox

![Guitar Jukebox](images/socialMediaCover.png)

## Features

- **Filtering** — by language, by band (searchable combobox), and by title. Title search is accent-insensitive, so `song` matches `sóng`. The band options update to match the selected language.
- **Sorting** — click the Band or Song Title header to sort; click again to flip direction. Comparison is locale-aware (`Intl.Collator`, base sensitivity) with a secondary sort on the other column.
- **Random song** — picks from the currently filtered list and remembers what it already showed (in `localStorage`) so it doesn't repeat until the pool runs out.
- **Sharing** — share the app or an individual song via the Web Share API, with a copy-to-clipboard fallback.
- **Notes** — songs with notes show an info icon with a Tippy.js tooltip.
- **Installable** — PWA manifest plus a minimal service worker, so it can be installed to a home screen or desktop.

## Getting started

There is no build step and no dependencies to install — it's plain ES modules, HTML, and CSS. But a local server is required: ES modules don't load over `file://`, and the app detects localhost to decide where to get its data.

```bash
# Python
python -m http.server 8000

# or Node
npx serve
```

Then open http://localhost:8000.

On `localhost` (or `127.0.0.1`) the app loads sample songs from [test-songs-data.js](js/test-songs-data.js) instead of calling the live API, so you can develop offline. Edit that file to try different scenarios — it already includes a few edge cases like an absurdly long band name and an accented title. Anywhere else, songs come from a Google Apps Script endpoint (see [api.js](js/api.js)).

## Project structure

```
index.html            Markup and CDN dependencies; boots the app via initApp()
manifest.json         PWA manifest
serviceWorker.js      Pass-through service worker (exists to make the app installable)
css/style.css         All styles
js/
  api.js              Data fetching (live API, or test data on localhost)
  event-handlers.js   Entry point: initApp(), event wiring, sorting, debounced search
  dom-utils.js        DOM references, rendering, filtering helpers, share button
  band-combobox.js    Searchable band filter with keyboard navigation
  random-song.js      Random picker and its localStorage bookkeeping
  test-songs-data.js  Sample data used during local development
```

Each song looks like this:

```javascript
{
  title: 'Song01',
  band: 'Band1',
  language: 'English',
  url: 'https://example.com/song1',  // chords/tabs
  notes: 'Optional; shown in a tooltip'
}
```

## External dependencies

Loaded from CDNs with pinned versions and SRI hashes:

- [Font Awesome](https://fontawesome.com/) 7.0.1 — icons
- [Tippy.js](https://atomiks.github.io/tippyjs/) 6 + Popper.js — note tooltips
- Google Fonts (Playfair Display, Inter)
- Google Tag Manager — analytics

When bumping a version, recompute the integrity hash:

```bash
curl -sL <url> | openssl dgst -sha384 -binary | openssl base64 -A
```

## Deployment

Deployed straight from the repository to GitHub Pages — no build, so pushing the files is the deploy.
