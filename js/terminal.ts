// Terminal in Fun Stuff

const input = document.getElementById('commandInput') as HTMLInputElement;
const output = document.getElementById('output') as HTMLElement;
const funStuff = document.getElementById('fun-stuff') as HTMLElement;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Fake Filesystem ───────────────────────────────────────────

type FSFile = { type: 'file'; content: string };
type FSDir  = { type: 'dir';  children: Record<string, FSNode> };
type FSNode = FSFile | FSDir;

const FS: FSDir = { type: 'dir', children: {
  home: { type: 'dir', children: {
    arch2kx: { type: 'dir', children: {
      'about.txt':   { type: 'file', content: 'arch2kx — dev & gamer.\nsee /about on the site.' },
      '.bashrc':     { type: 'file', content: '# .bashrc\nalias ls="ls --color=auto"\nalias grep="grep --color=auto"\nexport EDITOR=nvim\n# neofetch' },
      '.config': { type: 'dir', children: {
        hypr: { type: 'dir', children: {
          'hyprland.conf': { type: 'file', content: '# Hyprland config\nmonitor=,preferred,auto,1\nexec-once = waybar\nexec-once = hyprpaper\n# ... (300 more lines)' },
        }},
      }},
      projects: { type: 'dir', children: {
        'arch2kx-site': { type: 'dir', children: {
          'README.md': { type: 'file', content: '# arch2kx-site\npersonal site — you\'re looking at it.' },
        }},
        dotfiles: { type: 'dir', children: {
          'README.md': { type: 'file', content: '# dotfiles\nsway, waybar, emacs, zsh configs.' },
        }},
      }},
      downloads: { type: 'dir', children: {
        'archlinux-2026.07.01-x86_64.iso': { type: 'file', content: 'gzip compressed data — why are you cat-ing an iso?' },
      }},
      music: { type: 'dir', children: {
        blue_archive_ost: { type: 'dir', children: {
          'unwelcome_school.flac':  { type: 'file', content: '[FLAC audio — 5:32]' },
          'usagi_flap.flac':        { type: 'file', content: '[FLAC audio — 2:06]' },
          'constant_moderato.flac': { type: 'file', content: '[FLAC audio — 4:11]' },
          'luminous_memory.flac':   { type: 'file', content: '[FLAC audio — 6:20]' },
        }},
      }},
    }},
  }},
}};

const HOME = ['home', 'arch2kx'];
let cwd: string[] = ['home', 'arch2kx'];

function getNode(path: string[]): FSNode | null {
  let node: FSNode = FS;
  for (const seg of path) {
    if (node.type !== 'dir') return null;
    const child: FSNode | undefined = node.children[seg];
    if (child === undefined) return null;
    node = child;
  }
  return node;
}

function resolvePath(target: string): string[] {
  if (target === '~') return [...HOME];
  const base = target.startsWith('/') ? [] : [...cwd];
  for (const seg of target.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') { base.pop(); }
    else base.push(seg);
  }
  return base;
}

function displayCwd(): string {
  const joined = cwd.join('/');
  const home   = HOME.join('/');
  if (joined === home)               return '~';
  if (joined.startsWith(home + '/')) return '~/' + joined.slice(home.length + 1);
  return '/' + joined;
}

function promptHtml(): string {
  return `<span class="c-arch">${escapeHtml(displayCwd())} %</span>`;
}

// ── Neofetch (system) ─────────────────────────────────────────

