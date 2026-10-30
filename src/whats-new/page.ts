/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the GPLv3 License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

export interface Release {
    version: string;
    date: string;
    changes: string[]; // trusted HTML written here, not user input
}

// newest first; add the new release on top when bumping the minor version
export const RELEASES: Release[] = [
    {
        version: "1.11.0", date: "Oct 30, 2026", changes: [
            "The extension is now called <b>Lemari</b>. Settings and commands moved from <code>easyManagerProjects.*</code> to <code>lemari.*</code>, so rename those keys in your <code>settings.json</code> and keybindings."
        ]
    },
    {
        version: "1.10.0", date: "Oct 27, 2026", changes: [
            "<b>Open a Project</b> shows each project on two lines, name on top and path below, and each group header shows how many projects it holds.",
            "Typing in the list matches the path too, for example <code>wsl.localhost</code> or <code>repos\\api</code>. Set <code>filterOnFullPath</code> to <code>false</code> to match names only.",
            "Projects whose folder no longer exists are marked in the list."
        ]
    },
    {
        version: "1.9.0", date: "Oct 27, 2026", changes: [
            "Saving a favorite now walks you through its name, tags and icon, so it is ready without editing it afterwards. Existing tags and the current icon are preselected when you update a project.",
            "<b>Add Git Base Folder</b> in the Git view title bar picks a folder in the system dialog and adds it to <code>git.baseFolders</code>."
        ]
    },
    {
        version: "1.8.0", date: "Oct 27, 2026", changes: [
            "<b>Add Folder to Favorites</b> opens your system's folder picker (File Explorer, Finder or the Linux file dialog), so you can save any folder without opening it first. Find it in the Favorites title bar or the Command Palette."
        ]
    },
    {
        version: "1.7.0", date: "Oct 27, 2026", changes: [
            "<b>Open a Project</b> (<kbd>Shift+Alt+P</kbd>) groups the list with headers: Favorites first, then Git, VSCode, Mercurial, SVN and Any. Set <code>groupList</code> to <code>false</code> for one mixed list.",
            "Favorites show their icon in the list, and the README was rewritten."
        ]
    },
    {
        version: "1.6.0", date: "Oct 27, 2026", changes: [
            "A new What's New page that lists the changes made in Lemari, with shortcuts to open a project, save one, and set your Git base folders."
        ]
    },
    {
        version: "1.5.0", date: "Oct 27, 2026", changes: [
            "Clicking a project in the Side Bar asks whether to open it in this window or a new one.",
            "Right-click a favorite and choose <b>Edit Path</b> to change where it points, without opening <code>projects.json</code>."
        ]
    },
    {
        version: "1.4.0", date: "Oct 27, 2026", changes: [
            "Give a favorite its own icon: use the icon button in <b>Save Project</b>, or right-click it and choose <b>Edit Icon</b>. The icon shows in the Side Bar and in the project list."
        ]
    },
    {
        version: "1.3.0", date: "Oct 27, 2026", changes: [
            "<b>Open in WSL</b> uses your default WSL distribution, so the <code>wsl.distro</code> setting is gone."
        ]
    },
    {
        version: "1.2.0", date: "Oct 27, 2026", changes: [
            "<kbd>Shift+Alt+P</kbd> asks whether to open the picked project in this window or a new one."
        ]
    },
    {
        version: "1.1.0", date: "Oct 27, 2026", changes: [
            "WSL base folders are detected out of the box: <code>wsl.localhost</code> is added to <code>security.allowedUNCHosts</code> for you."
        ]
    },
    {
        version: "1.0.0", date: "Oct 26, 2026", changes: [
            "Projects under <code>\\\\wsl.localhost</code> open as a WSL window instead of a slow network folder.",
            "<b>Open in WSL</b> and <b>Open in Windows</b> in the Side Bar context menu."
        ]
    }
];

// the page only reacts to minor and major updates, like the original What's New
export function isNewerMinor(current: string, previous: string | undefined): boolean {
    if (!previous) {
        return true;
    }
    const [ curMajor, curMinor ] = current.split(".").map(Number);
    const [ prevMajor, prevMinor ] = previous.split(".").map(Number);
    return curMajor > prevMajor || (curMajor === prevMajor && curMinor > prevMinor);
}

function commandLink(command: string, args?: unknown): string {
    return `command:${command}${args === undefined ? "" : "?" + encodeURIComponent(JSON.stringify(args))}`;
}

export const PAGE_COMMANDS = [ "lemari.listProjects", "lemari.saveProject", "workbench.action.openSettings" ];

