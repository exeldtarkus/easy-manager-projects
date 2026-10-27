<p align="center">
  <br />
  <img src="images/vscode-project-manager-logo-readme.png" alt="Easy Projects Manager logo" width="70%" />
</p>

# Easy Projects Manager

One list of your projects, and each one opens on the right side of WSL or Windows.

Forked from [Project Manager](https://github.com/alefragnani/vscode-project-manager) by Alessandro Fragnani.

Easy Projects Manager keeps saved favorites and auto-detected repositories (Git, VS Code, Mercurial, SVN or any folder) in one place. Press `Shift+Alt+P`, pick a project, choose this window or a new one. A project stored under `\\wsl.localhost\<distro>\...` opens as a real WSL remote window instead of a slow UNC folder, and any project can be reopened on the other side with **Open in WSL** or **Open in Windows**.

## Highlights

- **One grouped list.** Favorites first, then Git, VSCode, Mercurial, SVN and Any, each under its own separator.
- **You choose the window.** Every open from the list or the Side Bar asks **Open in This Window** or **Open in New Window**.
- **WSL-aware.** WSL paths open as WSL remote windows, WSL repositories are auto-detected, and `security.allowedUNCHosts` is set up for you.
- **Favorites you can shape.** Tags, custom icons, rename, change the path, disable or delete, all from the Side Bar.
- **Familiar storage.** Favorites live in a plain `projects.json` you can still edit by hand.

## Contents

- [Quick start](#quick-start)
- [Open a project](#open-a-project)
- [Organize favorites](#organize-favorites)
- [Auto-detect repositories](#auto-detect-repositories)
- [WSL and Windows](#wsl-and-windows)
- [Side Bar, Status Bar and What's New](#side-bar-status-bar-and-whats-new)
- [Commands](#commands)
- [Settings reference](#settings-reference)
- [Troubleshooting](#troubleshooting)
- [Extension API](#extension-api)
- [Credits & origin](#credits--origin)
- [License](#license)

## Quick start

1. **Install** Easy Projects Manager (`exeltarkus.easy-projects-manager`) from the Extensions view.
2. **Save a favorite.** Open a folder or workspace and run **Easy Projects Manager: Save Project**. Accept the suggested name, and optionally use the buttons in the input box to add tags or pick an icon.
3. **Point it at your repositories.** Add base folders to your user `settings.json`:

   ```jsonc
   // settings.json
   "easyManagerProjects.git.baseFolders": [
       "C:\\Projects",
       "\\\\wsl.localhost\\Ubuntu\\home\\me\\repos"
   ]
   ```

4. **Open something.** Press `Shift+Alt+P` (`Cmd+Alt+P` on macOS), or use the **Easy Projects Manager** view in the Activity Bar.

> **Backslashes differ between the two editors.** In `settings.json` each backslash is escaped, so a WSL folder is written `"\\\\wsl.localhost\\Ubuntu\\home\\me\\repos"`. In the Settings UI you type the real path with single backslashes: `\\wsl.localhost\Ubuntu\home\me\repos`. Doubled backslashes in the Settings UI find nothing, and no error is shown.

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

With `easyManagerProjects.groupList` set to `true` (the default) the list shows one section per kind, in this order:

1. **Favorites**, with their custom icon, a folder icon, or a remote icon for remote paths
2. **Git**
3. **VSCode**
4. **Mercurial**
5. **SVN**
6. **Any**

Within each section projects follow `easyManagerProjects.sortList` (`Saved`, `Name`, `Path` or `Recent`). Set `groupList` to `false` for a single flat list without separators.

Typing matches the name and the path (for example `wsl.localhost` or `repos\api`). Set `filterOnFullPath` to `false` to match names only. The current project is hidden from the list unless you turn off `removeCurrentProjectFromList`, and with `git.showBranchName` set to `onlyInCommandPalette` or `always` each Git project shows its current branch.

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

## Organize favorites

### Save

**Save Project** stores the current folder or workspace. The name box has two buttons: one to select tags, one to select an icon (any codicon). Saving a name that already exists offers to update it. Projects from the auto-detected views can be promoted with **Add to Favorites** in their context menu.

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

Tags available for selection come from `easyManagerProjects.tags` (default `Personal`, `Work`). Switch the Favorites view between **View as List** and **View as Tags** from its title bar, and use **Filter Projects by Tag** to show only some tags in both the view and the list. `tags.collapseItems` controls whether tag groups start expanded or collapsed.

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
- Set `easyManagerProjects.projectsLocation` to keep the file in another folder, for example one shared between Stable and Insiders.

If the file is not valid JSON the extension says so and offers **Open File** so you can fix it.

![Error shown for a corrupted projects.json](docs/images/project-manager-edit-corrupted-projectsJson.png)

## Auto-detect repositories

Each kind has its own settings and, once it has base folders, its own Side Bar view:

| Kind | Settings prefix | Detects |
|---|---|---|
| Git | `easyManagerProjects.git.*` | Git repositories |
| VSCode | `easyManagerProjects.vscode.*` | Folders with a `.vscode` folder, and `.code-workspace` files |
| Mercurial | `easyManagerProjects.hg.*` | Mercurial repositories |
| SVN | `easyManagerProjects.svn.*` | Subversion working copies |
| Any | `easyManagerProjects.any.*` | Any folder |

For each kind:

- `baseFolders` lists folders or [glob patterns](https://code.visualstudio.com/docs/editor/glob-patterns) to scan. Windows paths, WSL UNC paths, `~` and `$home` all work.
- `ignoredFolders` lists folders or glob patterns to skip.
- `maxDepthRecursion` limits how deep the scan goes (default `4`; any value below `1` means no limit).

```json
"easyManagerProjects.git.baseFolders": [
    "C:\\Projects",
    "D:\\Work\\client-*",
    "$home\\personal"
],
"easyManagerProjects.git.ignoredFolders": [ "node_modules", "out", "fork*" ],
"easyManagerProjects.git.maxDepthRecursion": 4
```

Related switches: `supportSymlinksOnBaseFolders` follows symlinks, `ignoreProjectsWithinProjects` skips nested projects, `any.excludeBaseFoldersFromResults` leaves the base folders themselves out of the Any list, and `cacheProjectsBetweenSessions` avoids a full rescan at every start. Run **Refresh Projects** (or the per-kind refresh button in each view) after changing folders on disk.

## WSL and Windows

### WSL paths open as WSL windows

Any favorite or detected project under `\\wsl.localhost\<distro>\...` or `\\wsl$\<distro>\...` opens as `vscode-remote://wsl+<distro>/...`. You get a WSL remote window with Linux tools and fast file access, not a local window browsing a network share.

### Open in WSL / Open in Windows

On Windows, every project in the Side Bar has two extra context menu entries:

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

## Side Bar, Status Bar and What's New

- **Side Bar.** The Easy Projects Manager view has Favorites plus one view per configured kind. Each view has buttons to list its projects, refresh (auto-detected views) and open the related settings. The Favorites title bar adds **Save Project**, **Edit Projects**, the list/tags toggle, **Filter Projects by Tag**, and a **View & Sort** menu (**Sort by Saved**, **Name**, **Path** or **Recent**).
- **Current project highlight.** The open project is highlighted; pick your own color:

  ```json
  "workbench.colorCustomizations": {
      "easyManagerProjects.sideBar.currentProjectHighlightForeground": "#e13015"
  }
  ```

- **Status Bar.** Shows the current project name (`showProjectNameInStatusBar`); click it to open the project list.
- **What's New.** **Easy Projects Manager: What's New** shows the latest changes, the release timeline of this fork, and shortcuts to open a project, save one or set Git base folders. It follows your VS Code theme.

![Easy Projects Manager in the Side Bar](docs/images/vscode-project-manager-side-bar.png)

## Commands

| Command | What it does |
|---|---|
| **Easy Projects Manager: Save Project** | Save the current folder or workspace as a favorite |
| **Easy Projects Manager: List Projects to Open** (`Shift+Alt+P`) | Pick a project, then choose this window or a new one |
| **Easy Projects Manager: List Projects to Open in New Window** | Pick a project and open it in a new window |
| **Easy Projects Manager: Edit Projects** | Open `projects.json` |
| **Easy Projects Manager: Filter Projects by Tag** | Show only favorites with the selected tags |
| **Easy Projects Manager: Add Project to Workspace** | Add a project folder to the current workspace |
| **Easy Projects Manager: Refresh Projects** | Rescan all base folders (Git, VSCode, Mercurial, SVN and Any also have their own refresh command) |
| **Easy Projects Manager: What's New** | Show the release notes page |
| **Easy Projects Manager: Support the Original Project Manager** | Show ways to sponsor or donate to the original extension |

## Settings reference

All settings start with `easyManagerProjects.`.

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

### WSL repositories are not detected

1. **Check the backslashes.** `settings.json` needs `"\\\\wsl.localhost\\Ubuntu\\..."`; the Settings UI needs `\\wsl.localhost\Ubuntu\...`.
2. **Check `security.allowedUNCHosts`.** It must contain `wsl.localhost` (or `wsl$`, whichever your paths use) in the **Default** profile's `settings.json`. The extension adds it for you; a copy only in a custom profile is not enough.
3. **Restart VS Code** after the host is added. A window reload sometimes is not.
4. **Make sure WSL is running**, for example by opening a WSL terminal, so `\\wsl.localhost` is reachable.
5. **Raise `maxDepthRecursion`** if your repositories sit more than 4 levels below the base folder.
6. Run **Easy Projects Manager: Refresh Projects**.

### Coming from the original Project Manager

- **Favorites are stored separately.** Copy `projects.json` from the original extension's global storage folder (`alefragnani.project-manager`) into this one's (`exeltarkus.easy-projects-manager`), or point `easyManagerProjects.projectsLocation` at the folder that already holds it.
- **Earlier local build.** If you installed a build with the ID `exeldtarkus.easy-manager-projects` or `exeltarkus.easy-manager-projects`, copy `projects.json` from that extension's global storage folder into the `exeltarkus.easy-projects-manager` folder, then uninstall the old build.
- **Settings are renamed.** Replace the `projectManager.` prefix with `easyManagerProjects.` in your `settings.json`.
- **Remote extension kind.** Do not set `remote.extensionKind` to `workspace` for `exeltarkus.easy-projects-manager`. The extension has to run on the local (Windows) side to switch between WSL and Windows, so running it inside the remote turns those features off. Favorites for Containers, SSH, WSL or Codespaces still work from the local side and open the remote when picked.

## Extension API

Other extensions can save projects through the public API. Declare the dependency:

```json
"extensionDependencies": [
    "exeltarkus.easy-projects-manager"
]
```

Then use the exports:

```ts
import { ProjectManagerPublicApi } from './api/projectManager/api';

async function useProjectManagerApi() {
    const projectManagerApi = <ProjectManagerPublicApi>vscode.extensions.getExtension('exeltarkus.easy-projects-manager')?.exports;

    await projectManagerApi.saveProject("My Project", "/path/to/project", ["work"], "Default");
}
```

The contract is in [api/api.d.ts](api/api.d.ts). See also the [VS Code extensions API](https://code.visualstudio.com/api/references/vscode-api#extensions).

## Credits & origin

Easy Projects Manager is a fork of [Project Manager](https://github.com/alefragnani/vscode-project-manager) **13.1.1** by **Alessandro Fragnani**. The core of this extension (saved projects, auto-detection, tags, the Side Bar, the Status Bar and the API) is his work, and all credit for it goes to him. This fork adds WSL and Windows switching and the changes listed in [CHANGELOG.md](CHANGELOG.md), which also keeps the history of the original project.

If the original helps you, consider supporting it with **Easy Projects Manager: Support the Original Project Manager**.

## License

[GPL-3.0 with VS Code Extension Host API Exception](LICENSE.md) &copy; Alessandro Fragnani (original [Project Manager](https://github.com/alefragnani/vscode-project-manager)). Fork maintained by [exeldtarkus](https://github.com/exeldtarkus/easy-manager-projects).