function neofetchOutput(): string {
  const logo: string[] = [
    '                   -`',
    '                  .o+`',
    '                 `ooo/',
    '                `+oooo:',
    '               `+oooooo:',
    '               -+oooooo+:',
    '             `/:-:++oooo+:',
    '            `/++++/+++++++:',
    '           `/++++++++++++++:',
    '          `/+++ooooooooooooo/`',
    '         ./ooosssso++osssssso+`',
    '        .oossssso-````/ossssss+`',
    '       -osssssso.      :ssssssso.',
    '      :osssssss/        osssso+++.',
    '     /ossssssss/        +ssssooo/-',
    '   `/ossssso+/:-        -:/+osssso+-',
    '  `+sso+:-`                 `.-/+oso:',
    ' `++:.                           `-/+/',
    '.`                                 `/',
  ];

  const info: string[] = [
    `<span class="c-arch">arch2kx</span><span class="c-dim">@</span><span class="c-arch">archlinux</span>`,
    `<span class="c-dim">-------------------</span>`,
    `<b class="c-arch">OS:</b> <span class="c-val">Arch Linux x86_64</span>`,
    `<b class="c-arch">Host:</b> <span class="c-val">Dell Inc. OVYV0G</span>`,
    `<b class="c-arch">Kernel:</b> <span class="c-val">7.0.10-zen1-1-zen</span>`,
    `<b class="c-arch">Uptime:</b> <span class="c-val">3 days, 14 hours</span>`,
    `<b class="c-arch">Shell:</b> <span class="c-val">zsh 5.9</span>`,
    `<b class="c-arch">DE:</b> <span class="c-val">Plasma 6.7.0 (Wayland)</span>`,
    `<b class="c-arch">WM:</b> <span class="c-val">KWin (Wayland)</span>`,
    `<b class="c-arch">WM Theme:</b> <span class="c-val">Breeze</span>`,
    `<b class="c-arch">CPU:</b> <span class="c-val">Intel i7-9750H (12) @ 4.500GHz</span>`,
    `<b class="c-arch">GPU:</b> <span class="c-val">NVIDIA GeForce GTX 1650 Mobile / Max-Q</span>`,
    `<b class="c-arch">GPU:</b> <span class="c-val">Intel CoffeeLake-H GT2 [UHD Graphics 630]</span>`,
    `<b class="c-arch">Memory:</b> <span class="c-val">5359MiB / 31777MiB</span>`,
  ];

  const LOGO_WIDTH = 42;
  const lines: string[] = [];
  const total = Math.max(logo.length, info.length);
  for (let i = 0; i < total; i++) {
    const logoLine = (logo[i] ?? '').padEnd(LOGO_WIDTH);
    const infoLine = info[i] ?? '';
    lines.push(`<div><span class="c-arch-reg">${logoLine}</span>  ${infoLine}</div>`);
  }

  const normal = ['#1c1c1c','#d94133','#1dd35f','#d3b81d','#1081d6','#5133d9','#10b3d6','#d6d6d6'];
  const bright = ['#555753','#d94133','#1dd35f','#d3b81d','#1081d6','#5133d9','#10b3d6','#f6f6f6'];
  const pad = ''.padEnd(LOGO_WIDTH + 2);
  const row = (colors: string[]) => colors.map(c => `<span class="swatch" style="background:${c}"></span>`).join('');
  lines.push(`<div>${pad}${row(normal)}</div>`);
  lines.push(`<div>${pad}${row(bright)}</div>`);

  return lines.join('');
}

// ── Browser Neofetch ──────────────────────────────────────────