export function buildWhatsNewHtml(cspSource: string, version: string): string {
    const [ latest, ...earlier ] = RELEASES;
    const list = (changes: string[]) => changes.map(c => `<li>${c}</li>`).join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>What's New in Lemari</title>
<style>
    :root {
        --fg: var(--vscode-foreground);
        --muted: var(--vscode-descriptionForeground);
        --rule: var(--vscode-widget-border, var(--vscode-panel-border, rgba(128, 128, 128, .35)));
        --accent: var(--vscode-textLink-foreground);
        --chip: var(--vscode-textCodeBlock-background, rgba(128, 128, 128, .15));
        --mono: var(--vscode-editor-font-family, monospace);
    }
    body {
        margin: 0;
        padding: 40px 32px 56px;
        background: var(--vscode-editor-background);
        color: var(--fg);
        font-family: var(--vscode-font-family);
        font-size: 14px;
        line-height: 1.55;
    }
    main { max-width: 680px; }
    h1 { font-size: 26px; font-weight: 600; letter-spacing: -.01em; margin: 0; }
    h2 { font-size: 17px; font-weight: 600; margin: 0 0 12px; }
    .tagline { color: var(--muted); margin: 6px 0 32px; font-size: 15px; }
    .version { color: var(--muted); font-weight: 400; margin-left: 10px; font-size: 15px; }
    code, kbd {
        font-family: var(--mono);
        font-size: .92em;
        background: var(--chip);
        border-radius: 3px;
        padding: 1px 5px;
    }
    kbd { border: 1px solid var(--rule); }
    a { color: var(--accent); }
    a:focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: 2px; }

    /* the one memorable element: a small sample of the grouped project list */
    .bridge {
        font-family: var(--mono);
        font-size: 15px;
        border-left: 2px solid var(--accent);
        padding: 2px 0 2px 18px;
        margin: 0 0 40px;
        display: grid;
        grid-template-columns: auto 1fr;
        column-gap: 16px;
        row-gap: 4px;
        align-items: baseline;
    }
    .bridge .side { color: var(--muted); font-family: var(--vscode-font-family); font-size: 12px; }
    .bridge .path { overflow-wrap: anywhere; }
    .bridge .link { grid-column: 2; color: var(--muted); font-family: var(--vscode-font-family); font-size: 12px; padding: 2px 0; }

    section { margin-bottom: 40px; }
    .latest ul { margin: 0; padding-left: 20px; }
    .latest li { margin-bottom: 8px; }

    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin: 16px 0 0; }
    .actions a {
        text-decoration: none;
        color: var(--vscode-button-secondaryForeground, var(--fg));
        background: var(--vscode-button-secondaryBackground, var(--chip));
        padding: 6px 14px;
        border-radius: 2px;
    }
    .actions a.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
    .actions a:hover { filter: brightness(1.1); }

    .timeline { list-style: none; margin: 0; padding: 0; }
    .timeline > li {
        display: grid;
        grid-template-columns: 96px 1fr;
        column-gap: 16px;
        padding: 12px 0;
        border-top: 1px solid var(--rule);
    }
    .timeline .num { font-family: var(--mono); color: var(--accent); }
    .timeline .date { color: var(--muted); font-size: 12px; }
    .timeline ul { margin: 0; padding-left: 18px; list-style: disc; }

    footer { color: var(--muted); font-size: 13px; border-top: 1px solid var(--rule); padding-top: 16px; }

    @media (max-width: 520px) {
        body { padding: 24px 16px 40px; }
        .bridge { grid-template-columns: 1fr; }
        .bridge .link { grid-column: 1; }
        .timeline > li { grid-template-columns: 1fr; }
    }
</style>
</head>
<body>
<main>
    <header>
        <h1>Lemari<span class="version">${version}</span></h1>
        <p class="tagline">Keep all your projects in one place, and open any of them in a couple of keystrokes.</p>
    </header>

    <div class="bridge" aria-label="Example of the project list: favorites and detected repositories, grouped">
        <span class="side">Favorites</span><span class="path">api</span>
        <span class="link">~/repos/api &middot; work, backend</span>
        <span class="side">Git</span><span class="path">web-shop</span>
        <span class="link">~/repos/web-shop</span>
        <span class="side">Any</span><span class="path">notes</span>
        <span class="link">~/Documents/notes</span>
    </div>

    <section class="latest">
        <h2>New in ${latest.version}</h2>
        <ul>${list(latest.changes)}</ul>
        <div class="actions">
            <a class="primary" href="${commandLink("lemari.listProjects")}">Open a project</a>
            <a href="${commandLink("lemari.saveProject")}">Save this folder as a project</a>
            <a href="${commandLink("workbench.action.openSettings", "lemari.git.baseFolders")}">Set Git base folders</a>
        </div>
    </section>

    <section>
        <h2>Earlier releases</h2>
        <ol class="timeline">
            ${earlier.map(r => `<li><div><div class="num">${r.version}</div><div class="date">${r.date}</div></div><ul>${list(r.changes)}</ul></li>`).join("")}
        </ol>
    </section>

    <footer>
        <p>Lemari is a fork of <a href="https://github.com/alefragnani/vscode-project-manager">Project Manager</a> by Alessandro Fragnani, who built everything it started from.
        Report problems or ideas on <a href="https://github.com/exeldtarkus/lemari/issues">GitHub</a>.</p>
    </footer>
</main>
</body>
</html>`;
}
