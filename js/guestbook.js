// Guest Book in Fun Stuff
const SUPABASE_URL = 'https://dgtypqowdxsmqbygzmnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRndHlwcW93ZHhzbXFieWd6bW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MzA4MjksImV4cCI6MjEwNDAwNjgyOX0.TgEaXVseuCC_rIhf4bxWyGRrnhEt9h4OcO6cmud2Bvo';
const HCAPTCHA_SITEKEY = '10000000-ffff-ffff-ffff-000000000001';
const REST_BASE = `${SUPABASE_URL}/rest/v1/guestbook`;
const SIGN_URL = `${SUPABASE_URL}/functions/v1/guestbook-sign`;
const REST_HEADERS = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};
const form = document.getElementById('guestbook-form');
const nameInput = document.getElementById('guestbook-name');
const msgInput = document.getElementById('guestbook-message');
const honeypot = document.getElementById('guestbook-honeypot');
const submitBtn = document.getElementById('guestbook-submit');
const statusEl = document.getElementById('guestbook-status');
const nameCount = document.getElementById('guestbook-name-count');
const msgCount = document.getElementById('guestbook-msg-count');
const entriesEl = document.getElementById('guestbook-entries');
const archiveEl = document.getElementById('guestbook-archive-entries');
const captchaEl = document.getElementById('guestbook-captcha');
const funStuff = document.getElementById('fun-stuff');
const archivePage = document.getElementById('guestbook');
function formatDate(iso) {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}
function formatTime(iso, offsetMinutes) {
    if (!Number.isInteger(offsetMinutes) || Math.abs(offsetMinutes) > 900)
        offsetMinutes = 0;
    const utcDate = new Date(iso);
    const shifted = new Date(utcDate.getTime() + offsetMinutes * 60000);
    const hh = String(shifted.getUTCHours()).padStart(2, '0');
    const mm = String(shifted.getUTCMinutes()).padStart(2, '0');
    const ss = String(shifted.getUTCSeconds()).padStart(2, '0');
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMinutes);
    const offHours = Math.floor(abs / 60);
    const offMins = abs % 60;
    const offsetStr = offMins === 0
        ? `UTC${sign}${offHours}`
        : `UTC${sign}${offHours}:${String(offMins).padStart(2, '0')}`;
    return `${hh}:${mm}:${ss} ${offsetStr}`;
}
function makeEntryEl(e, sep) {
    const div = document.createElement('div');
    div.className = 'guestbook-entry';
    const nameEl = document.createElement('span');
    nameEl.className = 'guestbook-entry-name';
    nameEl.textContent = String(e.name);
    const msgEl = document.createElement('p');
    msgEl.className = 'guestbook-entry-msg';
    msgEl.textContent = String(e.message);
    const dateEl = document.createElement('span');
    dateEl.className = 'guestbook-entry-date';
    dateEl.textContent = `${formatDate(e.created_at)} ${sep}${formatTime(e.created_at, e.tz_offset)}`;
    div.append(nameEl, msgEl, dateEl);
    return div;
}
function setMessage(el, className, text) {
    const p = document.createElement('p');
    p.className = className;
    p.textContent = text;
    el.replaceChildren(p);
}
function renderList(el, entries) {
    if (entries.length === 0) {
        setMessage(el, 'guestbook-empty', 'No entries yet — be the first!');
        return;
    }
    el.replaceChildren(...entries.map(e => makeEntryEl(e, '')));
}
function prependEntry(entry) {
    const emptyEl = entriesEl.querySelector('.guestbook-empty');
    if (emptyEl !== null)
        entriesEl.replaceChildren();
    entriesEl.insertBefore(makeEntryEl(entry, '@ '), entriesEl.firstChild);
}
let captchaWidgetId = null;
function loadCaptcha() {
    window.onGuestbookCaptchaLoad = () => {
        if (window.hcaptcha === undefined)
            return;
        captchaWidgetId = window.hcaptcha.render(captchaEl, {
            sitekey: HCAPTCHA_SITEKEY,
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        });
    };
    const script = document.createElement('script');
    script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit&onload=onGuestbookCaptchaLoad';
    script.async = true;
    document.head.appendChild(script);
}
function resetCaptcha() {
    if (window.hcaptcha !== undefined && captchaWidgetId !== null)
        window.hcaptcha.reset(captchaWidgetId);
}
function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.className = kind === '' ? 'guestbook-status' : `guestbook-status guestbook-status-${kind}`;
}
async function loadEntries() {
    try {
        const res = await fetch(`${REST_BASE}?select=name,message,created_at,tz_offset&order=created_at.desc&limit=5`, { headers: REST_HEADERS });
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const entries = (await res.json());
        renderList(entriesEl, entries);
    }
    catch {
        setMessage(entriesEl, 'guestbook-error', 'Couldn\'t load entries. Try refreshing.');
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
    if (honeypot.value !== '') {
        form.reset();
        nameCount.textContent = '0 / 50';
        msgCount.textContent = '0 / 280';
        setStatus('Signed!', 'ok');
        setTimeout(() => { setStatus('', ''); }, 3000);
        return;
    }
    const captcha = window.hcaptcha !== undefined && captchaWidgetId !== null
        ? window.hcaptcha.getResponse(captchaWidgetId)
        : '';
    if (captcha === '') {
        setStatus('Please complete the captcha.', 'err');
        return;
    }
    submitBtn.disabled = true;
    setStatus('', '');
    void (async () => {
        try {
            const offsetMinutes = -new Date().getTimezoneOffset();
            const res = await fetch(SIGN_URL, {
                method: 'POST',
                headers: {
                    ...REST_HEADERS,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    message,
                    tz_offset: offsetMinutes,
                    captcha,
                }),
            });
            if (res.status === 429) {
                setStatus('The guest book is busy. Try again in a minute.', 'err');
                return;
            }
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            const saved = (await res.json());
            prependEntry({
                name,
                message,
                created_at: saved.created_at ?? new Date().toISOString(),
                tz_offset: offsetMinutes,
            });
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
            resetCaptcha();
            submitBtn.disabled = false;
        }
    })();
});
async function loadArchive() {
    const all = [];
    const pageSize = 200;
    let offset = 0;
    try {
        for (;;) {
            const res = await fetch(`${REST_BASE}?select=name,message,created_at,tz_offset&order=created_at.desc&offset=${offset}&limit=${pageSize}`, { headers: REST_HEADERS });
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            const page = (await res.json());
            all.push(...page);
            if (page.length < pageSize)
                break;
            offset += pageSize;
        }
        renderList(archiveEl, all);
    }
    catch {
        setMessage(archiveEl, 'guestbook-error', 'Couldn\'t load entries. Try refreshing.');
    }
}
// Lazy-load entries when Fun Stuff page becomes active
let entriesLoaded = false;
const observer = new MutationObserver(() => {
    if (funStuff.classList.contains('active') && !entriesLoaded) {
        entriesLoaded = true;
        loadCaptcha();
        void loadEntries();
    }
});
observer.observe(funStuff, { attributes: true, attributeFilter: ['class'] });
// Lazy-load all entries when archive page becomes active
let archiveLoaded = false;
const archiveObserver = new MutationObserver(() => {
    if (archivePage.classList.contains('active') && !archiveLoaded) {
        archiveLoaded = true;
        void loadArchive();
    }
});
archiveObserver.observe(archivePage, { attributes: true, attributeFilter: ['class'] });
export {};
//# sourceMappingURL=guestbook.js.map