function bneofetchOutput(): string {
  const ua = navigator.userAgent;

  let browser = 'Unknown'; let bVer = '';
  if (ua.includes('Firefox/'))      { browser = 'Firefox'; bVer = ua.match(/Firefox\/([\d.]+)/)?.[1]  ?? ''; }
  else if (ua.includes('Edg/'))     { browser = 'Edge';    bVer = ua.match(/Edg\/([\d.]+)/)?.[1]      ?? ''; }
  else if (ua.includes('Chrome/'))  { browser = 'Chrome';  bVer = ua.match(/Chrome\/([\d.]+)/)?.[1]   ?? ''; }
  else if (ua.includes('Safari/'))  { browser = 'Safari';  bVer = ua.match(/Version\/([\d.]+)/)?.[1]  ?? ''; }

  let os = 'Unknown';
  if (ua.includes('Windows NT'))    os = 'Windows';
  else if (/iPhone|iPad/.test(ua))  os = 'iOS';
  else if (ua.includes('Android'))  os = 'Android';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Linux'))    os = 'Linux';

  const nav   = navigator as Navigator & { deviceMemory?: number };
  const mem   = nav.deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const lang  = navigator.language;
  const tz    = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const res   = `${window.screen.width}x${window.screen.height}`;
  const vp    = `${window.innerWidth}x${window.innerHeight}`;
  const depth = `${window.screen.colorDepth}bpp`;

  const logo: string[] = [
    ' .------------. ',
    ' | o o o |###| ',
    ' |------------| ',
    ' |            | ',
    ' |  you are   | ',
    ' |    here    | ',
    ' |            | ',
    ' `------------` ',
  ];

  const info: string[] = [
    `<span class="c-arch">you</span><span class="c-dim">@</span><span class="c-arch">browser</span>`,
    `<span class="c-dim">-----------</span>`,
    `<b class="c-arch">Browser:</b> <span class="c-val">${escapeHtml(browser)} ${escapeHtml(bVer)}</span>`,
    `<b class="c-arch">OS:</b> <span class="c-val">${escapeHtml(os)}</span>`,
    `<b class="c-arch">Resolution:</b> <span class="c-val">${res}</span>`,
    `<b class="c-arch">Viewport:</b> <span class="c-val">${vp}</span>`,
    `<b class="c-arch">CPU Cores:</b> <span class="c-val">${cores}</span>`,
    ...(mem !== undefined ? [`<b class="c-arch">RAM:</b> <span class="c-val">~${mem}GB (reported)</span>`] : []),
    `<b class="c-arch">Language:</b> <span class="c-val">${escapeHtml(lang)}</span>`,
    `<b class="c-arch">Timezone:</b> <span class="c-val">${escapeHtml(tz)}</span>`,
    `<b class="c-arch">Color:</b> <span class="c-val">${depth}</span>`,
    `<b class="c-arch">Online:</b> <span class="c-val">${navigator.onLine ? 'yes' : 'no'}</span>`,
  ];

  const LOGO_WIDTH = 18;
  const total = Math.max(logo.length, info.length);
  const lines: string[] = [];
  for (let i = 0; i < total; i++) {
    const logoLine = (logo[i] ?? '').padEnd(LOGO_WIDTH);
    const infoLine = info[i] ?? '';
    lines.push(`<div><span class="c-arch-reg">${logoLine}</span>  ${infoLine}</div>`);
  }
  return lines.join('');
}

// ── Command History ───────────────────────────────────────────

const cmdHistory: string[] = [];
let historyIndex = -1;

// ── Commands ──────────────────────────────────────────────────

type CmdFn = (args: string[]) => string;

