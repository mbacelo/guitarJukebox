import { DOM, normalizeString } from './dom-utils.js';

let bandOptions = [];
let highlightedIndex = -1;
let onChange = null;

export function setOnBandFilterChange(handler) {
    onChange = handler;
}

export function getBandFilterValue() {
    return DOM.filters.bandInput.dataset.value || '';
}

export function setBandFilterValue(value) {
    DOM.filters.bandInput.dataset.value = value;
    DOM.filters.bandInput.value = value || 'All';
    DOM.filters.band.classList.toggle('has-value', !!value);
}

export function setBandOptions(bands) {
    bandOptions = bands;
}

export function initBandCombobox() {
    const input = DOM.filters.bandInput;
    const list = DOM.filters.bandList;
    const clear = DOM.filters.bandClear;
    const container = DOM.filters.band;

    const open = () => {
        const query = getBandFilterValue() ? input.value : '';
        renderList(query);
        list.hidden = false;
        input.setAttribute('aria-expanded', 'true');
        container.classList.add('is-open');
    };

    const close = () => {
        list.hidden = true;
        input.setAttribute('aria-expanded', 'false');
        container.classList.remove('is-open', 'is-typing');
        highlightedIndex = -1;
        input.value = getBandFilterValue() || 'All';
    };

    const commit = (value) => {
        setBandFilterValue(value);
        close();
        if (typeof onChange === 'function') onChange();
    };

    input.addEventListener('focus', () => { open(); input.select(); });
    input.addEventListener('click', () => { open(); input.select(); });

    input.addEventListener('input', () => {
        list.hidden = false;
        input.setAttribute('aria-expanded', 'true');
        container.classList.add('is-open');
        container.classList.toggle('is-typing', input.value.length > 0);
        highlightedIndex = -1;
        renderList(input.value);
    });

    input.addEventListener('keydown', (event) => {
        const visible = !list.hidden;
        const items = list.querySelectorAll('.combobox-option');
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!visible) { open(); return; }
            highlightedIndex = Math.min(items.length - 1, highlightedIndex + 1);
            updateHighlight(items);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!visible) { open(); return; }
            highlightedIndex = Math.max(0, highlightedIndex - 1);
            updateHighlight(items);
        } else if (event.key === 'Enter') {
            if (!visible) return;
            event.preventDefault();
            if (highlightedIndex >= 0 && items[highlightedIndex]) {
                commit(items[highlightedIndex].dataset.value);
            }
        } else if (event.key === 'Escape' && visible) {
            event.preventDefault();
            close();
        }
    });

    clear.addEventListener('click', (event) => {
        event.preventDefault();
        commit('');
        input.focus();
    });

    list.addEventListener('mousedown', (event) => {
        const option = event.target.closest('.combobox-option');
        if (!option) return;
        event.preventDefault();
        commit(option.dataset.value);
    });

    document.addEventListener('click', (event) => {
        if (!container.contains(event.target)) close();
    });
}

function updateHighlight(items) {
    items.forEach((item, index) => {
        item.classList.toggle('is-highlighted', index === highlightedIndex);
        if (index === highlightedIndex) {
            item.scrollIntoView({ block: 'nearest' });
        }
    });
}

function renderList(query) {
    const list = DOM.filters.bandList;
    const normalizedQuery = normalizeString(query);
    const matches = bandOptions.filter(band => normalizeString(band).includes(normalizedQuery));

    list.innerHTML = '';
    const fragment = document.createDocumentFragment();

    const allOption = document.createElement('li');
    allOption.className = 'combobox-option combobox-option--all';
    allOption.dataset.value = '';
    allOption.setAttribute('role', 'option');
    allOption.textContent = 'All';
    fragment.appendChild(allOption);

    if (matches.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'combobox-empty';
        empty.textContent = 'No matches';
        fragment.appendChild(empty);
    } else {
        matches.forEach(band => {
            const option = document.createElement('li');
            option.className = 'combobox-option';
            option.dataset.value = band;
            option.setAttribute('role', 'option');
            option.textContent = band;
            fragment.appendChild(option);
        });
    }

    list.appendChild(fragment);
}
