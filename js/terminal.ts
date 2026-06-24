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

  // Edit these values to match your real system info
  const info: string[] = [
    `<span class="c-arch">arch2kx</span><span class="c-dim">@</span><span class="c-arch">archlinux</span>`,
    `<span class="c-dim">-------------------</span>`,
    `<b class="c-arch">OS:</b> <span class="c-val">Arch Linux x86_64</span>`,
    `<b class="c-arch">Host:</b> <span class="c-val">Dell Inc. OVYV0G</span>`,
    `<b class="c-arch">Kernel:</b> <span class="c-val">7.0.10-zen1-1-zen</span>`,
    `<b class="c-arch">Uptime:</b> <span class="c-val">2 mins</span>`,
    `<b class="c-arch">Shell:</b> <span class="c-val">zsh 5.9</span>`,
    `<b class="c-arch">DE:</b> <span class="c-val">Plasma 6.6.5 \(Wayland\)</span>`,
    `<b class="c-arch">WM:</b> <span class="c-val">KWin \(Wayland\)</span>`,
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
    lines.push(
      `<div><span class="c-arch-reg">${logoLine}</span>  ${infoLine}</div>`
    );
  }

  const normal  = ['#1c1c1c','#d94133','#1dd35f','#d3b81d','#1081d6','#5133d9','#10b3d6','#d6d6d6'];
  const bright  = ['#555753','#d94133','#1dd35f','#d3b81d','#1081d6','#5133d9','#10b3d6','#f6f6f6'];
  const pad = ''.padEnd(LOGO_WIDTH + 2);
  const row = (colors: string[]) => colors.map(c => `<span class="swatch" style="background:${c}"></span>`).join('');
  lines.push(`<div>${pad}${row(normal)}</div>`);
  lines.push(`<div>${pad}${row(bright)}</div>`);

  return lines.join('');
}

const commands: Record<string, () => string> = {
  neofetch: () => neofetchOutput(),

  whoami: () => '<div>arch (arch2kx)</div>',

  help: () =>
    '<div>Available commands: <span class="c-arch">neofetch</span>, ' +
    '<span class="c-options">whoami</span>, ' +
    '<span class="c-options">help</span>, <span class="c-options">clear</span></div>',

  clear: () => '',
};

function appendOutput(html: string): void {
  output.innerHTML += html;
  output.scrollTop = output.scrollHeight;
}

function handleCommand(raw: string): void {
  const cmd = raw.trim();
  if (cmd === '') return;

  appendOutput(
    `<div><span class="c-arch">arch2kx@archlinux ~ %</span> ${escapeHtml(cmd)}</div>`
  );

  if (cmd === 'clear') {
    output.innerHTML = '';
    return;
  }

  if (cmd === 'sudo rm -rf /') {
    appendOutput('<div><span class="c-err">zsh: permission denied: bro</span></div>');
    return;
  }

  const fn = commands[cmd];
  if (fn !== undefined) {
    appendOutput(fn());
  } else {
    appendOutput(
      `<div><span class="c-err">zsh: command not found: ${escapeHtml(cmd)}</span></div>`
    );
  }
}

input.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key !== 'Enter') return;
  const value = input.value;
  input.value = '';
  handleCommand(value);
});

document.querySelector('.terminal')?.addEventListener('click', () => {
  input.focus();
});

// Focus input when Fun Stuff page becomes active
const observer = new MutationObserver(() => {
  if (funStuff.classList.contains('active')) {
    input.focus();
  }
});
observer.observe(funStuff, { attributes: true, attributeFilter: ['class'] });

// Auto-run neofetch on load
appendOutput(neofetchOutput());
