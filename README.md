<p align="center">
  <br />
  <img src="images/lemari-logo.png" alt="Lemari logo" width="144" />
</p>

# Lemari - Project Manager

Keep all your projects in one place, and open any of them in a couple of keystrokes.

*Lemari* is Indonesian for wardrobe: a cabinet where everything has its place. The extension keeps the projects you save as favorites and the repositories it finds on disk in one organized list. Press `Shift+Alt+P`, type part of a name or path, and choose whether to open the project in this window or a new one.

Forked from [Project Manager](https://github.com/alefragnani/vscode-project-manager) by Alessandro Fragnani.

## Features

- **Favorites.** Save the current folder or workspace, or any folder picked in the system dialog, under a name of your choice.
- **Tags and icons.** Saving asks for the name, the tags and an icon in one flow. Group the Favorites view by tag, filter by tag, and change tags, icon, name or path later from the Side Bar.
- **Auto-detected repositories.** Point Lemari at base folders and it lists every Git, SVN and Mercurial repository, every VS Code project, or every folder inside them.
- **Quick switching.** One grouped list (Favorites, Git, VSCode, Mercurial, SVN, Any) with the name and path on two lines. Typing matches both.
- **Side Bar.** A Lemari view in the Activity Bar with Favorites plus one view per kind of detected project.
- **Sorting.** Order projects by saved order, name, path or most recently used.
- **Status Bar.** Shows the current project name; click it to switch.
- **Remote projects.** Favorites can point at remote folders (Containers, SSH, Codespaces and more) and open the remote when picked.
- **Plain storage.** Favorites live in a `projects.json` file you can edit by hand.
- **Working across WSL and Windows.** WSL paths open as real WSL remote windows, and any project can be reopened on the other side.

## Contents

- [Quick start](#quick-start)
- [Save and organize favorites](#save-and-organize-favorites)
- [Auto-detect repositories](#auto-detect-repositories)
- [Open a project](#open-a-project)
- [Side Bar, Status Bar and What's New](#side-bar-status-bar-and-whats-new)
- [Working across WSL and Windows](#working-across-wsl-and-windows)
- [Commands](#commands)
- [Settings reference](#settings-reference)
- [Troubleshooting](#troubleshooting)
- [Extension API](#extension-api)
- [Credits & origin](#credits--origin)
- [License](#license)

## Quick start

1. **Install** Lemari (`exeltarkus.lemari`) from the Extensions view.
2. **Save a favorite.** Open a folder or workspace and run **Lemari: Save Project**, or use **Add Folder to Favorites...** in the Favorites title bar to pick a folder without opening it. Enter a name, then pick tags and an icon (or skip them).
3. **Add a base folder.** In the Git view, click **Add Git Base Folder...** and pick the folder that holds your repositories. Every repository inside it is listed.
4. **Switch.** Press `Shift+Alt+P` (`Cmd+Alt+P` on macOS), or open the **Lemari** view in the Activity Bar.

## Save and organize favorites

### Save

There are three ways to save a favorite:

- **Lemari: Save Project** saves the current folder or workspace.
- **Add Folder to Favorites...** (Favorites title bar and Command Palette) opens the system folder dialog, so you can save any folder without opening it. In a remote window the dialog shows the remote file system.
- **Add to Favorites** in the context menu of an auto-detected project promotes it to a favorite.

Each one asks for the name, then the tags (with a button to add new tags), then an icon (any codicon). Press `Esc` at any step to cancel. Saving a name that already exists updates that project, with its current tags and icon preselected.

### Edit from the Side Bar

Right-click a favorite:

| Action | Effect |
|---|---|
| **Edit Path** | Change the folder a favorite points to. A missing folder only shows a warning, so remote or offline paths can still be saved. |
| **Edit Icon** | Pick a codicon, or **No icon** to remove it. The icon appears in the Side Bar and in the project list. |
| **Edit Tags** | Choose which tags the project carries. |
| **Rename Project** | Give it a new name. |
| **Disable Project** | Hide it without deleting it; an **Undo** button appears right after. |
| **Delete Project** | Remove it from the favorites. |

All projects also offer **Add to Workspace** and **Reveal in Explorer** / **Reveal in Finder** / **Reveal in File Manager**, depending on your OS.

### Tags

The tags offered when saving come from `lemari.tags` (default `Personal`, `Work`) plus any tag already used by a favorite. Switch the Favorites view between **View as List** and **View as Tags** from its title bar, and use **Filter Projects by Tag** to show only some tags in both the view and the project list. `tags.collapseItems` controls whether tag groups start expanded or collapsed.

![Favorites grouped by tag in the Side Bar](docs/images/vscode-project-manager-side-bar-tags.gif)

### Edit projects.json by hand

**Edit Projects** opens the file behind the favorites:

```json
[
    {
        "name": "Bookmarks",
        "rootPath": "$home\\Documents\\GitHub\\vscode-bookmarks",
        "tags": [ "Personal", "VS Code" ],
        "icon": "rocket",
        "enabled": true,
        "profile": "VSCode"
    }
]
```

- `~` and `$home` expand to your home folder.
- `icon` is a codicon id; leave it out for the default folder icon.
- `profile` opens the project with that VS Code profile.
- Set `lemari.projectsLocation` to keep the file in another folder, for example one shared between Stable and Insiders.

If the file is not valid JSON the extension says so and offers **Open File** so you can fix it.

![Error shown for a corrupted projects.json](docs/images/project-manager-edit-corrupted-projectsJson.png)

## Auto-detect repositories

Each kind has its own settings and, once it has base folders, its own Side Bar view:

| Kind | Settings prefix | Detects |
|---|---|---|
| Git | `lemari.git.*` | Git repositories |
| VSCode | `lemari.vscode.*` | Folders with a `.vscode` folder, and `.code-workspace` files |
| Mercurial | `lemari.hg.*` | Mercurial repositories |
| SVN | `lemari.svn.*` | Subversion working copies |
| Any | `lemari.any.*` | Any folder |

For each kind:

- `baseFolders` lists folders or [glob patterns](https://code.visualstudio.com/docs/editor/glob-patterns) to scan. Windows paths, WSL UNC paths, `~` and `$home` all work.
- `ignoredFolders` lists folders or glob patterns to skip.
- `maxDepthRecursion` limits how deep the scan goes (default `4`; any value below `1` means no limit).

For Git, **Add Git Base Folder...** (Git view title bar, Git welcome view and Command Palette) picks a folder in the system dialog and adds it to `lemari.git.baseFolders` in your user settings. For the other kinds, edit `settings.json`:

```json
"lemari.git.baseFolders": [
    "C:\\Projects",
    "D:\\Work\\client-*",
    "$home\\personal"
],
"lemari.git.ignoredFolders": [ "node_modules", "out", "fork*" ],
"lemari.git.maxDepthRecursion": 4
```

> **Backslashes differ between the two editors.** In `settings.json` each backslash is escaped, as above. In the Settings UI you type the real path with single backslashes, for example `C:\Projects`. Doubled backslashes in the Settings UI find nothing, and no error is shown.

Related switches: `supportSymlinksOnBaseFolders` follows symlinks, `ignoreProjectsWithinProjects` skips nested projects, `any.excludeBaseFoldersFromResults` leaves the base folders themselves out of the Any list, and `cacheProjectsBetweenSessions` avoids a full rescan at every start. Run **Refresh Projects** (or the per-kind refresh button in each view) after changing folders on disk.

## Open a project

| Where | What happens |
|---|---|
| `Shift+Alt+P` (**List Projects to Open**) | A grouped list titled "Open a Project". Pick one, then choose **Open in This Window** (listed first, so pressing `Enter` twice keeps you in place) or **Open in New Window**. |
| The `link-external` button on a list item | Opens that project in a new window right away, without the second question. |
| **List Projects to Open in New Window** | Same list, every pick opens in a new window. |
| Clicking a project in the Side Bar | Asks **Open in This Window** or **Open in New Window**. |
| The inline **Open in New Window** button in the Side Bar | Opens in a new window directly. |
| The project name in the Status Bar | Runs **List Projects to Open** (or the new-window variant, see `openInNewWindowWhenClickingInStatusBar`). |

### How the list is built

Each project takes two lines: the name on top, the path below. A project whose folder no longer exists is marked **Path does not exist**.

With `lemari.groupList` set to `true` (the default) the list shows one section per kind, each header with its number of projects (for example `Git (55)`), in this order:

1. **Favorites**, with their custom icon, a folder icon, or a remote icon for remote paths
2. **Git**
3. **VSCode**
4. **Mercurial**
5. **SVN**
6. **Any**

Within each section projects follow `lemari.sortList` (`Saved`, `Name`, `Path` or `Recent`). Set `groupList` to `false` for a single flat list without separators.

Typing matches the name and the path (for example `repos\api`). Set `filterOnFullPath` to `false` to match names only. The current project is hidden from the list unless you turn off `removeCurrentProjectFromList`, and with `git.showBranchName` set to `onlyInCommandPalette` or `always` each Git project shows its current branch.

### Keyboard navigation

While the list is open the `inProjectManagerList` context is set, so you can bind your own keys:

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

## Side Bar, Status Bar and What's New

- **Side Bar.** The Lemari view has Favorites plus one view per configured kind. Each view has buttons to list its projects, refresh (auto-detected views) and open the related settings. The Favorites title bar adds **Save Project**, **Add Folder to Favorites...**, **Edit Projects**, the list/tags toggle, **Filter Projects by Tag**, and a **View & Sort** menu (**Sort by Saved**, **Name**, **Path** or **Recent**).
- **Current project highlight.** The open project is highlighted; pick your own color:

  ```json
  "workbench.colorCustomizations": {
      "lemari.sideBar.currentProjectHighlightForeground": "#e13015"
  }
  ```

- **Status Bar.** Shows the current project name (`showProjectNameInStatusBar`); click it to open the project list.
- **What's New.** **Lemari: What's New** shows the latest changes, the release timeline of this fork, and shortcuts to open a project, save one or set Git base folders. It follows your VS Code theme.

![Lemari in the Side Bar](docs/images/vscode-project-manager-side-bar.png)

## Working across WSL and Windows

On Windows, Lemari runs on the local side and handles projects stored in WSL.

### WSL paths open as WSL windows

Any favorite or detected project under `\\wsl.localhost\<distro>\...` or `\\wsl$\<distro>\...` opens as `vscode-remote://wsl+<distro>/...`. You get a WSL remote window with Linux tools and fast file access, not a local window browsing a network share.

WSL folders work as base folders too. In `settings.json` escape every backslash:

```jsonc
// settings.json
"lemari.git.baseFolders": [
    "C:\\Projects",
    "\\\\wsl.localhost\\Ubuntu\\home\\me\\repos"
]
```

In the Settings UI type `\\wsl.localhost\Ubuntu\home\me\repos` with single backslashes. **Add Git Base Folder...** used in a WSL window stores the folder as `\\wsl.localhost\...` for you.

### Open in WSL / Open in Windows

Every project in the Side Bar has two extra context menu entries on Windows:

| Command | From | Opens as |
|---|---|---|
| **Open in WSL** | `C:\src\app` | `/mnt/c/src/app` in your **default** WSL distribution |
| **Open in WSL** | `\\wsl.localhost\Ubuntu\home\me\app` | `/home/me/app` in `Ubuntu` |
| **Open in Windows** | `vscode-remote://wsl+Ubuntu/home/me/app` | `\\wsl.localhost\Ubuntu\home\me\app` |
| **Open in Windows** | `/mnt/c/src/app` | `C:\src\app` |

The default distribution is the one marked `*` in `wsl -l -v`; change it with `wsl --set-default <distro>`. If none is found, the project is not opened and a message explains why. Only WSL projects can be opened in Windows.

The default automount root `/mnt/` is assumed; a custom `root` in `/etc/wsl.conf` is not supported.

### Allowed UNC hosts are handled for you

VS Code refuses UNC hosts that are not listed in `security.allowedUNCHosts`, and it does so silently: a WSL base folder simply returns no projects. On Windows, when any `baseFolders` entry points at `\\wsl.localhost\...` or `\\wsl$\...`, the extension adds the missing host (`wsl.localhost` and/or `wsl$`) to that setting and offers **Reload Window**. The setting is application-scoped, so it is written to the **Default** profile's settings. If a reload is not enough, restart VS Code.

## Commands

| Command | What it does |
|---|---|
| **Lemari: Save Project** | Save the current folder or workspace as a favorite |
| **Add Folder to Favorites...** | Pick any folder in the system dialog and save it as a favorite |
| **Lemari: List Projects to Open** (`Shift+Alt+P`) | Pick a project, then choose this window or a new one |
| **Lemari: List Projects to Open in New Window** | Pick a project and open it in a new window |
| **Lemari: Edit Projects** | Open `projects.json` |
| **Lemari: Filter Projects by Tag** | Show only favorites with the selected tags |
| **Lemari: Add Project to Workspace** | Add a project folder to the current workspace |
| **Add Git Base Folder...** | Pick a folder in the system dialog and add it to `lemari.git.baseFolders` |
| **Lemari: Refresh Projects** | Rescan all base folders (Git, VSCode, Mercurial, SVN and Any also have their own refresh command) |
| **Lemari: What's New** | Show the release notes page |
| **Lemari: Support the Original Project Manager** | Show ways to sponsor or donate to the original extension |

## Settings reference

All settings start with `lemari.`.

### List and windows

| Setting | Default | Description |
|---|---|---|
| `groupList` | `true` | Group the list by kind with separators: Favorites, Git, VSCode, Mercurial, SVN, Any |
| `sortList` | `"Name"` | Order inside the list: `Saved`, `Name`, `Path` or `Recent` |
| `removeCurrentProjectFromList` | `true` | Hide the current project from the list |
| `checkInvalidPathsBeforeListing` | `true` | Check that project paths still exist before listing |
| `showParentFolderInfoOnDuplicates` | `false` | Show the parent folder when two projects share a name |
| `filterOnFullPath` | `true` | Match typed text against the path too, not only the name |
| `openInCurrentWindowIfEmpty` | `"always"` | When a new-window open may reuse an empty window: `always`, `onlyUsingCommandPalette`, `onlyUsingSideBar`, `never` |
| `confirmSwitchOnActiveWindow` | `"never"` | Ask before replacing the active window: `never`, `onlyUsingCommandPalette`, `onlyUsingSideBar`, `always` |
| `showProjectNameInStatusBar` | `true` | Show the project name in the Status Bar |
| `openInNewWindowWhenClickingInStatusBar` | `false` | Status Bar click lists projects to open in a new window |
| `projectsLocation` | `""` | Folder that holds `projects.json` (`~` and `$home` allowed) |

### Tags

| Setting | Default | Description |
|---|---|---|
| `tags` | `["Personal", "Work"]` | Tags you can assign to favorites |
| `tags.collapseItems` | `"startExpanded"` | Tag groups in Favorites: `alwaysExpanded`, `alwaysCollapsed`, `startExpanded`, `startCollapsed` |

### Auto-detection

Per kind (`git`, `vscode`, `hg`, `svn`, `any`):

| Setting | Default | Description |
|---|---|---|
| `<kind>.baseFolders` | `[]` | Folders or glob patterns to scan |
| `<kind>.ignoredFolders` | `["node_modules", "out", "typings", "test"]`, plus `".haxelib"` for `git` and `hg` | Folders or glob patterns to skip |
| `<kind>.maxDepthRecursion` | `4` | Maximum folder depth; below `1` means no limit |

General:

| Setting | Default | Description |
|---|---|---|
| `git.showBranchName` | `"never"` | Show the Git branch: `never`, `onlyInSideBar`, `onlyInCommandPalette`, `always` |
| `any.excludeBaseFoldersFromResults` | `false` | List only subfolders, not the Any base folders themselves |
| `ignoreProjectsWithinProjects` | `false` | Skip projects nested inside other projects |
| `supportSymlinksOnBaseFolders` | `false` | Follow symlinks inside base folders |
| `cacheProjectsBetweenSessions` | `true` | Keep detected projects between sessions |

## Troubleshooting

### Repositories are not detected

1. **Check the backslashes.** `settings.json` needs escaped backslashes (`"C:\\Projects"`); the Settings UI needs single ones (`C:\Projects`).
2. **Raise `maxDepthRecursion`** if your repositories sit more than 4 levels below the base folder.
3. **Check `ignoredFolders`** does not match the folders you expect.
4. Run **Lemari: Refresh Projects**.

### WSL repositories are not detected

1. **Check the backslashes.** `settings.json` needs `"\\\\wsl.localhost\\Ubuntu\\..."`; the Settings UI needs `\\wsl.localhost\Ubuntu\...`.
2. **Check `security.allowedUNCHosts`.** It must contain `wsl.localhost` (or `wsl$`, whichever your paths use) in the **Default** profile's `settings.json`. The extension adds it for you; a copy only in a custom profile is not enough.
3. **Restart VS Code** after the host is added. A window reload sometimes is not.
4. **Make sure WSL is running**, for example by opening a WSL terminal, so `\\wsl.localhost` is reachable.
5. **Raise `maxDepthRecursion`** if your repositories sit more than 4 levels below the base folder.
6. Run **Lemari: Refresh Projects**.

### Coming from the original Project Manager

- **Favorites are stored separately.** Copy `projects.json` from the original extension's global storage folder (`alefragnani.project-manager`) into this one's (`exeltarkus.lemari`), or point `lemari.projectsLocation` at the folder that already holds it.
- **Earlier local build.** If you installed a build with the ID `exeldtarkus.easy-manager-projects`, `exeltarkus.easy-manager-projects` or `exeltarkus.easy-projects-manager`, copy `projects.json` from that extension's global storage folder into the `exeltarkus.lemari` folder, then uninstall the old build.
- **Settings are renamed.** Replace the `projectManager.` prefix with `lemari.` in your `settings.json`.
- **Upgrading from 1.10.x or earlier.** From 1.11.0 settings and commands use `lemari.*` instead of `easyManagerProjects.*`, and the old keys are no longer read. Rename them in your `settings.json`, and in `keybindings.json` for any command IDs.
- **Remote extension kind.** Do not set `remote.extensionKind` to `workspace` for `exeltarkus.lemari`. The extension has to run on the local (Windows) side to switch between WSL and Windows, so running it inside the remote turns those features off. Favorites for Containers, SSH, WSL or Codespaces still work from the local side and open the remote when picked.

## Extension API

Other extensions can save projects through the public API. Declare the dependency:

```json
"extensionDependencies": [
    "exeltarkus.lemari"
]
```

Then use the exports:

```ts
import { ProjectManagerPublicApi } from './api/projectManager/api';

async function useProjectManagerApi() {
    const projectManagerApi = <ProjectManagerPublicApi>vscode.extensions.getExtension('exeltarkus.lemari')?.exports;

    await projectManagerApi.saveProject("My Project", "/path/to/project", ["work"], "Default");
}
```

The contract is in [api/api.d.ts](api/api.d.ts). See also the [VS Code extensions API](https://code.visualstudio.com/api/references/vscode-api#extensions).

## Credits & origin

Lemari is a fork of [Project Manager](https://github.com/alefragnani/vscode-project-manager) **13.1.1** by **Alessandro Fragnani**. The core of this extension (saved projects, auto-detection, tags, the Side Bar, the Status Bar and the API) is his work, and all credit for it goes to him. This fork adds the two-line grouped list, saving with tags and icon in one flow, the folder dialogs for favorites and Git base folders, WSL and Windows switching, and the other changes listed in [CHANGELOG.md](CHANGELOG.md), which also keeps the history of the original project.

If the original helps you, consider supporting it with **Lemari: Support the Original Project Manager**.

## License

[GPL-3.0 with VS Code Extension Host API Exception](LICENSE.md) &copy; Alessandro Fragnani (original [Project Manager](https://github.com/alefragnani/vscode-project-manager)). Fork maintained by [exeldtarkus](https://github.com/exeldtarkus/lemari).
