// Guest Book in Fun Stuff
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
const form = document.getElementById('guestbook-form');
const nameInput = document.getElementById('guestbook-name');
const msgInput = document.getElementById('guestbook-message');
const honeypot = document.getElementById('guestbook-honeypot');
const submitBtn = document.getElementById('guestbook-submit');
const statusEl = document.getElementById('guestbook-status');
const nameCount = document.getElementById('guestbook-name-count');
const msgCount = document.getElementById('guestbook-msg-count');
const entriesEl = document.getElementById('guestbook-entries');
const funStuff = document.getElementById('fun-stuff');
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
function renderEntries(entries) {
    if (entries.length === 0) {
        entriesEl.innerHTML = '<p class="guestbook-empty">No entries yet — be the first!</p>';
        return;
    }
    entriesEl.innerHTML = entries
        .map(e => `<div class="guestbook-entry">
      <span class="guestbook-entry-name">${escapeHtml(e.name)}</span>
      <p class="guestbook-entry-msg">${escapeHtml(e.message)}</p>
      <span class="guestbook-entry-date">${formatDate(e.created_at)}</span>
    </div>`)
        .join('');
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
async function loadEntries() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/guestbook?select=name,message,created_at&order=created_at.desc`, {
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
        });
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const entries = (await res.json());
        renderEntries(entries);
    }
    catch {
        entriesEl.innerHTML = '<p class="guestbook-error">Couldn\'t load entries. Try refreshing.</p>';
    }
}
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
            const res = await fetch(`${SUPABASE_URL}/rest/v1/guestbook`, {
                method: 'POST',
                headers: {
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    Prefer: 'return=minimal',
                },
                body: JSON.stringify({ name, message }),
            });
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            prependEntry({ name, message, created_at: new Date().toISOString() });
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