<p align="center">
  <br />
  <img src="images/vscode-project-manager-logo-readme.png" alt="Easy Manager Projects Logo" width="70%" />
</p>

English | [简体中文](README.zh-CN.md)

# Easy Manager Projects

Easily access your projects, saved or auto-detected, with first-class switching between WSL and Windows.

> **Fork notice:** Easy Manager Projects is a fork of [alefragnani/vscode-project-manager](https://github.com/alefragnani/vscode-project-manager) (GPLv3). All credit for the original extension goes to **Alessandro Fragnani**.

# What's new in Easy Manager Projects 1.0

* Initial release, forked from **Project Manager 13.1.1**
* All command, setting and view IDs renamed from the `projectManager` prefix to `easyManagerProjects`
* WSL projects (`\\wsl$\...` / `\\wsl.localhost\...`) open as a **WSL remote window**
* **Open in WSL** / **Open in Windows** in the Side Bar context menu

# Overview

It helps you to easily access your **projects**, no matter where they are located. _Don't miss those important projects anymore_. 

You can define your own **Projects** (also called **Favorites**), or choose for auto-detect **Git**, **Mercurial** or **SVN** repositories, **VSCode** folders, or **any** other folder.

Here are some of the features that **Easy Manager Projects** provides:

* Save any folder or workspace as a **Project**
* Auto-detect **Git**, **Mercurial** or **SVN** repositories
* Organize your projects using **Tags**
* Open projects in the same or new window
* Identify _deleted/renamed_ projects
* A **Status Bar** which identifies the current project
* A dedicated **Side Bar**

# Features

## Available Commands

* `Easy Manager Projects: Save Project` Save the current folder/workspace as a new project
* `Easy Manager Projects: Edit Projects` Edit your projects manually (`projects.json`)
* `Easy Manager Projects: List Projects to Open` List all saved/detected projects and pick one
* `Easy Manager Projects: List Projects to Open in New Window` List all saved/detected projects and pick one to be opened in New Window
* `Easy Manager Projects: Filter Projects by Tag` Filter the Favorite projects by selected tags

## Manage your projects

### Save Project

You can save the current folder/workspace as a **Project** at any time. You just need to type its name. 

![Save](docs/images/project-manager-save.png)

> It suggests a name to you _automatically_ :)
 
### Edit Projects

For easier customization of your project list, you can edit the `projects.json` file, directly inside **Code**. Just execute `Easy Manager Projects: Edit Projects` and the `projects.json` file is opened. Simple as this:

```json
[
    {
        "name": "Pascal MI",
        "rootPath": "c:\\PascalProjects\\pascal-menu-insight",
        "tags": [],
        "enabled": true,
        "profile": "Delphi"
    },
    {
        "name": "Bookmarks",
        "rootPath": "$home\\Documents\\GitHub\\vscode-bookmarks",
        "tags": [
            "Personal",
            "VS Code"
        ],
        "enabled": true,
        "profile": "VSCode"
    },
    {
        "name": "Numbered Bookmarks",
        "rootPath": "~\\Documents\\GitHub\\vscode-numbered-bookmarks",
        "tags": [
            "Personal",
            "VS Code"
        ],
        "enabled": false,
        "profile": "VSCode"
    }
]
```

> You can use `~` or `$home` while defining any path. It will be replaced by your HOME folder.

> Be sure that the JSON file is well-formed. Otherwise, **Easy Manager Projects** will not be able to open it, and an error message like this should appear. In this case, you should use the `Open File` button to fix it.

![Corrupted](docs/images/project-manager-edit-corrupted-projectsJson.png)

## Access 

### List Projects to Open

Shows your projects and select one to open.

### List Projects to Open in New Window

Just like **List Projects** but always opening in **New Window**.

## Keyboard Focused Users

If you are a keyboard focused user and uses _Vim like_ keyboard navigation, you can navigate thru the project list with your own keybindings. 

Just use the `when` clause `"inProjectManagerList"`, like:

```json
    {
        "key": "cmd+j",
        "command": "workbench.action.quickOpenSelectNext",
        "when": "inProjectManagerList && isMac"
    },
    {
        "key": "cmd+shift+j",
        "command": "workbench.action.quickOpenSelectPrevious",
        "when": "inProjectManagerList && isMac"
    },
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

## Working with Remotes

The extension support [Remote Development](https://code.visualstudio.com/docs/remote/remote-overview) scenarios, and you may choose how to use it, depending on your needs

### I access Remotes, but most of my work is Local

This is the _regular_ scenario, and that's why you don't need to do anything special for the extension to work. It works out of the box.

When installed locally, you can save any Container, SSH, WSL or Codespaces projects as Favorites. Each one will have its own icon to be properly identified, and when you select them, VS Code will open the remote automatically.

_It just works_

### But what if I do most of my work on Remotes

If you normally connect to remotes (like SSH/WSL) and would like to save Favorite projects on that remote, or to be able to auto-detect repos located on that remote, you must activate/install the extension to work on remotes. 

You just have to add the lines below on your `User Settings`.

```json
    "remote.extensionKind": {
        "exeldtarkus.easy-manager-projects": [
            "workspace"
        ]
    },
