<p align="center">
  <br />
  <img src="images/vscode-project-manager-logo-readme.png" alt="Easy Manager Projects Logo" width="70%" />
</p>

# Easy Manager Projects

**Jump between your projects, and between WSL and Windows, in one click.**

> Forked from [Project Manager](https://github.com/alefragnani/vscode-project-manager) by Alessandro Fragnani. See [Credits & origin](#credits--origin).

## Why Easy Manager Projects

If you code on Windows with WSL, opening `\\wsl.localhost\...` folders as plain UNC paths is slow, and auto-detecting repositories inside WSL tends to fail without any error. Easy Manager Projects keeps everything the original Project Manager does, and adds:

* **WSL projects open as a WSL remote window.** Anything under `\\wsl$\<distro>\...` or `\\wsl.localhost\<distro>\...` (saved or auto-detected) opens as `vscode-remote://wsl+<distro>/...`, not as a slow local UNC folder.
* **Open in WSL / Open in Windows** in the Side Bar context menu (Windows only), so you can switch where a project runs without retyping paths.
* **Repositories inside WSL are auto-detected.** Point any `baseFolders` setting (Git, Mercurial, SVN, VS Code, Any) at a `\\wsl.localhost\<distro>\...` folder.
* **New in 1.1.0: UNC hosts are allowed for you.** VS Code blocks UNC hosts that are not listed in `security.allowedUNCHosts`, and does it silently: WSL base folders just come back empty. On Windows, when one of your base folders is a WSL UNC path, the extension now adds `wsl.localhost` and/or `wsl$` to `security.allowedUNCHosts` (an application-scope setting, so it is written to the **Default** profile settings) and offers to reload the window. If a reload is not enough, restart VS Code completely.

## Quick start

1. Install **Easy Manager Projects** (`exeldtarkus.easy-manager-projects`) from the Extensions view. See [installing extensions](https://code.visualstudio.com/docs/editor/extension-gallery) if needed.
2. Open a folder or workspace and run **Easy Manager Projects: Save Project**. A name is suggested for you.
3. Tell the extension where to look for repositories:

```jsonc
// settings.json
"easyManagerProjects.git.baseFolders": [
    "c:\\Projects\\code",
    "\\\\wsl.localhost\\Ubuntu\\home\\me\\repos"
],
// only used by "Open in WSL" for Windows-drive projects
"easyManagerProjects.wsl.distro": "Ubuntu"
```

4. Open the **Easy Manager Projects** Side Bar, or run **Easy Manager Projects: List Projects to Open**.

> **Mind the backslashes.** In `settings.json` every backslash is escaped, so a WSL folder is written `"\\\\wsl.localhost\\Ubuntu\\home\\me\\repos"`. In the **Settings UI** you type the real path with single backslashes: `\\wsl.localhost\Ubuntu\home\me\repos`. Doubling the backslashes in the Settings UI is a common mistake, and it silently finds nothing.

About `easyManagerProjects.wsl.distro` (default `""`): it holds one distro name and is only used by **Open in WSL** for projects on a Windows drive. WSL UNC paths already carry their own distro, so they ignore it.

## Features

### Saved projects (Favorites)

* **Save Project** stores the current folder or workspace, optionally with tags.
* **Edit Projects** opens `projects.json` so you can edit the list by hand:

```json
[
    {
        "name": "Bookmarks",
        "rootPath": "$home\\Documents\\GitHub\\vscode-bookmarks",
        "tags": [ "Personal", "VS Code" ],
        "enabled": true,
        "profile": "VSCode"
    }
]
```

`~` and `$home` are replaced by your HOME folder. Keep the file valid JSON; if it is broken, the extension shows an error with an **Open File** button so you can fix it.

![Corrupted projects.json](docs/images/project-manager-edit-corrupted-projectsJson.png)

Projects whose path no longer exists (deleted or renamed) are flagged in the list.

### Auto-detected projects

Git, Mercurial, SVN, VS Code workspaces and "any" folders are found under the `baseFolders` you configure, including WSL UNC paths and [glob patterns](https://code.visualstudio.com/docs/editor/glob-patterns). Each kind gets its own Side Bar view once it has base folders.

### Tags

Define tags with `easyManagerProjects.tags`, attach several to each project, and filter by them with **Easy Manager Projects: Filter Projects by Tag** or from the Side Bar.

![Tags in the Side Bar](docs/images/vscode-project-manager-side-bar-tags.gif)

### Side Bar

A dedicated Side Bar with Favorites and one view per detected kind. Right-click a project to open it (same or new window), **Open in WSL**, **Open in Windows**, add it to the workspace, reveal it in the file manager, rename it, edit its tags, disable it or delete it.

![Side Bar](docs/images/vscode-project-manager-side-bar.png)

The current project can be highlighted with a custom color:

```json
"workbench.colorCustomizations": {
    "easyManagerProjects.sideBar.currentProjectHighlightForeground": "#e13015"
}
```

### Status Bar and quick pick

The Status Bar shows the current project name; clicking it lists your projects. The quick pick can be sorted and grouped (see settings).

![Sorted by name](docs/images/project-manager-list-sort-by-name.png)

Keyboard users can bind their own navigation keys with the `inProjectManagerList` context:

```json
{
    "key": "ctrl+j",
    "command": "workbench.action.quickOpenSelectNext",
    "when": "inProjectManagerList && (isWindows || isLinux)"
},
{
    "key": "ctrl+shift+j",
    "command": "workbench.action.quickOpenSelectPrevious",
    "when": "inProjectManagerList && (isWindows || isLinux)"
}
```

### Commands

| Command | What it does |
|---|---|
| `Easy Manager Projects: Save Project` | Save the current folder/workspace as a project |
| `Easy Manager Projects: Edit Projects` | Open `projects.json` |
| `Easy Manager Projects: List Projects to Open` | Pick a saved or detected project to open |
| `Easy Manager Projects: List Projects to Open in New Window` | Same, always in a new window |
| `Easy Manager Projects: Filter Projects by Tag` | Show only favorites with the selected tags |
| `Easy Manager Projects: Add Project to Workspace` | Add a project folder to the current workspace |
| `Easy Manager Projects: Refresh Projects` | Re-scan all base folders (per-kind refresh commands also exist) |
| `Easy Manager Projects: What's New` | Show the release notes |

### Remote Development

Out of the box the extension runs locally: you can save Container, SSH, WSL or Codespaces projects as favorites, each with its own icon, and VS Code opens the remote when you pick one.

If you mostly work *inside* a remote and want favorites or auto-detection on that remote, run the extension there by adding this to your User Settings ([details](https://code.visualstudio.com/docs/remote/containers#_advanced-forcing-an-extension-to-run-locally-or-remotely)):

```json
"remote.extensionKind": {
    "exeldtarkus.easy-manager-projects": [ "workspace" ]
}
```

## WSL and Windows in detail

* **Open in WSL**
  * A Windows-drive project such as `C:\src\app` opens in WSL as `/mnt/c/src/app`, using `easyManagerProjects.wsl.distro`.
  * A WSL UNC path opens in its own distro.
* **Open in Windows**
  * A WSL project such as `vscode-remote://wsl+Ubuntu/home/u/app` opens locally as `\\wsl.localhost\Ubuntu\home\u\app`.
  * A `/mnt/c/...` path maps back to `C:\...`.

> **Limitation:** the default WSL automount root `/mnt/` is assumed. A custom `root` in `/etc/wsl.conf` is not supported.

## Settings

All settings use the `easyManagerProjects.` prefix.

### Lists and windows

| Setting | Default | Description |
|---|---|---|
| `sortList` | `"Name"` | Quick pick order: `Saved`, `Name`, `Path` or `Recent` |
| `groupList` | `false` | Group the list by kind (Favorites, Git, Mercurial, SVN, VS Code) |
| `removeCurrentProjectFromList` | `true` | Hide the current project from the list |
| `checkInvalidPathsBeforeListing` | `true` | Flag projects whose path no longer exists |
| `showParentFolderInfoOnDuplicates` | `false` | Show the parent folder when two projects share a name |
| `filterOnFullPath` | `false` | Match the quick pick filter against the full path |
| `openInCurrentWindowIfEmpty` | `"always"` | When "open in new window" reuses an empty current window: `always`, `onlyUsingCommandPalette`, `onlyUsingSideBar`, `never` |
| `confirmSwitchOnActiveWindow` | `"never"` | Ask before replacing the active window: `never`, `onlyUsingCommandPalette`, `onlyUsingSideBar`, `always` |
| `showProjectNameInStatusBar` | `true` | Show the project name in the Status Bar |
| `openInNewWindowWhenClickingInStatusBar` | `false` | Status Bar click opens projects in a new window |
| `projectsLocation` | `""` | Folder holding `projects.json` (share it between Stable/Insiders or a synced folder; `~`/`$home` allowed) |
| `wsl.distro` | `""` | Distro used by **Open in WSL** for Windows-drive projects |

### Tags

| Setting | Default | Description |
|---|---|---|
| `tags` | `["Personal", "Work"]` | Tags available for your projects |
| `tags.collapseItems` | `"startExpanded"` | Tag groups in Favorites: `alwaysExpanded`, `alwaysCollapsed`, `startExpanded`, `startCollapsed` (the last two remember your state) |

### Auto-detection

Each kind (`git`, `hg`, `svn`, `vscode`, `any`) has the same three settings:

| Setting | Default | Description |
|---|---|---|
| `<kind>.baseFolders` | `[]` | Folders or glob patterns to scan (WSL UNC paths supported) |
| `<kind>.ignoredFolders` | `node_modules`, `out`, `typings`, `test` (+ `.haxelib` for git/hg) | Folders or glob patterns to skip |
| `<kind>.maxDepthRecursion` | `4` | How deep to search |

| Setting | Default | Description |
|---|---|---|
| `any.excludeBaseFoldersFromResults` | `false` | Return only matching subfolders, not the `any` base folders themselves |
| `git.showBranchName` | `"never"` | Show the Git branch: `never`, `onlyInSideBar`, `onlyInCommandPalette`, `always` |
| `ignoreProjectsWithinProjects` | `false` | Skip projects found inside other projects |
| `supportSymlinksOnBaseFolders` | `false` | Follow symlinks inside base folders |
| `cacheProjectsBetweenSessions` | `true` | Cache detected projects between sessions |

Example:

```json
"easyManagerProjects.git.baseFolders": [
    "c:\\Projects\\code",
    "d:\\MoreProjects\\code-*",
    "$home\\personal-coding"
],
"easyManagerProjects.git.ignoredFolders": [ "node_modules", "out", "fork*" ],
"easyManagerProjects.git.maxDepthRecursion": 4
```

## Troubleshooting

### WSL repositories are not detected

1. **Check the backslashes.** `settings.json` needs `"\\\\wsl.localhost\\Ubuntu\\..."`; the Settings UI needs `\\wsl.localhost\Ubuntu\...`.
2. **Check `security.allowedUNCHosts`.** It must list `wsl.localhost` (or `wsl$`, matching your path) in the **Default** profile's `settings.json`. Since 1.1.0 the extension adds it for you; if you use a custom profile, a copy in that profile's settings is not enough.
3. **Restart VS Code** after the host is added. A window reload is sometimes not enough.
4. **Make sure WSL is running**, for example by opening a WSL terminal, so the `\\wsl.localhost` share is reachable.
5. **Increase `maxDepthRecursion`** if your repositories sit deeper than 4 levels below the base folder.
6. Run **Easy Manager Projects: Refresh Projects**.

### Migrating from the original Project Manager

* **Favorites are stored separately.** Copy `projects.json` from the original extension's globalStorage folder (`alefragnani.project-manager`) into this extension's folder (`exeldtarkus.easy-manager-projects`), or point `easyManagerProjects.projectsLocation` at the folder that already holds your `projects.json`.
* **Settings are renamed.** Replace the `projectManager.` prefix with `easyManagerProjects.` in your `settings.json`.
* **Remote extension kind.** If you had `remote.extensionKind` set for `alefragnani.project-manager`, add the same entry for `exeldtarkus.easy-manager-projects`.

## Extension API

Other extensions can use the public API. Declare the dependency:

```json
"extensionDependencies": [
    "exeldtarkus.easy-manager-projects"
]
```

Then get the exports:

```ts
import { ProjectManagerPublicApi } from './api/projectManager/api';

async function useProjectManagerApi() {
    const projectManagerApi = <ProjectManagerPublicApi>vscode.extensions.getExtension('exeldtarkus.easy-manager-projects')?.exports;

    await projectManagerApi.saveProject("My Project", "/path/to/project", ["work"], "Default");
}
```

The contract is defined in [/api/api.d.ts](/api/api.d.ts). See also the [VS Code extensions API](https://code.visualstudio.com/api/references/vscode-api#extensions).

## Credits & origin

Easy Manager Projects is a fork of **[Project Manager](https://github.com/alefragnani/vscode-project-manager)** by **Alessandro Fragnani**, taken at version **13.1.1**. Everything this extension does beyond WSL/Windows switching (saved projects, auto-detection, tags, Side Bar, Status Bar, the API) is his work, and all credit for it goes to him. The history of the original project is kept in [CHANGELOG.md](CHANGELOG.md).

If you find the original useful, consider supporting it with **Easy Manager Projects: Support the Original Project Manager**.

## License

[GPL-3.0 with VS Code Extension Host API Exception](LICENSE.md) &copy; Alessandro Fragnani (original [Project Manager](https://github.com/alefragnani/vscode-project-manager)). Fork maintained by [exeldtarkus](https://github.com/exeldtarkus/easy-manager-projects).
