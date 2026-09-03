// Guest Book in Fun Stuff

const SUPABASE_URL = 'https://dgtypqowdxsmqbygzmnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRndHlwcW93ZHhzbXFieWd6bW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MzA4MjksImV4cCI6MjEwNDAwNjgyOX0.TgEaXVseuCC_rIhf4bxWyGRrnhEt9h4OcO6cmud2Bvo';

const REST_BASE = `${SUPABASE_URL}/rest/v1/guestbook`;
const REST_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

interface GuestbookEntry {
  name: string;
  message: string;
  created_at: string;
  tz_offset: number;
}

const form = document.getElementById('guestbook-form') as HTMLFormElement;
const nameInput = document.getElementById('guestbook-name') as HTMLInputElement;
const msgInput = document.getElementById('guestbook-message') as HTMLTextAreaElement;
const honeypot = document.getElementById('guestbook-honeypot') as HTMLInputElement;
const submitBtn = document.getElementById('guestbook-submit') as HTMLButtonElement;
const statusEl = document.getElementById('guestbook-status') as HTMLElement;
const nameCount = document.getElementById('guestbook-name-count') as HTMLElement;
const msgCount = document.getElementById('guestbook-msg-count') as HTMLElement;
const entriesEl = document.getElementById('guestbook-entries') as HTMLElement;
const archiveEl = document.getElementById('guestbook-archive-entries') as HTMLElement;
const funStuff = document.getElementById('fun-stuff') as HTMLElement;
const archivePage = document.getElementById('guestbook') as HTMLElement;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function formatTime(iso: string, offsetMinutes: number): string {
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

function makeEntryHTML(e: GuestbookEntry): string {
  return `<div class="guestbook-entry">
    <span class="guestbook-entry-name">${escapeHtml(e.name)}</span>
    <p class="guestbook-entry-msg">${escapeHtml(e.message)}</p>
    <span class="guestbook-entry-date">${formatDate(e.created_at)} ${formatTime(e.created_at, e.tz_offset)}</span>
  </div>`;
}

function renderEntries(entries: GuestbookEntry[]): void {
  if (entries.length === 0) {
    entriesEl.innerHTML = '<p class="guestbook-empty">No entries yet — be the first!</p>';
    return;
  }
  entriesEl.innerHTML = entries.map(makeEntryHTML).join('');
}

function prependEntry(entry: GuestbookEntry): void {
  const emptyEl = entriesEl.querySelector('.guestbook-empty');
  if (emptyEl !== null) entriesEl.innerHTML = '';

  const div = document.createElement('div');
  div.className = 'guestbook-entry';
  div.innerHTML = `<span class="guestbook-entry-name">${escapeHtml(entry.name)}</span>
    <p class="guestbook-entry-msg">${escapeHtml(entry.message)}</p>
    <span class="guestbook-entry-date">${formatDate(entry.created_at)} @ ${formatTime(entry.created_at, entry.tz_offset)}</span>`;
  entriesEl.insertBefore(div, entriesEl.firstChild);
}

function setStatus(text: string, kind: 'ok' | 'err' | ''): void {
  statusEl.textContent = text;
  statusEl.className = kind === '' ? 'guestbook-status' : `guestbook-status guestbook-status-${kind}`;
}

async function loadEntries(): Promise<void> {
  try {
    const res = await fetch(
      `${REST_BASE}?select=name,message,created_at,tz_offset&order=created_at.desc&limit=5`,
      { headers: REST_HEADERS }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const entries = (await res.json()) as GuestbookEntry[];
    renderEntries(entries);
  } catch {
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
form.addEventListener('submit', (e: Event): void => {
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

  submitBtn.disabled = true;
  setStatus('', '');

  void (async () => {
    try {
      const now = new Date().toISOString();
      const offsetMinutes = -new Date().getTimezoneOffset();

      const res = await fetch(REST_BASE, {
        method: 'POST',
        headers: {
          ...REST_HEADERS,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          name,
          message,
          created_at: now,
          tz_offset: offsetMinutes,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      prependEntry({ name, message, created_at: now, tz_offset: offsetMinutes });

      form.reset();
      nameCount.textContent = '0 / 50';
      msgCount.textContent = '0 / 280';
      setStatus('Signed!', 'ok');
      setTimeout(() => { setStatus('', ''); }, 3000);
    } catch {
      setStatus('Something went wrong. Try again.', 'err');
    } finally {
      submitBtn.disabled = false;
    }
  })();
});

async function loadArchive(): Promise<void> {
  const all: GuestbookEntry[] = [];
  const pageSize = 200;
  let offset = 0;

  try {
    for (;;) {
      const res = await fetch(
        `${REST_BASE}?select=name,message,created_at,tz_offset&order=created_at.desc&offset=${offset}&limit=${pageSize}`,
        { headers: REST_HEADERS }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const page = (await res.json()) as GuestbookEntry[];
      all.push(...page);
      if (page.length < pageSize) break;
      offset += pageSize;
    }

    if (all.length === 0) {
      archiveEl.innerHTML = '<p class="guestbook-empty">No entries yet — be the first!</p>';
    } else {
      archiveEl.innerHTML = all.map(makeEntryHTML).join('');
    }
  } catch {
    archiveEl.innerHTML = '<p class="guestbook-error">Couldn\'t load entries. Try refreshing.</p>';
  }
}

// Lazy-load entries when Fun Stuff page becomes active
let entriesLoaded = false;
const observer = new MutationObserver(() => {
  if (funStuff.classList.contains('active') && !entriesLoaded) {
    entriesLoaded = true;
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