```

> More details on [VS Code documentation](https://code.visualstudio.com/docs/remote/containers#_advanced-forcing-an-extension-to-run-locally-or-remotely)

## WSL ⇄ Windows

When you work on Windows with WSL, folders like `\\wsl$\<distro>\...` or `\\wsl.localhost\<distro>\...` open very slowly as a local UNC folder. **Easy Manager Projects** fixes that:

* Projects under `\\wsl$\<distro>\...` or `\\wsl.localhost\<distro>\...` (saved as Favorites or auto-detected via `baseFolders`) open as a **WSL remote window** (`vscode-remote://wsl+<distro>/...`).
* **Open in WSL** (Side Bar context menu, Windows only)
  * A Windows-drive project such as `C:\src\app` opens in WSL as `/mnt/c/src/app`, using the distro set in `easyManagerProjects.wsl.distro`.
  * A WSL UNC path uses its own distro.
* **Open in Windows** (Side Bar context menu, Windows only)
  * A WSL project such as `vscode-remote://wsl+Ubuntu/home/u/app` opens locally as `\\wsl.localhost\Ubuntu\home\u\app`.
  * A `/mnt/c/...` path maps back to `C:\...`.

Set the distro used for Windows-drive projects (default `""`):

```json
    "easyManagerProjects.wsl.distro": "Ubuntu"
```

> **Limitation:** the default WSL automount root `/mnt/` is assumed. A custom `root` in `/etc/wsl.conf` is not supported.

## Migrating from Project Manager

Favorites are stored per extension, so your favorites from the original **Project Manager** are not shared automatically. To bring them over, either:

* Copy `projects.json` from the original extension's globalStorage folder (`alefragnani.project-manager`) into this extension's folder (`exeldtarkus.easy-manager-projects`), or
* Point `easyManagerProjects.projectsLocation` at the folder that holds your `projects.json`.

Settings must also be renamed: replace the `projectManager` prefix with `easyManagerProjects` in your `settings.json`.

## Available Settings

You can choose how your projects are sorted

* `Saved`: The order that you saved the projects
* `Name`: The name that you typed for the project
* `Path`: The full path of the project
* `Recent`: The recently used projects

```json
    "easyManagerProjects.sortList": "Name"
```

![List](docs/images/project-manager-list-sort-by-name.png)

* Choose if the project list must be grouped by its _kind_ (**Favorites**, **Git**, **Mercurial**, **SVN** and **VS Code**).

```json
    "easyManagerProjects.groupList": true
```

* Should the current project be removed from the list? (`false` by default)

```json
    "easyManagerProjects.removeCurrentProjectFromList": true
```

* Should identify _invalid paths_ on project list? (`true` by default)

```json 
    "easyManagerProjects.checkInvalidPathsBeforeListing": false
```

* Should support symlinks on `baseFolders`? (`false` by default)

```json 
    "easyManagerProjects.supportSymlinksOnBaseFolders": true
```

* Should show the parent folder info when projects with same name are detected? (`false` by default)

```json 
    "easyManagerProjects.showParentFolderInfoOnDuplicates": true
```

* Filter Projects Through Full Path (`false` by default)

```json 
    "easyManagerProjects.filterOnFullPath": true
```

* Custom projects file (`projects.json`) location

If you intend to _share_ projects between  **Stable** and **Insider** installations, or if you store your settings in different locations (cloud services), you can indicate an _alternative_ location (folder path) for the `projects.json` file.

```json
    "easyManagerProjects.projectsLocation": "C:\\Users\\myUser\\AppData\\Roaming\\Code\\User"
```

> You can use `~` or `$home` while defining the folder path. It will be replaced by your HOME folder.

* Automatic Detection of Projects (**Git** ![git](docs/images/ico_git_branch.png), **Mercurial** ![git](docs/images/ico_git_branch.png), **SVN** ![svn](docs/images/ico_svn.png) and **VSCode** ![vscode](docs/images/ico_file_code.png))

