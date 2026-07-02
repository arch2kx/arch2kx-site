// Guest Book in Fun Stuff
const FIREBASE_PROJECT_ID = 'arch2kx-site';
const FIREBASE_API_KEY = 'AIzaSyAJcYTcy5GVJkXnP8jZIdcq_fioNN481ug';
const PAGE_SIZE = 10;
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const form = document.getElementById('guestbook-form');
const nameInput = document.getElementById('guestbook-name');
const msgInput = document.getElementById('guestbook-message');
const honeypot = document.getElementById('guestbook-honeypot');
const submitBtn = document.getElementById('guestbook-submit');
const statusEl = document.getElementById('guestbook-status');
const nameCount = document.getElementById('guestbook-name-count');
const msgCount = document.getElementById('guestbook-msg-count');
const entriesEl = document.getElementById('guestbook-entries');
const loadMoreBtn = document.getElementById('guestbook-load-more');
const funStuff = document.getElementById('fun-stuff');
let nextPageToken = null;
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function formatDate(iso) {
    return new Date(iso).toISOString().slice(0, 10);
}
function makeEntryHTML(e) {
    return `<div class="guestbook-entry">
    <span class="guestbook-entry-name">${escapeHtml(e.name)}</span>
    <p class="guestbook-entry-msg">${escapeHtml(e.message)}</p>
    <span class="guestbook-entry-date">${formatDate(e.created_at)}</span>
  </div>`;
}
function renderEntries(entries) {
    if (entries.length === 0) {
        entriesEl.innerHTML = '<p class="guestbook-empty">No entries yet — be the first!</p>';
        return;
    }
    entriesEl.innerHTML = entries.map(makeEntryHTML).join('');
}
function appendEntries(entries) {
    for (const e of entries) {
        entriesEl.insertAdjacentHTML('beforeend', makeEntryHTML(e));
    }
}
function prependEntry(entry) {
    const emptyEl = entriesEl.querySelector('.guestbook-empty');
    if (emptyEl !== null)
        entriesEl.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'guestbook-entry';
    div.innerHTML = `<span class="guestbook-entry-name">${escapeHtml(entry.name)}</span>
    <p class="guestbook-entry-msg">${escapeHtml(entry.message)}</p>
    <span class="guestbook-entry-date">${formatDate(entry.created_at)}</span>`;
    entriesEl.insertBefore(div, entriesEl.firstChild);
}
function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.className = kind === '' ? 'guestbook-status' : `guestbook-status guestbook-status-${kind}`;
}
async function fetchPage(token) {
    let url = `${FIRESTORE_BASE}/guestbook?orderBy=created_at+desc&pageSize=${PAGE_SIZE}&key=${FIREBASE_API_KEY}`;
    if (token !== null) {
        url += `&pageToken=${encodeURIComponent(token)}`;
    }
    const res = await fetch(url);
    if (!res.ok)
        throw new Error(`HTTP ${res.status}`);
    const data = (await res.json());
    const entries = (data.documents ?? []).map(doc => ({
        name: doc.fields.name.stringValue,
        message: doc.fields.message.stringValue,
        created_at: doc.fields.created_at.timestampValue,
    }));
    return { entries, nextToken: data.nextPageToken ?? null };
}
async function loadEntries() {
    try {
        const { entries, nextToken } = await fetchPage(null);
        renderEntries(entries);
        nextPageToken = nextToken;
        loadMoreBtn.hidden = nextToken === null;
    }
    catch {
        entriesEl.innerHTML = '<p class="guestbook-error">Couldn\'t load entries. Try refreshing.</p>';
    }
}
loadMoreBtn.addEventListener('click', () => {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';
    void (async () => {
        try {
            const { entries, nextToken } = await fetchPage(nextPageToken);
            appendEntries(entries);
            nextPageToken = nextToken;
            if (nextToken === null)
                loadMoreBtn.hidden = true;
        }
        finally {
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Load more';
        }
    })();
});
// Character counts
nameInput.addEventListener('input', () => {
    nameCount.textContent = `${nameInput.value.length} / 50`;
});
msgInput.addEventListener('input', () => {
    msgCount.textContent = `${msgInput.value.length} / 280`;
});
// Form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const message = msgInput.value.trim();
    // Honeypot: bot filled the hidden field — silently succeed without inserting
    if (honeypot.value !== '') {
        form.reset();
        nameCount.textContent = '0 / 50';
        msgCount.textContent = '0 / 280';
        setStatus('Signed!', 'ok');
        setTimeout(() => { setStatus('', ''); }, 3000);
        return;
    }
    submitBtn.disabled = true;
    setStatus('', '');
    void (async () => {
        try {
            const now = new Date().toISOString();
            const res = await fetch(`${FIRESTORE_BASE}/guestbook?key=${FIREBASE_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fields: {
                        name: { stringValue: name },
                        message: { stringValue: message },
                        created_at: { timestampValue: now },
                    },
                }),
            });
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            prependEntry({ name, message, created_at: now });
            form.reset();
            nameCount.textContent = '0 / 50';
            msgCount.textContent = '0 / 280';
            setStatus('Signed!', 'ok');
            setTimeout(() => { setStatus('', ''); }, 3000);
        }
        catch {
            setStatus('Something went wrong. Try again.', 'err');
        }
        finally {
            submitBtn.disabled = false;
        }
    })();
});
// Lazy-load entries when Fun Stuff page becomes active
let entriesLoaded = false;
const observer = new MutationObserver(() => {
    if (funStuff.classList.contains('active') && !entriesLoaded) {
        entriesLoaded = true;
        void loadEntries();
    }
});
observer.observe(funStuff, { attributes: true, attributeFilter: ['class'] });
export {};
//# sourceMappingURL=guestbook.js.map