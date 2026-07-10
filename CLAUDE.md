# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Overview

Guitar Jukebox is a Progressive Web App (PWA) for managing and displaying a curated list of guitar songs. The app fetches song data from a Google Apps Script API and provides filtering, sorting, and random song selection features.

## Architecture

### Module Structure

The codebase follows an ES6 module pattern. The HTML loads `event-handlers.js` and calls `initApp()`; the rest of the modules are pulled in via the import graph.

- **api.js**: Data fetching layer
  - Fetches songs from Google Apps Script API in production
  - On localhost, dynamically imports `test-songs-data.js` (test data is not shipped in production loads)
  - API URL: `https://script.google.com/macros/s/AKfycbyYOOuMhFxVgppb_ZmnsB4MgbVfDuxR0WMdKfoN-BbFD1cHSFq75mupaP6yz9PXHspc/exec`

- **dom-utils.js**: Rendering + shared filter/render helpers
  - Exports the `DOM` object containing all DOM element references
  - Song list rendering, empty state, language filter, share button factory
  - `getFilteredSongs` / `filterSongs` (reads filter values, returns filtered songs)
  - `normalizeString` (NFD + diacritic strip) for accent-insensitive search
  - `initializeTooltip` wraps Tippy.js setup

- **band-combobox.js**: The searchable band-filter combobox
  - Self-contained component with its own keyboard nav and option list
  - Exposes `initBandCombobox`, `setBandFilterValue`, `getBandFilterValue`, `setBandOptions`, `setOnBandFilterChange`

- **random-song.js**: Random song picker
  - Renders the random-song card
  - Tracks shown songs in localStorage (key: `returnedSongsUrls`) to avoid repetition

- **event-handlers.js**: Application initialization and event management
  - Entry point via `initApp()` function
  - Registers service worker for PWA functionality
  - Wires up filter, search, sort, and random-song event listeners
  - Implements sorting with Intl.Collator for locale-aware comparisons
  - Uses debouncing (300ms) for the title search input

### Data Flow

1. `initApp()` in event-handlers.js initializes the app
2. `fetchSongs()` from api.js retrieves song data
3. `updateSongList()` from dom-utils.js renders the initial list
4. `populateFilterOptions()` fills language and band filter dropdowns
5. User interactions trigger filtering/sorting which update the display

### Song Data Model

Each song object has the following structure:
```javascript
{
  title: string,      // Song title
  band: string,       // Band/artist name
  language: string,   // Song language
  url: string,        // Link to chords/tabs
  notes?: string      // Optional notes (shown in tooltip)
}
```

### Key Features

**Filtering System**:
- Language filter updates band filter options dynamically
- Band filter shows only bands that have songs in the selected language
- Title search is accent-insensitive (e.g., "song" matches "sóng")
- Filters work together to narrow down the song list

**Random Song Selection**:
- Tracks returned songs in localStorage to avoid repetition
- Resets when all songs have been shown
- Works with filtered song lists
- If all filtered songs have been shown, allows re-showing from filtered set

**Sorting**:
- Sortable by band or title (click column headers)
- Toggle between ascending/descending
- Uses locale-aware collation with base sensitivity
- Secondary sort by alternate column when primary values match

**Service Worker**:
- Minimal pass-through service worker (no caching of its own)
- Exists solely to make the app installable as a PWA
- All fetches go to the network; the browser's HTTP cache handles caching

## Development

### Local Development

The app automatically detects localhost and uses test data from `test-songs-data.js` instead of making API calls. A local server is required (ES modules and the localhost detection don't work over `file://`):

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

### Testing with Mock Data

To test with different scenarios, modify `test-songs-data.js`. The test data includes edge cases like long band names and special characters.

### Important Implementation Notes

- **Unicode Normalization**: The search uses NFD normalization and removes diacritics (`normalizeString` in `dom-utils.js`) to enable accent-insensitive matching.

- **LocalStorage Usage**: The random song feature stores returned song URLs in localStorage under the key `returnedSongsUrls` (see `random-song.js`).

- **Filter Dependencies**: The language filter change triggers both band filter update and song filtering. This ensures band options are always relevant to the selected language.

## External Dependencies

- **Font Awesome 7.0.1**: Icons (guitar icon, info tooltips)
- **Tippy.js 6**: Tooltip functionality for song notes
- **Google Tag Manager**: Analytics (ID: GTM-NHZZZX6T)
- **Popper.js**: Tooltip positioning (Tippy.js dependency)

CDN `<link>`/`<script>` tags use pinned versions with SRI (`integrity` + `crossorigin`) attributes. When bumping a version, recompute the hash: `curl -sL <url> | openssl dgst -sha384 -binary | openssl base64 -A`.

## Deployment

The app is deployed to GitHub Pages:
- Production URL: `https://mbacelo.github.io/guitarJukebox`
- PWA manifest configured for standalone display mode
- Icons available in multiple sizes (32x32 to 512x512) in `images/icons/`