```json
    "easyManagerProjects.git.baseFolders": [
        "c:\\Projects\\code",
        "d:\\MoreProjects\\code-*",
        "$home\\personal-coding"
    ]
```
> Indicates folders or [glob patterns](https://code.visualstudio.com/docs/editor/glob-patterns) to search for projects

```json
    "easyManagerProjects.git.ignoredFolders": [
        "node_modules", 
        "out", 
        "typings", 
        "test",
        "fork*"
    ],
```
> Indicates folders or [glob patterns](https://code.visualstudio.com/docs/editor/glob-patterns) to be ignored when searching for projects

```json
    "easyManagerProjects.git.maxDepthRecursion": 4
```
> Define how deeps it should search for projects

* Exclude the base folders themselves from the auto-detected projects list (`false` by default)

```json
    "easyManagerProjects.any.excludeBaseFoldersFromResults": true
```
> When enabled, the **Any** base folders configured in `easyManagerProjects.any.baseFolders` are not returned as projects themselves, only their matching subfolders are.

* Should ignore projects found inside other projects? (`false` by default)

```json 
    "easyManagerProjects.ignoreProjectsWithinProjects": true
```

* Cache automatically detected projects (`true` by default)

```json 
    "easyManagerProjects.cacheProjectsBetweenSessions": false
```

* Display the Project Name in Status Bar (`true` by default)

```json 
    "easyManagerProjects.showProjectNameInStatusBar": true
```

* Open projects in _New Window_ when clicking in status bar (`false` by default)

```json 
    "easyManagerProjects.openInNewWindowWhenClickingInStatusBar": true
```

* Indicates if the `New Window` command should open the project in current window, when empty (`always` by default)

  * `always`: Whenever you call the Open in New Window command, it will open in the current window, if empty
  * `onlyUsingCommandPalette`: Only open in the current window if you use the Command Palette
  * `onlyUsingSideBar`: Only open in the current window if you use the Side Bar
  * `never`: Works as today. The Open in New Window command will always open in New Window

```json 
    "easyManagerProjects.openInCurrentWindowIfEmpty": "always"
```

* Indicates the list of tags you can use to organize your projects _(`Personal` and `Work` by default)_

```json
    "easyManagerProjects.tags": [
        "Personal", 
        "Work",
        "VS Code",
        "Learning"
    ]
```

* Controls how tag groups in the Favorites view are expanded or collapsed, and whether their state is remembered (`startExpanded` by default)

  * `alwaysExpanded`: Tag groups are always expanded
  * `alwaysCollapsed`: Tag groups are always collapsed
  * `startExpanded`: Tag groups start expanded and remember your last expand/collapse state
  * `startCollapsed`: Tag groups start collapsed and remember your last expand/collapse state

```json
    "easyManagerProjects.tags.collapseItems": "startExpanded"
```

* Show the current Git branch name for projects (`"never"` by default)

```json
    "easyManagerProjects.git.showBranchName": "never"
```

Supported values:
- `"never"`: Never display the Git branch name
- `"onlyInSideBar"`: Display the Git branch name only in the Side Bar
- `"onlyInCommandPalette"`: Display the Git branch name only in the Command Palette
- `"always"`: Display the Git branch name in all locations


## Available Colors

* Choose the foreground color to highlight the current project in the Side Bar
```json
    "workbench.colorCustomizations": {
      "easyManagerProjects.sideBar.currentProjectHighlightForeground": "#e13015"  
    }
```

## Side Bar

The **Easy Manager Projects** extension has its own **Side Bar**, with a variety of commands to improve your productivity. 

![Side Bar](docs/images/vscode-project-manager-side-bar.png)

### Project Tags - View and Filter

Starting in v12.3, you can now organize your Projects with **Tags**. 

You can define your custom tags (via `easyManagerProjects.tags` setting), define multiple **tags** for each project, and filter the projects based on their **tags**. 

![Side Bar](docs/images/vscode-project-manager-side-bar-tags.gif)

## Extension API

If you are an extension developer and would like to interact with the **Easy Manager Projects** extension, you can use its public API. 

First, you must add an `extensionDependencies` entry in your `package.json` file:

```json
  "extensionDependencies": [
    "exeldtarkus.easy-manager-projects"
  ],
```

Then, retrieve the extension instance with `vscode.extensions.getExtension("exeldtarkus.easy-manager-projects")` in your source code, to be able to use the methods that the extension exposes.

```ts
import { ProjectManagerPublicApi } from './api/projectManager/api';

async function useProjectManagerApi() {
    const projectManagerApi = <ProjectManagerPublicApi>vscode.extensions.getExtension('exeldtarkus.easy-manager-projects')?.exports;

    await projectManagerApi.saveProject("My Project", "/path/to/project", ["work"], "Default");
}
```

The contract is defined at [/api/api.d.ts](/api/api.d.ts).

> More details on [VS Code Extension API reference](https://code.visualstudio.com/api/references/vscode-api#extensions)

## Installation and Configuration

You should follow the official documentation to:

- [Install the extension](https://code.visualstudio.com/docs/editor/extension-gallery)
- [Modify its settings](https://code.visualstudio.com/docs/getstarted/settings)

# License

[GPL-3.0 with VS Code Extension Host API Exception](LICENSE.md) &copy; Alessandro Fragnani (original [Project Manager](https://github.com/alefragnani/vscode-project-manager)), fork maintained by exeldtarkus
