// Guest Book in Fun Stuff

const FIREBASE_PROJECT_ID = 'arch2kx-site';
const FIREBASE_API_KEY = 'AIzaSyAJcYTcy5GVJkXnP8jZIdcq_fioNN481ug';

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

interface GuestbookEntry {
  name: string;
  message: string;
  created_at: string;
}

interface FirestoreDoc {
  fields: {
    name: { stringValue: string };
    message: { stringValue: string };
    created_at: { timestampValue: string };
  };
}

interface FirestoreListResponse {
  documents?: FirestoreDoc[];
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
const funStuff = document.getElementById('fun-stuff') as HTMLElement;

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

function makeEntryHTML(e: GuestbookEntry): string {
  return `<div class="guestbook-entry">
    <span class="guestbook-entry-name">${escapeHtml(e.name)}</span>
    <p class="guestbook-entry-msg">${escapeHtml(e.message)}</p>
    <span class="guestbook-entry-date">${formatDate(e.created_at)}</span>
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
    <span class="guestbook-entry-date">${formatDate(entry.created_at)}</span>`;
  entriesEl.insertBefore(div, entriesEl.firstChild);
}

function setStatus(text: string, kind: 'ok' | 'err' | ''): void {
  statusEl.textContent = text;
  statusEl.className = kind === '' ? 'guestbook-status' : `guestbook-status guestbook-status-${kind}`;
}

async function loadEntries(): Promise<void> {
  try {
    const res = await fetch(
      `${FIRESTORE_BASE}/guestbook?orderBy=created_at+desc&pageSize=200&key=${FIREBASE_API_KEY}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as FirestoreListResponse;
    const entries: GuestbookEntry[] = (data.documents ?? []).map(doc => ({
      name: doc.fields.name.stringValue,
      message: doc.fields.message.stringValue,
      created_at: doc.fields.created_at.timestampValue,
    }));
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
      const res = await fetch(
        `${FIRESTORE_BASE}/guestbook?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              name: { stringValue: name },
              message: { stringValue: message },
              created_at: { timestampValue: now },
            },
          }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      prependEntry({ name, message, created_at: now });

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

// Lazy-load entries when Fun Stuff page becomes active
let entriesLoaded = false;
const observer = new MutationObserver(() => {
  if (funStuff.classList.contains('active') && !entriesLoaded) {
    entriesLoaded = true;
    void loadEntries();
  }
});
observer.observe(funStuff, { attributes: true, attributeFilter: ['class'] });