const commands: Record<string, CmdFn> = {
  neofetch:  () => neofetchOutput(),
  bneofetch: () => bneofetchOutput(),

  whoami: () => '<div>arch (arch2kx)</div>',
  pwd:    () => `<div>${escapeHtml(displayCwd())}</div>`,
  date:   () => `<div>${new Date().toString()}</div>`,
  echo:   (args) => `<div>${escapeHtml(args.join(' '))}</div>`,

  ls: (args) => {
    const showHidden = args.some(a => a.startsWith('-') && a.includes('a'));
    const pathArg    = args.find(a => !a.startsWith('-'));
    const target     = pathArg !== undefined ? resolvePath(pathArg) : [...cwd];
    const node       = getNode(target);
    if (node === null)
      return `<div><span class="c-err">ls: cannot access '${escapeHtml(pathArg ?? '')}': No such file or directory</span></div>`;
    if (node.type === 'file') {
      const name = target[target.length - 1] ?? '';
      return `<div><span class="c-val">${escapeHtml(name)}</span></div>`;
    }
    const entries = Object.entries(node.children)
      .filter(([name]) => showHidden || !name.startsWith('.'));
    if (entries.length === 0) return '';
    return entries.map(([name, child]) =>
      `<div>${child.type === 'dir'
        ? `<span class="c-arch">${escapeHtml(name)}</span>`
        : `<span class="c-val">${escapeHtml(name)}</span>`
      }</div>`
    ).join('');
  },

  cd: (args) => {
    const raw    = args[0];
    const target = (raw === undefined || raw === '~') ? [...HOME] : resolvePath(raw);
    const node   = getNode(target);
    if (node === null)       return `<div><span class="c-err">cd: no such file or directory: ${escapeHtml(raw ?? '')}</span></div>`;
    if (node.type === 'file') return `<div><span class="c-err">cd: not a directory: ${escapeHtml(raw ?? '')}</span></div>`;
    cwd = target;
    return '';
  },

  cat: (args) => {
    const raw = args[0];
    if (raw === undefined) return '<div><span class="c-err">cat: missing operand</span></div>';
    const target = resolvePath(raw);
    const node   = getNode(target);
    if (node === null)        return `<div><span class="c-err">cat: ${escapeHtml(raw)}: No such file or directory</span></div>`;
    if (node.type === 'dir')  return `<div><span class="c-err">cat: ${escapeHtml(raw)}: Is a directory</span></div>`;
    return node.content.split('\n').map(l => `<div>${escapeHtml(l)}</div>`).join('');
  },

  uname: (args) => {
    if (args.includes('-a'))
      return '<div>Linux archlinux 7.0.10-zen1-1-zen #1 ZEN SMP PREEMPT_DYNAMIC x86_64 GNU/Linux</div>';
    return '<div>Linux</div>';
  },

  uptime: () => {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `<div> ${h}:${m}  up 3 days, 14:22,  1 user,  load average: 0.42, 0.61, 0.55</div>`;
  },

  ps: (args) => {
    if (args.includes('aux')) {
      return [
        '<div>USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND</div>',
        '<div>root           1  0.0  0.0  21208  1340 ?        Ss   10:01   0:01 /sbin/init</div>',
        '<div>root         847  0.0  0.1 654432  4200 ?        Ssl  10:01   0:00 NetworkManager</div>',
        '<div>arch2kx     1203  2.3  1.8 821044 74824 ?        Sl   10:01   2:11 Hyprland</div>',
        '<div>arch2kx     1289  0.3  0.6 204800 23104 ?        Sl   10:01   0:03 waybar</div>',
        '<div>arch2kx     2041  0.0  0.1  12340  4096 pts/0    Ss   10:03   0:00 zsh</div>',
        '<div>arch2kx     3817  0.1  0.4 142648 16384 pts/0    Sl   10:15   0:00 nvim .</div>',
        '<div>arch2kx     4096  0.0  0.0  10032  1024 pts/0    R+   now     0:00 ps aux</div>',
      ].join('');
    }
    return [
      '<div>  PID TTY          TIME CMD</div>',
      '<div> 2041 pts/0    00:00:00 zsh</div>',
      '<div> 4096 pts/0    00:00:00 ps</div>',
    ].join('');
  },

  df: () => [
    '<div>Filesystem      Size  Used Avail Use% Mounted on</div>',
    '<div>/dev/nvme0n1p2  477G   89G  364G  20% /</div>',
    '<div>tmpfs           7.8G  1.2M  7.8G   1% /tmp</div>',
    '<div>/dev/nvme0n1p1  511M   26M  486M   6% /boot</div>',
  ].join(''),

  free: () => [
    '<div>               total        used        free      shared  buff/cache   available</div>',
    '<div>Mem:           31777        5359        4218        1024       22199       25393</div>',
    '<div>Swap:           8191           0        8191</div>',
  ].join(''),

  history: () => {
    if (cmdHistory.length === 0) return '<div>(no history)</div>';
    return cmdHistory.map((c, i) =>
      `<div>  ${String(i + 1).padStart(3)}  ${escapeHtml(c)}</div>`
    ).join('');
  },

  man: (args) => {
    const pages: Record<string, string> = {
      ls:        'ls — list directory contents\n  Usage: ls [-a] [path]',
      cd:        'cd — change directory\n  Usage: cd [path]',
      cat:       'cat — concatenate and print files\n  Usage: cat <file>',
      pwd:       'pwd — print working directory',
      echo:      'echo — print text\n  Usage: echo [text...]',
      date:      'date — display current date and time',
      uname:     'uname — print system info\n  Usage: uname [-a]',
      uptime:    'uptime — show how long the system has been running',
      ps:        'ps — list processes\n  Usage: ps [aux]',
      df:        'df — report disk space usage',
      free:      'free — display memory usage',
      history:   'history — show command history',
      neofetch:  'neofetch — display system info with ASCII art',
      bneofetch: 'bneofetch — display YOUR browser info with ASCII art',
      whoami:    'whoami — print current user',
      man:       'man — display manual pages\n  Usage: man <command>',
    };
    const cmd  = args[0];
    if (cmd === undefined) return '<div><span class="c-err">What manual page do you want?</span></div>';
    const page = pages[cmd];
    if (page === undefined) return `<div><span class="c-err">No manual entry for ${escapeHtml(cmd)}</span></div>`;
    return page.split('\n').map(l => `<div>${escapeHtml(l)}</div>`).join('');
  },

  // Easter eggs
  sudo: (args) => {
    if (args[0] === 'rm') return '<div><span class="c-err">zsh: permission denied: bro</span></div>';
    return '<div><span class="c-err">sudo: you wish</span></div>';
  },

  pacman: (args) => {
    if (args[0] === '-Syu' || args[0] === '-Syuu') {
      return [
        '<div>:: Synchronizing package databases...</div>',
        '<div> core        153.8 KiB  1.2 MiB/s 00:00</div>',
        '<div> extra         8.4 MiB  5.1 MiB/s 00:01</div>',
        '<div>:: Starting full system upgrade...</div>',
        '<div> there is nothing to do</div>',
      ].join('');
    }
    return '<div><span class="c-err">usage: pacman &lt;operation&gt; [...]</span></div>';
  },

  git: (args) => {
    if (args[0] === 'push' && args.includes('--force'))
      return '<div><span class="c-err">rejected: not on my watch.</span></div>';
    if (args[0] === 'log') {
      return [
        '<div><span class="c-arch">commit baceb2b</span> <span class="c-dim">(HEAD -&gt; main, origin/main)</span></div>',
        '<div>Author: arch2kx &lt;arch2k2x@gmail.com&gt;</div>',
        '<div>Date:   Wed Jul 2 2026</div>',
        '<div></div>',
        '<div>    feat: add guest book archive page</div>',
      ].join('');
    }
    return '<div><span class="c-err">git: not a git repository (this is a browser)</span></div>';
  },

  exit:   () => '<div>logout — (you can\'t leave)</div>',
  sensei: () => '<div>yes? — (I play too much Blue Archive)</div>',

  help: () => [
    '<div>Available commands:</div>',
    '<div>  <span class="c-arch">neofetch</span>  <span class="c-arch">bneofetch</span>  whoami  pwd  date  echo</div>',
    '<div>  ls  cd  cat  uname  uptime  ps  df  free</div>',
    '<div>  history  man  clear</div>',
    '<div>  <span class="c-dim">(and maybe a few secrets...)</span></div>',
  ].join(''),
};

