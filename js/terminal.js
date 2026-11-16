// Terminal in Fun Stuff
const input = document.getElementById("commandInput");
const output = document.getElementById("output");
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
// Options for the commands in fake FS.
const FS = {
    type: "dir",
    children: {
        home: {
            type: "dir",
            children: {
                arch2kx: {
                    type: "dir",
                    children: {
                        "about.txt": {
                            type: "file",
                            content: "arch2kx — dev & 3d artist.\nsee /about on the site.",
                        },
                        Projects: {
                            type: "dir",
                            children: {
                                "arch2kx-site": {
                                    type: "dir",
                                    children: {
                                        "README.md": {
                                            type: "file",
                                            content: "# arch2kx-site\npersonal site — you're looking at it.",
                                        },
                                    },
                                },
                                dotfiles: {
                                    type: "dir",
                                    children: {
                                        "README.md": {
                                            type: "file",
                                            content: "# dotfiles\nniri, waybar, kitty, zsh configs.",
                                        },
                                    },
                                },
                            },
                        },
                        Downloads: {
                            type: "dir",
                            children: {
                                "nixos-26.05-x86_64-linux.iso": {
                                    type: "file",
                                    content: "gzip compressed data — why are you cat-ing an iso?",
                                },
                            },
                        },
                        Music: {
                            type: "dir",
                            children: {
                                blue_archive_ost: {
                                    type: "dir",
                                    children: {
                                        "unwelcome_school.flac": {
                                            type: "file",
                                            content: "[FLAC audio — 5:32]",
                                        },
                                        "usagi_flap.flac": {
                                            type: "file",
                                            content: "[FLAC audio — 2:06]",
                                        },
                                        "constant_moderato.flac": {
                                            type: "file",
                                            content: "[FLAC audio — 4:11]",
                                        },
                                        "luminous_memory.flac": {
                                            type: "file",
                                            content: "[FLAC audio — 6:20]",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
const HOME = ["home", "arch2kx"];
let cwd = ["home", "arch2kx"];
function getNode(path) {
    let node = FS;
    for (const seg of path) {
        if (node.type !== "dir")
            return null;
        const child = node.children[seg];
        if (child === undefined)
            return null;
        node = child;
    }
    return node;
}
function resolvePath(target) {
    if (target === "~")
        return [...HOME];
    const base = target.startsWith("/") ? [] : [...cwd];
    for (const seg of target.split("/")) {
        if (seg === "" || seg === ".")
            continue;
        if (seg === "..") {
            base.pop();
        }
        else
            base.push(seg);
    }
    return base;
}
function displayCwd() {
    const joined = cwd.join("/");
    const home = HOME.join("/");
    if (joined === home)
        return "~";
    if (joined.startsWith(home + "/"))
        return "~/" + joined.slice(home.length + 1);
    return "/" + joined;
}
function promptHtml() {
    return `<span class="c-arch">${escapeHtml(displayCwd())} %</span>`;
}
// ── Fastfetch (system) ────────────────────────────────────────
function fastfetchOutput() {
    const info = [
        `<span class="c-arch">arch2k2x</span><span class="c-val">@</span><span class="c-arch">xps-15-7590</span>`,
        `<span class="c-dim">-------------------</span>`,
        `<b class="c-cyan">OS:</b> <span class="c-val">NixOS 26.05 (Yarara) x86_64</span>`,
        `<b class="c-cyan">Host:</b> <span class="c-val">XPS 15 7590</span>`,
        `<b class="c-cyan">Kernel:</b> <span class="c-val">Linux 6.18.57</span>`,
        `<b class="c-cyan">Uptime:</b> <span class="c-val">3 days, 1 hour, 58 mins</span>`,
        `<b class="c-cyan">Packages:</b> <span class="c-val">23 (flatpak), 2401 (nix-system), 738 (nix-user)</span>`,
        `<b class="c-cyan">Shell:</b> <span class="c-val">zsh 5.9.1</span>`,
        `<b class="c-cyan">WM:</b> <span class="c-val">niri 26.04 (Wayland)</span>`,
        `<b class="c-cyan">Theme:</b> <span class="c-val">Adwaita-Dark [Qt], adw-gtk3-dark [GTK2/3]</span>`,
        `<b class="c-cyan">Icons:</b> <span class="c-val">Papirus-Dark [Qt], Papirus-Dark [GTK2/3/4]</span>`,
        `<b class="c-cyan">Terminal:</b> <span class="c-val">kitty 0.49.1</span>`,
        `<b class="c-cyan">CPU:</b> <span class="c-val">Intel(R) Core(TM) i7-9750H (12) @ 4.50 GHz</span>`,
        `<b class="c-cyan">GPU 1:</b> <span class="c-val">NVIDIA GeForce GTX 1650 Mobile / Max-Q [Discrete]</span>`,
        `<b class="c-cyan">GPU 2:</b> <span class="c-val">Intel UHD Graphics 630 @ 1.15 GHz [Integrated]</span>`,
        `<b class="c-cyan">Memory:</b> <span class="c-val">13.70 GiB / 30.98 GiB (<span class="c-options">44%</span>)</span>`,
    ];
    const normal = [
        "#15161e",
        "#f7768e",
        "#9ece6a",
        "#e0af68",
        "#7aa2f7",
        "#bb9af7",
        "#7dcfff",
        "#a9b1d6",
    ];
    const bright = [
        "#414868",
        "#ff899d",
        "#9fe044",
        "#faba4a",
        "#8db0ff",
        "#c7a9ff",
        "#a4daff",
        "#c0caf5",
    ];
    const row = (colors) => colors
        .map((c) => `<span class="swatch" style="background:${c}"></span>`)
        .join("");
    const indent = `<div style="flex:none; width:160px;"></div>`;
    return [
        `<img src="images/nixos-logo.webp" alt="" width="360" height="348" style="float:left; margin:0 1.6em 0.4em 0;">`,
        ...info.map((l) => `<div>${l}</div>`),
        `<div style="clear:left;"></div>`,
        `<div>&nbsp;</div>`,
        `<div style="display:flex; gap:15em;">${indent}<div>${row(normal)}</div></div>`,
        `<div style="display:flex; gap:15em;">${indent}<div>${row(bright)}</div></div>`,
    ].join("");
}
// ── Browser Neofetch ──────────────────────────────────────────
function bfetchOutput() {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    let bVer = "";
    if (ua.includes("Firefox/")) {
        browser = "Firefox";
        bVer = ua.match(/Firefox\/([\d.]+)/)?.[1] ?? "";
    }
    else if (ua.includes("Edg/")) {
        browser = "Edge";
        bVer = ua.match(/Edg\/([\d.]+)/)?.[1] ?? "";
    }
    else if (ua.includes("Chrome/")) {
        browser = "Chrome";
        bVer = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? "";
    }
    else if (ua.includes("Safari/")) {
        browser = "Safari";
        bVer = ua.match(/Version\/([\d.]+)/)?.[1] ?? "";
    }
    let os = "Unknown";
    if (ua.includes("Windows NT"))
        os = "Windows";
    else if (/iPhone|iPad/.test(ua))
        os = "iOS";
    else if (ua.includes("Android"))
        os = "Android";
    else if (ua.includes("Mac OS X"))
        os = "macOS";
    else if (ua.includes("Linux"))
        os = "Linux";
    let engine = "other";
    if (ua.includes("Firefox/") && !ua.includes("Seamonkey/"))
        engine = "gecko";
    else if (ua.includes("Chrome/") ||
        ua.includes("Chromium/") ||
        ua.includes("Edg/"))
        engine = "chromium";
    const nav = navigator;
    const mem = nav.deviceMemory;
    const cores = navigator.hardwareConcurrency;
    const lang = navigator.language;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const res = `${window.screen.width}x${window.screen.height}`;
    const vp = `${window.innerWidth}x${window.innerHeight}`;
    const depth = `${window.screen.colorDepth}bpp`;
    const info = [
        `<span class="c-arch">you</span><span class="c-val">@</span><span class="c-arch">browser</span>`,
        `<span class="c-dim">-----------</span>`,
        `<b class="c-arch">Browser:</b> <span class="c-val">${escapeHtml(browser)} ${escapeHtml(bVer)}</span>`,
        `<b class="c-arch">OS:</b> <span class="c-val">${escapeHtml(os)}</span>`,
        `<b class="c-arch">Resolution:</b> <span class="c-val">${res}</span>`,
        `<b class="c-arch">Viewport:</b> <span class="c-val">${vp}</span>`,
        `<b class="c-arch">CPU Cores:</b> <span class="c-val">${cores}</span>`,
        ...(mem !== undefined
            ? [
                `<b class="c-arch">RAM:</b> <span class="c-val">~${mem}GB (reported)</span>`,
            ]
            : []),
        `<b class="c-arch">Language:</b> <span class="c-val">${escapeHtml(lang)}</span>`,
        `<b class="c-arch">Timezone:</b> <span class="c-val">${escapeHtml(tz)}</span>`,
        `<b class="c-arch">Color:</b> <span class="c-val">${depth}</span>`,
        `<b class="c-arch">Online:</b> <span class="c-val">${navigator.onLine ? "yes" : "no"}</span>`,
    ];
    const logoSrc = engine === "chromium"
        ? "images/chrome-ascii.png"
        : engine === "gecko"
            ? "images/firefox-ascii.png"
            : "images/generic-browser.png";
    return [
        `<img src="${logoSrc}" alt="" width="360" height="348" style="float:left; margin:0 1.6em 0.4em 0;">`,
        ...info.map((l) => `<div>${l}</div>`),
        `<div style="clear:left;"></div>`,
    ].join("");
}
// ── Command History ───────────────────────────────────────────
const cmdHistory = [];
let historyIndex = -1;
const commands = {
    fastfetch: () => fastfetchOutput(),
    neofetch: () => fastfetchOutput(),
    bfetch: () => bfetchOutput(),
    whoami: () => "<div>arch (arch2kx)</div>",
    pwd: () => `<div>${escapeHtml(displayCwd())}</div>`,
    date: () => `<div>${new Date().toString()}</div>`,
    echo: (args) => `<div>${escapeHtml(args.join(" "))}</div>`,
    ls: (args) => {
        const showHidden = args.some((a) => a.startsWith("-") && a.includes("a"));
        const pathArg = args.find((a) => !a.startsWith("-"));
        const target = pathArg !== undefined ? resolvePath(pathArg) : [...cwd];
        const node = getNode(target);
        if (node === null)
            return `<div><span class="c-err">ls: cannot access '${escapeHtml(pathArg ?? "")}': No such file or directory</span></div>`;
        if (node.type === "file") {
            const name = target[target.length - 1] ?? "";
            return `<div><span class="c-val">${escapeHtml(name)}</span></div>`;
        }
        const entries = Object.entries(node.children).filter(([name]) => showHidden || !name.startsWith("."));
        if (entries.length === 0)
            return "";
        return entries
            .map(([name, child]) => `<div>${child.type === "dir"
            ? `<span class="c-arch">${escapeHtml(name)}</span>`
            : `<span class="c-val">${escapeHtml(name)}</span>`}</div>`)
            .join("");
    },
    cd: (args) => {
        const raw = args[0];
        const target = raw === undefined || raw === "~" ? [...HOME] : resolvePath(raw);
        const node = getNode(target);
        if (node === null)
            return `<div><span class="c-err">cd: no such file or directory: ${escapeHtml(raw ?? "")}</span></div>`;
        if (node.type === "file")
            return `<div><span class="c-err">cd: not a directory: ${escapeHtml(raw ?? "")}</span></div>`;
        cwd = target;
        return "";
    },
    cat: (args) => {
        const raw = args[0];
        if (raw === undefined)
            return '<div><span class="c-err">cat: missing operand</span></div>';
        const target = resolvePath(raw);
        const node = getNode(target);
        if (node === null)
            return `<div><span class="c-err">cat: ${escapeHtml(raw)}: No such file or directory</span></div>`;
        if (node.type === "dir")
            return `<div><span class="c-err">cat: ${escapeHtml(raw)}: Is a directory</span></div>`;
        return node.content
            .split("\n")
            .map((l) => `<div>${escapeHtml(l)}</div>`)
            .join("");
    },
    uname: (args) => {
        if (args.includes("-a"))
            return "<div>Linux xps-15-7590 6.18.57 #1-NixOS SMP PREEMPT_DYNAMIC x86_64 GNU/Linux</div>";
        return "<div>Linux</div>";
    },
    uptime: () => {
        const d = new Date();
        const h = d.getHours().toString().padStart(2, "0");
        const m = d.getMinutes().toString().padStart(2, "0");
        return `<div> ${h}:${m}  up 3 days, 14:22,  1 user,  load average: 0.42, 0.61, 0.55</div>`;
    },
    ps: (args) => {
        if (args.includes("aux")) {
            return [
                "<div>USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND</div>",
                "<div>root           1  0.0  0.0  21208  1340 ?        Ss   10:01   0:01 /sbin/init</div>",
                "<div>root         847  0.0  0.1 654432  4200 ?        Ssl  10:01   0:00 NetworkManager</div>",
                "<div>arch2kx     1203  2.3  1.8 821044 74824 ?        Sl   10:01   2:11 niri</div>",
                "<div>arch2kx     1289  0.3  0.6 204800 23104 ?        Sl   10:01   0:03 waybar</div>",
                "<div>arch2kx     2041  0.0  0.1  12340  4096 pts/0    Ss   10:03   0:00 zsh</div>",
                "<div>arch2kx     3817  0.1  0.4 142648 16384 pts/0    Sl   10:15   0:00 emacs .</div>",
                "<div>arch2kx     4096  0.0  0.0  10032  1024 pts/0    R+   now     0:00 ps aux</div>",
            ].join("");
        }
        return [
            "<div>  PID TTY          TIME CMD</div>",
            "<div> 2041 pts/0    00:00:00 zsh</div>",
            "<div> 4096 pts/0    00:00:00 ps</div>",
        ].join("");
    },
    df: () => [
        "<div>Filesystem      Size  Used Avail Use% Mounted on</div>",
        "<div>/dev/nvme0n1p2  477G   89G  364G  20% /</div>",
        "<div>tmpfs           7.8G  1.2M  7.8G   1% /tmp</div>",
        "<div>/dev/nvme0n1p1  511M   26M  486M   6% /boot</div>",
    ].join(""),
    free: () => [
        "<div>               total        used        free      shared  buff/cache   available</div>",
        "<div>Mem:           31777        5359        4218        1024       22199       25393</div>",
        "<div>Swap:           8191           0        8191</div>",
    ].join(""),
    history: () => {
        if (cmdHistory.length === 0)
            return "<div>(no history)</div>";
        return cmdHistory
            .map((c, i) => `<div>  ${String(i + 1).padStart(3)}  ${escapeHtml(c)}</div>`)
            .join("");
    },
    man: (args) => {
        const pages = {
            ls: "ls — list directory contents\n  Usage: ls [-a] [path]",
            cd: "cd — change directory\n  Usage: cd [path]",
            cat: "cat — concatenate and print files\n  Usage: cat <file>",
            pwd: "pwd — print working directory",
            echo: "echo — print text\n  Usage: echo [text...]",
            date: "date — display current date and time",
            uname: "uname — print system info\n  Usage: uname [-a]",
            uptime: "uptime — show how long the system has been running",
            ps: "ps — list processes\n  Usage: ps [aux]",
            df: "df — report disk space usage",
            free: "free — display memory usage",
            history: "history — show command history",
            fastfetch: "fastfetch — display system info with ASCII art",
            neofetch: "neofetch — alias for fastfetch",
            bfetch: "bfetch — display YOUR browser info with ASCII art",
            whoami: "whoami — print current user",
            man: "man — display manual pages\n  Usage: man <command>",
        };
        const cmd = args[0];
        if (cmd === undefined)
            return '<div><span class="c-err">What manual page do you want?</span></div>';
        const page = pages[cmd];
        if (page === undefined)
            return `<div><span class="c-err">No manual entry for ${escapeHtml(cmd)}</span></div>`;
        return page
            .split("\n")
            .map((l) => `<div>${escapeHtml(l)}</div>`)
            .join("");
    },
    // Easter eggs
    sudo: (args) => {
        if (args[0] === "rm")
            return '<div><span class="c-err">zsh: permission denied: bro</span></div>';
        return '<div><span class="c-err">sudo: you wish</span></div>';
    },
    "nixos-rebuild": (args) => {
        if (args[0] === "switch") {
            return [
                "<div>building Nix...</div>",
                "<div>building the system configuration...</div>",
                "<div>activating the configuration...</div>",
                "<div>setting up /etc...</div>",
                "<div>reloading user units for arch2kx...</div>",
                "<div> already up to date</div>",
            ].join("");
        }
        return '<div><span class="c-err">usage: nixos-rebuild &lt;switch|boot|test|build&gt;</span></div>';
    },
    git: (args) => {
        if (args[0] === "push" && args.includes("--force"))
            return '<div><span class="c-err">rejected: not on my watch.</span></div>';
        if (args[0] === "log") {
            return [
                '<div><span class="c-arch">commit baceb2b</span> <span class="c-dim">(HEAD -&gt; main, origin/main)</span></div>',
                "<div>Author: arch2kx &lt;arch2k2x@gmail.com&gt;</div>",
                "<div>Date:   Wed Jul 2 2026</div>",
                "<div></div>",
                "<div>    feat: add guest book archive page</div>",
            ].join("");
        }
        return '<div><span class="c-err">git: not a git repository (this is a browser)</span></div>';
    },
    exit: () => "<div>logout — (you can't leave)</div>",
    sensei: () => "<div>yes? — (I play too much Blue Archive)</div>",
    help: () => [
        "<div>Available commands:</div>",
        '<div>  <span class="c-arch">fastfetch</span>  <span class="c-arch">bfetch</span>  whoami  pwd  date  echo</div>',
        "<div>  ls  cd  cat  uname  uptime  ps  df  free</div>",
        "<div>  history  man  clear</div>",
        '<div>  <span class="c-dim">(and maybe a few secrets...)</span></div>',
    ].join(""),
};
// ── Output ────────────────────────────────────────────────────
const PRINT_DELAY_MS = 18;
function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
// Splits a run of sibling `<div>...</div>` blocks into one string per
// top-level block, so multi-line output can be printed line by line
// without breaking apart any HTML nested inside a block.
function splitTopLevelChunks(html) {
    const chunks = [];
    let depth = 0;
    let start = 0;
    let i = 0;
    while (i < html.length) {
        if (html.startsWith("<div", i)) {
            depth++;
            i += 4;
            continue;
        }
        if (html.startsWith("</div>", i)) {
            depth--;
            i += 6;
            if (depth === 0) {
                chunks.push(html.slice(start, i));
                start = i;
            }
            continue;
        }
        i++;
    }
    if (start < html.length)
        chunks.push(html.slice(start));
    return chunks.length > 0 ? chunks : [html];
}
let printQueue = [];
let printDraining = false;
let printTimer;
function drainPrintQueue() {
    if (printDraining)
        return;
    printDraining = true;
    const step = () => {
        const chunk = printQueue.shift();
        if (chunk === undefined) {
            printDraining = false;
            return;
        }
        output.innerHTML += chunk;
        output.scrollTop = output.scrollHeight;
        printTimer = window.setTimeout(step, PRINT_DELAY_MS);
    };
    step();
}
function resetPrintQueue() {
    printQueue = [];
    printDraining = false;
    if (printTimer !== undefined) {
        window.clearTimeout(printTimer);
        printTimer = undefined;
    }
}
function appendOutput(html) {
    if (html === "")
        return;
    const chunks = splitTopLevelChunks(html);
    if (chunks.length <= 1 || prefersReducedMotion()) {
        output.innerHTML += html;
        output.scrollTop = output.scrollHeight;
        return;
    }
    printQueue.push(...chunks);
    drainPrintQueue();
}
function handleCommand(raw) {
    const cmd = raw.trim();
    if (cmd === "")
        return;
    cmdHistory.push(cmd);
    appendOutput(`<div class="cmd-line">${promptHtml()} ${escapeHtml(cmd)}</div>`);
    if (cmd === ":(){ :|:& };:") {
        appendOutput('<div><span class="c-err">bash: nah.</span></div>');
        return;
    }
    if (cmd === "rm -rf ~" || cmd === "rm -rf ~/") {
        appendOutput('<div><span class="c-err">rm: nice try</span></div>');
        return;
    }
    if (cmd === "clear") {
        resetPrintQueue();
        output.innerHTML = "";
        return;
    }
    const parts = cmd.split(/\s+/);
    const name = parts[0];
    if (name === undefined)
        return;
    const args = parts.slice(1);
    const fn = commands[name];
    if (fn !== undefined) {
        const result = fn(args);
        if (result !== "")
            appendOutput(result);
    }
    else {
        appendOutput(`<div><span class="c-err">zsh: command not found: ${escapeHtml(name)}</span></div>`);
    }
}
// ── Event Listeners ───────────────────────────────────────────
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const value = input.value;
        input.value = "";
        historyIndex = -1;
        handleCommand(value);
        return;
    }
    if (e.key === "ArrowUp") {
        e.preventDefault();
        if (historyIndex < cmdHistory.length - 1) {
            historyIndex++;
            input.value = cmdHistory[cmdHistory.length - 1 - historyIndex] ?? "";
        }
        return;
    }
    if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            input.value = cmdHistory[cmdHistory.length - 1 - historyIndex] ?? "";
        }
        else if (historyIndex === 0) {
            historyIndex = -1;
            input.value = "";
        }
    }
});
document.querySelector(".terminal")?.addEventListener("click", () => {
    input.focus();
});
appendOutput(fastfetchOutput());
export {};
//# sourceMappingURL=terminal.js.map