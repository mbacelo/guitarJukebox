# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Overview

Guitar Jukebox is a Progressive Web App (PWA) for managing and displaying a curated list of guitar songs. The app fetches song data from a Google Apps Script API and provides filtering, sorting, and random song selection features.

## Architecture

### Module Structure

The codebase follows an ES6 module pattern with three core JavaScript modules:

- **api.js**: Data fetching layer
  - Fetches songs from Google Apps Script API in production
  - Uses test data from `test-songs-data.js` when running on localhost
  - API URL: `https://script.google.com/macros/s/AKfycbyYOOuMhFxVgppb_ZmnsB4MgbVfDuxR0WMdKfoN-BbFD1cHSFq75mupaP6yz9PXHspc/exec`

- **dom-utils.js**: DOM manipulation and UI updates
  - Exports the `DOM` object containing all DOM element references
  - Handles song list rendering, filtering logic, and random song selection
  - Manages tooltips via Tippy.js for song notes
  - Implements accent-insensitive search using Unicode normalization

- **event-handlers.js**: Application initialization and event management
  - Entry point via `initApp()` function
  - Registers service worker for PWA functionality
  - Sets up event listeners for filters, search, sorting, and random song selection
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
- Caches static resources (HTML, CSS, JS) for offline access
- Cache-first strategy for GET requests only
- POST requests bypass caching (important for API calls)
- Cache version: `guitar-jukebox-site-v1.0`

## Development

### Local Development

The app automatically detects localhost and uses test data from `test-songs-data.js` instead of making API calls. Simply open `index.html` in a browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

### Testing with Mock Data

To test with different scenarios, modify `test-songs-data.js`. The test data includes edge cases like long band names and special characters.

### Service Worker Updates

When updating cached resources:
1. Update the `CACHE_NAME` version in `serviceWorker.js`
2. Update the `resourcesToPrecache` array if files change
3. The activate event will automatically clean up old caches

### Important Implementation Notes

- **POST Request Handling**: The service worker explicitly skips caching for non-GET requests (serviceWorker.js:21-23). This prevents caching of POST requests to the Google Apps Script API.

- **Unicode Normalization**: The search uses NFD normalization and removes diacritics (dom-utils.js:114) to enable accent-insensitive matching.

- **LocalStorage Usage**: The random song feature stores returned song URLs in localStorage under the key `returnedSongsUrls`.

- **Filter Dependencies**: The language filter change triggers both band filter update and song filtering (event-handlers.js:54-57). This ensures band options are always relevant to the selected language.

## External Dependencies

- **Font Awesome 6.6.0**: Icons (guitar icon, info tooltips)
- **Tippy.js 6**: Tooltip functionality for song notes
- **Google Tag Manager**: Analytics (ID: GTM-NHZZZX6T)
- **Popper.js**: Tooltip positioning (Tippy.js dependency)

## Deployment

The app is deployed to GitHub Pages:
- Production URL: `https://mbacelo.github.io/guitarJukebox`
- PWA manifest configured for standalone display mode
- Icons available in multiple sizes (32x32 to 512x512) in `images/icons/`