// ── Output ────────────────────────────────────────────────────

function appendOutput(html: string): void {
  output.innerHTML += html;
  output.scrollTop = output.scrollHeight;
}

function handleCommand(raw: string): void {
  const cmd = raw.trim();
  if (cmd === '') return;

  cmdHistory.push(cmd);

  appendOutput(`<div>${promptHtml()} ${escapeHtml(cmd)}</div>`);

  if (cmd === ':(){ :|:& };:') {
    appendOutput('<div><span class="c-err">bash: nah.</span></div>');
    return;
  }
  if (cmd === 'rm -rf ~' || cmd === 'rm -rf ~/') {
    appendOutput('<div><span class="c-err">rm: nice try</span></div>');
    return;
  }
  if (cmd === 'clear') {
    output.innerHTML = '';
    return;
  }

  const parts = cmd.split(/\s+/);
  const name  = parts[0];
  if (name === undefined) return;
  const args = parts.slice(1);

  const fn = commands[name];
  if (fn !== undefined) {
    const result = fn(args);
    if (result !== '') appendOutput(result);
  } else {
    appendOutput(`<div><span class="c-err">zsh: command not found: ${escapeHtml(name)}</span></div>`);
  }
}

// ── Event Listeners ───────────────────────────────────────────

input.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    const value = input.value;
    input.value  = '';
    historyIndex = -1;
    handleCommand(value);
    return;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex < cmdHistory.length - 1) {
      historyIndex++;
      input.value = cmdHistory[cmdHistory.length - 1 - historyIndex] ?? '';
    }
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      input.value = cmdHistory[cmdHistory.length - 1 - historyIndex] ?? '';
    } else if (historyIndex === 0) {
      historyIndex = -1;
      input.value  = '';
    }
  }
});

document.querySelector('.terminal')?.addEventListener('click', () => {
  input.focus();
});

const observer = new MutationObserver(() => {
  if (funStuff.classList.contains('active')) input.focus();
});
observer.observe(funStuff, { attributes: true, attributeFilter: ['class'] });

appendOutput(neofetchOutput());
