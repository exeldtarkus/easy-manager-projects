/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the GPLv3 License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import fs = require("fs");
import path = require("path");
import { execFile } from "child_process";
import * as vscode from "vscode";

import { Locators } from "./autodetect/locators";
import { ProjectStorage } from "./storage/storage";
import { PathUtils } from "./utils/path";

import { Providers } from "./sidebar/providers";
import { StorageProvider } from "./sidebar/storageProvider";

import { showStatusBar, updateStatusBar } from "./statusbar/statusBar";
import { getProjectDetails } from "./utils/suggestion";
import { CommandLocation, PROJECTS_FILE } from "./core/constants";
import { isMacOS, isRemotePath, isRemoteUri, isWindows } from "./utils/remote";
import { buildProjectUri, buildWindowsProjectUri, buildWslProjectUri } from "./utils/uri";
import { missingWslUncHosts, parseDefaultWslDistro, parseWslUncPath } from "./utils/wsl";
import { Container } from "./core/container";
import { registerWhatsNew } from "./whats-new/commands";
import { registerSupportProjectManager } from "./commands/supportProjectManager";
import { registerHelpAndFeedbackView } from "./sidebar/helpAndFeedbackView";
import { registerRevealFileInOS } from "./commands/revealFileInOS";
import { registerOpenSettings } from "./commands/openSettings";
import { pickTags } from "./quickpick/tagsPicker";
import { pickIcon } from "./quickpick/iconPicker";
import { ViewFavoritesAs } from "./sidebar/constants";
import { registerSortBy, updateSortByContext } from "./commands/sortBy";
import { canSwitchOnActiveWindow, openPickedProject, pickOpenInNewWindow, pickProjects, shouldOpenInNewWindow } from "./quickpick/projectsPicker";
import { CustomProjectLocator } from "./autodetect/abstractLocator";
import { l10n } from "vscode";
import { registerWalkthrough } from "./commands/walkthrough";
import { registerSideBarDecorations } from "./sidebar/decoration";
import { ProjectNode } from "./sidebar/nodes";
import { Project } from "./core/project";
import { ProjectManagerApiImpl } from "./api/apiImpl";

let locators: Locators;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

    Container.initialize(context);

    // Sets storage path if recommended path provided by current version of VS Code.  
    PathUtils.setExtensionContext(context);

    // load the projects
    locators = new Locators();
    const projectStorage: ProjectStorage = new ProjectStorage(getProjectFilePath());
    const api = new ProjectManagerApiImpl(projectStorage, locators);

    const providerManager: Providers = new Providers(locators, projectStorage);
    locators.setProviderManager(providerManager);

    registerRevealFileInOS();
    registerOpenSettings();
    registerSupportProjectManager();
    registerHelpAndFeedbackView(context);
    registerSortBy();
    registerSideBarDecorations();
    await registerWalkthrough();

    registerWhatsNew();
    allowWslUncHosts();

    context.subscriptions.push(vscode.commands.registerCommand("_easyManagerProjects.openFolderWelcome", () => {
        const openFolderCommand = isWindows || isMacOS ? "workbench.action.files.openFolder" : "workbench.action.files.openFileFolder";
        vscode.commands.executeCommand(openFolderCommand);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("easyManagerProjects.hideGitWelcome", () => {
        context.globalState.update("hideGitWelcome", true);
        providerManager.showTreeViewFromAllProviders();
        vscode.commands.executeCommand("setContext", "easyManagerProjects.hiddenGitWelcome", true);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("easyManagerProjects.showGitWelcome", () => {
        context.globalState.update("hideGitWelcome", false);
        providerManager.showTreeViewFromAllProviders();
        vscode.commands.executeCommand("setContext", "easyManagerProjects.hiddenGitWelcome", false);
    }));
    const hideGitWelcome = context.globalState.get<boolean>("hideGitWelcome", false);
    vscode.commands.executeCommand("setContext", "easyManagerProjects.hiddenGitWelcome", hideGitWelcome);

    vscode.commands.registerCommand("_easyManagerProjects.open", async (projectPath: string, projectName: string, profile: string) => {
        const uri = buildProjectUri(projectPath);
        // the explicit window choice also answers the "switch active window" confirmation
        const newWindow = await pickOpenInNewWindow(projectName);
        if (newWindow === undefined) {
            return;
        }
        vscode.commands.executeCommand("vscode.openFolder", uri, { forceProfile: profile , forceNewWindow: newWindow } )
            .then(
                () => ({}),  // done
                () => vscode.window.showInformationMessage(l10n.t("Could not open the project!")));
    });
    vscode.commands.registerCommand("_easyManagerProjects.openInNewWindow", (node) => {
        const uri = buildProjectUri(node.command.arguments[0]);
        const openInNewWindow = shouldOpenInNewWindow(true, CommandLocation.SideBar);
        vscode.commands.executeCommand("vscode.openFolder", uri, { forceProfile: node.command.arguments[2] , forceNewWindow: openInNewWindow } )
            .then(
                () => ({}),  // done
                () => vscode.window.showInformationMessage(l10n.t("Could not open the project!")));
    });
    vscode.commands.registerCommand("_easyManagerProjects.openInWsl", async (node) => {
        const rootPath: string = node.command.arguments[0];
        // WSL UNC paths carry their own distro, Windows drives use the default one
        const distro = parseWslUncPath(rootPath) ? "" : await getDefaultWslDistro();
        openOnOtherSide(node, buildWslProjectUri(rootPath, distro),
            l10n.t("This project can't be opened in WSL. No default WSL distribution was found."));
    });
    vscode.commands.registerCommand("_easyManagerProjects.openInWindows", (node) => {
        openOnOtherSide(node, buildWindowsProjectUri(node.command.arguments[0]),
            l10n.t("This project can't be opened in Windows. Only WSL projects are supported."));
    });

    async function openOnOtherSide(node, uri: vscode.Uri | undefined, unsupportedMessage: string) {
        if (!uri) {
            vscode.window.showInformationMessage(unsupportedMessage);
            return;
        }
        if (!await canSwitchOnActiveWindow(CommandLocation.SideBar)) {
            return;
        }
        vscode.commands.executeCommand("vscode.openFolder", uri, { forceProfile: node.command.arguments[2], forceNewWindow: false })
            .then(
                () => ({}),  // done
                () => vscode.window.showInformationMessage(l10n.t("Could not open the project!")));
    }

    // register commands (here, because it needs to be used right below if an invalid JSON is present)
    vscode.commands.registerCommand("easyManagerProjects.saveProject", () => saveProject());
    vscode.commands.registerCommand("easyManagerProjects.addFolderToFavorites", () => addFolderToFavorites());
    vscode.commands.registerCommand("easyManagerProjects.refreshProjects", () => refreshProjects(true, true));
    locators.registerCommands();
    vscode.commands.registerCommand("easyManagerProjects.editProjects", () => editProjects());
    vscode.commands.registerCommand("easyManagerProjects.listProjects", () => listProjects(false));
    vscode.commands.registerCommand("easyManagerProjects.listProjectsNewWindow", () => listProjects(true));
    
    vscode.commands.registerCommand("easyManagerProjects.listFavoriteProjects#sideBarFavorites", () => listStorageProjects());
    vscode.commands.registerCommand("easyManagerProjects.listGitProjects#sideBarGit", () => listAutoDetectedProjects(locators.gitLocator));
    vscode.commands.registerCommand("easyManagerProjects.listVSCodeProjects#sideBarVSCode", () => listAutoDetectedProjects(locators.vscLocator));
    vscode.commands.registerCommand("easyManagerProjects.listSVNProjects#sideBarSVN", () => listAutoDetectedProjects(locators.svnLocator));
    vscode.commands.registerCommand("easyManagerProjects.listMercurialProjects#sideBarMercurial", () => listAutoDetectedProjects(locators.mercurialLocator));
    vscode.commands.registerCommand("easyManagerProjects.listAnyProjects#sideBarAny", () => listAutoDetectedProjects(locators.anyLocator));

    // new commands (ActivityBar)
    vscode.commands.registerCommand("easyManagerProjects.addToWorkspace#sideBar", (node) => addProjectToWorkspace(node));
    vscode.commands.registerCommand("easyManagerProjects.addToWorkspace", () => addProjectToWorkspace(undefined));
    vscode.commands.registerCommand("_easyManagerProjects.deleteProject", (node) => deleteProject(node));
    vscode.commands.registerCommand("_easyManagerProjects.renameProject", (node) => renameProject(node));
    vscode.commands.registerCommand("_easyManagerProjects.editTags", (node) => editTags(node));
    vscode.commands.registerCommand("_easyManagerProjects.editIcon", (node) => editIcon(node));
    vscode.commands.registerCommand("_easyManagerProjects.editPath", (node) => editPath(node));
    vscode.commands.registerCommand("easyManagerProjects.addToFavorites", (node) => saveProject(node));
    vscode.commands.registerCommand("_easyManagerProjects.toggleProjectEnabled", (node) => toggleProjectEnabled(node));

    const viewAsList = Container.context.globalState.get<boolean>("viewAsList", true);
    vscode.commands.executeCommand("setContext", "easyManagerProjects.viewAsList", viewAsList);
    vscode.commands.registerCommand("_easyManagerProjects.viewAsTags#sideBarFavorites", () => toggleViewAsFavoriteProjects(ViewFavoritesAs.VIEW_AS_TAGS));
    vscode.commands.registerCommand("_easyManagerProjects.viewAsList#sideBarFavorites", () => toggleViewAsFavoriteProjects(ViewFavoritesAs.VIEW_AS_LIST));
    vscode.commands.registerCommand("easyManagerProjects.filterProjectsByTag", () => filterProjectsByTag());
    vscode.commands.registerCommand("easyManagerProjects.filterProjectsByTag#sideBar", () => filterProjectsByTag());

    function toggleViewAsFavoriteProjects(view: ViewFavoritesAs) {
        if (view === ViewFavoritesAs.VIEW_AS_LIST) {
            vscode.commands.executeCommand("setContext", "easyManagerProjects.viewAsList", true);
        } else {
            vscode.commands.executeCommand("setContext", "easyManagerProjects.viewAsList", false);
        }
        Container.context.globalState.update("viewAsList", view === ViewFavoritesAs.VIEW_AS_LIST);
        providerManager.refreshTreeViews();
    }

    async function filterProjectsByTag() {
        const filterByTags = Container.context.globalState.get<string[]>("filterByTags", []);

        const tags = await pickTags(projectStorage, filterByTags, {
            useDefaultTags: false,
            useNoTagsDefined: true,
            showWarningWhenHasNoTagsToPick: true
        });

        if (!tags) {
            return;
        }

        Container.context.globalState.update("filterByTags", tags);
        providerManager.refreshStorageTreeView();
    }

    loadProjectsFile();

    // TODO: Extract the detection of the current project from `showStatusBar`, and optimize how it works.
    // Evaluate if it is really necessary to get the `Project` instance, or if just the root path is enough.
    // Up until then, the call to `showStatusBar` (and the assignment to `Container.currentProject`)
    // intentionally happens *before* `providerManager.showTreeViewFromAllProviders()`, and changing this order may
    // introduce issues.
    const currentProject = showStatusBar(projectStorage, locators);
    Container.currentProject = currentProject;

    // // new place to register TreeView
    await providerManager.showTreeViewFromAllProviders();

    fs.watchFile(getProjectFilePath(), () => {
        loadProjectsFile();
        providerManager.storageProvider.refresh();
        providerManager.updateTreeViewStorage();
    });

    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(async cfg => {
        if (cfg.affectsConfiguration("easyManagerProjects.git") || cfg.affectsConfiguration("easyManagerProjects.hg") ||
            cfg.affectsConfiguration("easyManagerProjects.vscode") || cfg.affectsConfiguration("easyManagerProjects.svn") || 
            cfg.affectsConfiguration("easyManagerProjects.any") || 
            cfg.affectsConfiguration("easyManagerProjects.ignoreProjectsWithinProjects") || 
            cfg.affectsConfiguration("easyManagerProjects.supportSymlinksOnBaseFolders")) {
            allowWslUncHosts();
            refreshProjects();
        }

        if (cfg.affectsConfiguration("workbench.iconTheme")) {
            providerManager.refreshTreeViews();
        }

        if (cfg.affectsConfiguration("easyManagerProjects.sortList")) {
            updateSortByContext();
            providerManager.storageProvider.refresh();
            providerManager.updateTreeViewStorage();
        }

        if (cfg.affectsConfiguration("easyManagerProjects.showParentFolderInfoOnDuplicates")) {
            providerManager.refreshTreeViews();
        }

        if (cfg.affectsConfiguration("easyManagerProjects.tags.collapseItems")) {
            await StorageProvider.resetTagExpansionState();
            providerManager.refreshStorageTreeView();
        }

        if (cfg.affectsConfiguration("easyManagerProjects.git.showBranchName")) {
            providerManager.storageProvider.refresh();
            providerManager.updateTreeViewStorage();
        }
    }));

    function refreshProjects(showMessage?: boolean, forceRefresh?: boolean) {

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: l10n.t("Refreshing Projects"),
            cancellable: false
        }, async (progress) => {
            progress.report({ message: "VSCode" });
            const rvscode = await locators.vscLocator.refreshProjects(forceRefresh);
        
            progress.report({ message: "Git" });
            const rgit = await locators.gitLocator.refreshProjects(forceRefresh);
        
            progress.report({ message: "Mercurial" });
            const rmercurial = await locators.mercurialLocator.refreshProjects(forceRefresh);
        
            progress.report({ message: "SVN" });
            const rsvn = await locators.svnLocator.refreshProjects(forceRefresh);

            progress.report({ message: "Any" });
            const rany = await locators.anyLocator.refreshProjects(forceRefresh);

            if (rvscode || rgit || rmercurial || rsvn || rany || forceRefresh) {
                progress.report({ message: "Activity Bar"});
                if (rvscode || forceRefresh) {
                    providerManager.vscodeProvider.refresh();
                }
                if (rgit || forceRefresh) {
                    providerManager.gitProvider.refresh();
                }
                if (rmercurial || forceRefresh) {
                    providerManager.mercurialProvider.refresh();
                }
                if (rsvn || forceRefresh) {
                    providerManager.svnProvider.refresh();
                }
                if (rany || forceRefresh) {
                    providerManager.anyProvider.refresh();
                }
                providerManager.showTreeViewFromAllProviders();
            }

            if (showMessage) {
                vscode.window.showInformationMessage(l10n.t("The projects have been refreshed!"));
            }
        });
    }

    function editProjects() {
        if (fs.existsSync(getProjectFilePath())) {
            vscode.workspace.openTextDocument(getProjectFilePath()).then(doc => {
                vscode.window.showTextDocument(doc);
            });
        } else {
            const optionEditProject = <vscode.MessageItem> {
                title: "Yes, edit manually"
            };
            vscode.window.showErrorMessage(l10n.t("No projects saved yet! You should open a folder and use Save Project instead. Do you really want to edit manually? "), optionEditProject).then(option => {
                // nothing selected
                if (typeof option === "undefined") {
                    return;
                }

                if (option.title === l10n.t("Yes, edit manually")) {
                    projectStorage.push("Project Name", "Root Path");
                    projectStorage.save();
                    providerManager.updateTreeViewStorage();
                    vscode.commands.executeCommand("easyManagerProjects.editProjects");
                } else {
                    return;
                }
            });
        }
    }

    // `picked` is a folder chosen in the OS dialog, not the current one, so it must not touch the status bar
    async function saveProject(node?: ProjectNode, picked?: { name: string, path: string }) {
        let wpath: string;
        let rootPath: string;

        if (node) {
            wpath = node.label as string; 
            rootPath = node.command.arguments[0];
        } else if (picked) {
            wpath = picked.name;
            rootPath = picked.path;
        } else {
            const projectDetails = await getProjectDetails();
            if (!projectDetails) {
                return;
            }
            rootPath = projectDetails.path;
            wpath = projectDetails.name;
        }

        let selectedTags: string[] | undefined;
        let selectedIcon: string | undefined;

        const saveProjectInternal = async (projectName: string, tags?: string[]): Promise<boolean> => {
            if (projectName === "") {
                vscode.window.showWarningMessage(l10n.t("You must define a name for the project."));
                return false;
            }

            const tagsToSave = (tags && tags.length > 0) ? tags : undefined;

            if (!projectStorage.exists(projectName)) {
                Container.stack.push(projectName);
                context.globalState.update("recent", Container.stack.toString());
                projectStorage.push(projectName, rootPath);
                if (tagsToSave) {
                    projectStorage.editTags(projectName, tagsToSave);
                }
                if (selectedIcon) {
                    projectStorage.editIcon(projectName, selectedIcon);
                }
                projectStorage.save();
                providerManager.updateTreeViewStorage();
                vscode.window.showInformationMessage(l10n.t("Project saved!"));
                if (!node && !picked) {
                    showStatusBar(projectStorage, locators, projectName);
                    updateCurrentProject();
                }
                return true;
            } else {
                const optionUpdate = <vscode.MessageItem> {
                    title: l10n.t("Update")
                };
                const optionCancel = <vscode.MessageItem> {
                    title: l10n.t("Cancel")
                };

                const option = await vscode.window.showInformationMessage(l10n.t("Project already exists!"), optionUpdate, optionCancel);

                // nothing selected or canceled
                if (typeof option === "undefined" || option.title === l10n.t("Cancel")) {
                    return false;
                }

                if (option.title === l10n.t("Update")) {
                    Container.stack.push(projectName);
                    context.globalState.update("recent", Container.stack.toString());
                    projectStorage.updateRootPath(projectName, rootPath);
                    if (tagsToSave) {
                        projectStorage.editTags(projectName, tagsToSave);
                    }
                    if (selectedIcon) {
                        projectStorage.editIcon(projectName, selectedIcon);
                    }
                    projectStorage.save();
                    providerManager.updateTreeViewStorage();
                    vscode.window.showInformationMessage(l10n.t("Project saved!"));
                    if (!node && !picked) {
                        showStatusBar(projectStorage, locators, projectName);
                    }
                    return true;
                }

                return false;
            }
        };

        const input = vscode.window.createInputBox();
        input.title = l10n.t("Save Project");
        input.prompt = l10n.t("Project Name");
        input.placeholder = l10n.t("Type a name for your project");
        input.value = wpath;

        const tagsButton: vscode.QuickInputButton = {
            iconPath: new vscode.ThemeIcon("tag"),
            tooltip: l10n.t("Select tags")
        };

        const iconButton: vscode.QuickInputButton = {
            iconPath: new vscode.ThemeIcon("symbol-color"),
            tooltip: l10n.t("Select icon")
        };

        input.buttons = [ iconButton, tagsButton ];

        input.onDidAccept(async () => {
            const saved = await saveProjectInternal(input.value, selectedTags);
            if (saved) {
                input.hide();
                input.dispose();
            }
        });

        input.onDidTriggerButton(async (button) => {
            if (button === iconButton) {
                if (input.value === "") {
                    vscode.window.showWarningMessage(l10n.t("You must define a name for the project."));
                    return;
                }
                // the icon picker hides (and disposes) this input, so save right away like the tags button does
                selectedIcon = await pickIcon();
                if (selectedIcon && await saveProjectInternal(input.value, selectedTags)) {
                    input.hide();
                    input.dispose();
                }
                return;
            }
            if (button !== tagsButton) {
                return;
            }

            if (input.value === "") {
                vscode.window.showWarningMessage(l10n.t("You must define a name for the project."));
                return;
            }

            let preselectedTags: string[] = selectedTags ?? [];
            const existingProject = projectStorage.existsWithRootPath(rootPath);
            if (existingProject && existingProject.name.toLowerCase() === input.value.toLowerCase() && (!selectedTags || selectedTags.length === 0)) {
                preselectedTags = existingProject.tags;
            }

            const picked = await pickTags(projectStorage, preselectedTags, {
                useDefaultTags: true,
                useNoTagsDefined: false,
                allowAddingNewTags: true
            });

            if (!picked) {
                return;
            }

            selectedTags = picked;

            if (selectedTags.length > 0) {
                input.prompt = l10n.t("Selected tags: {0}", selectedTags.join(", "));
            } else {
                input.prompt = l10n.t("Project Name");
            }

            const saved = await saveProjectInternal(input.value, selectedTags);
            if (saved) {
                input.hide();
                input.dispose();
            }
        });

        input.onDidHide(() => {
            input.dispose();
        });

        input.show();
    }

    function updateCurrentProject() {
        const workspace0 = vscode.workspace.workspaceFile ? vscode.workspace.workspaceFile :
            vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[ 0 ].uri :
                undefined;
        const currentProjectPath = workspace0 ? workspace0.fsPath : undefined;

        let foundProject: Project;
        if (workspace0 && isRemoteUri(workspace0)) {
            foundProject = projectStorage.existsRemoteWithRootPath(workspace0);
        } else {
            foundProject = projectStorage.existsWithRootPath(currentProjectPath, true);
        }
        Container.currentProject = foundProject;
    }

    async function listProjects(forceNewWindow: boolean) {
        const pick = await pickProjects(projectStorage, locators, !forceNewWindow, undefined);
        if (!pick || forceNewWindow || pick.button) {
            openPickedProject(pick, forceNewWindow, CommandLocation.CommandPalette);
            return;
        }
        const newWindow = await pickOpenInNewWindow(pick.item.name);
        if (newWindow !== undefined) {
            openPickedProject(pick, forceNewWindow, CommandLocation.CommandPalette, newWindow);
        }
    }

    async function listAutoDetectedProjects(locator: CustomProjectLocator) {
        const pick = await pickProjects(undefined, locators, true, locator); 
        openPickedProject(pick, false, CommandLocation.SideBar);
    }

    async function listStorageProjects() {
        const pick = await pickProjects(projectStorage, undefined, true, undefined); 
        openPickedProject(pick, false, CommandLocation.SideBar);
    }

    function loadProjectsFile() {
        const errorLoading: string = projectStorage.load();
        // how to handle now, since the extension starts 'at load'?
        if (errorLoading !== "") {
            const optionOpenFile = <vscode.MessageItem> {
                title: l10n.t("Open File")
            };
            vscode.window.showErrorMessage(l10n.t("Error loading projects.json file."), { modal: true, detail: l10n.t("Message: {0}", errorLoading) }, optionOpenFile).then(option => {
                // nothing selected
                if (typeof option === "undefined") {
                    return;
                }

                if (option.title === l10n.t("Open File")) {
                    vscode.commands.executeCommand("easyManagerProjects.editProjects");
                } else {
                    return;
                }
            });
            return null;
        }
    }

    function getProjectFilePath() {
        let projectFile: string;
        const projectsLocation: string = vscode.workspace.getConfiguration("easyManagerProjects").get<string>("projectsLocation");
        if (projectsLocation !== "") {
            projectFile = path.join(PathUtils.expandHomePath(projectsLocation), PROJECTS_FILE);
        } else {
            projectFile = PathUtils.getFilePathFromAppData(PROJECTS_FILE);
        }
        return projectFile;
    }

    function addProjectPathToWorkspace(projectPath: string) {
        if (path.extname(projectPath) === ".code-workspace") {
            vscode.window.showWarningMessage(l10n.t("You can't add a Workspace to another Workspace."));
            return;
        }
        vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders ? 
            vscode.workspace.workspaceFolders.length : 0, null, { uri: vscode.Uri.file(projectPath)});
    }

    async function addProjectToWorkspace(node: ProjectNode) {
        if (node) {
            addProjectPathToWorkspace(node.command.arguments[0]);
            return;
        }

        const pick = await pickProjects(projectStorage, locators, false, undefined); 
        if (pick) {
            addProjectPathToWorkspace(pick.item.rootPath);
        }
    }

    function deleteProject(node: ProjectNode) {
        Container.stack.pop(node.command.arguments[1]);
        projectStorage.pop(node.command.arguments[1]);
        projectStorage.save();
        providerManager.updateTreeViewStorage();
        vscode.window.showInformationMessage(l10n.t("Project successfully deleted!"));
    }

    function renameProject(node: ProjectNode) {
        const oldName: string = node.command.arguments[1];
        // Display a message box to the user
        // ask the NEW PROJECT NAME ()
        const ibo = <vscode.InputBoxOptions> {
            prompt: l10n.t("New Project Name"),
            placeHolder: l10n.t("Type a new name for the project"),
            value: oldName
        };

        vscode.window.showInputBox(ibo).then(newName => {
            if (typeof newName === "undefined" || newName === oldName) {
                return;
            }

            // 'empty'
            if (newName === "") {
                vscode.window.showWarningMessage(l10n.t("You must define a new name for the project."));
                return;
            }

            if (!projectStorage.exists(newName) || newName.toLowerCase() === oldName.toLowerCase()) {
                Container.stack.rename(oldName, newName);
                projectStorage.rename(oldName, newName);
                projectStorage.save();
                vscode.window.showInformationMessage(l10n.t("Project renamed!"));
                updateStatusBar(oldName, node.command.arguments[0], newName);
            } else {
                vscode.window.showErrorMessage(l10n.t("Project already exists!"));
            }
        });
    }

    async function editTags(node: ProjectNode) {

        const project = projectStorage.existsWithRootPath(node.command.arguments[0]);
        if (!project) {
            return;
        }

        const picked = await pickTags(projectStorage, project.tags, {
            useDefaultTags: true,
            useNoTagsDefined: false
        });

        if (picked) {
            projectStorage.editTags(project.name, picked);
            projectStorage.save();
            vscode.window.showInformationMessage(l10n.t("Project updated!"));
        }
    }

    // the native folder dialog of each OS (File Explorer, Finder, GTK/KDE); in a remote window VS Code shows the remote file system
    async function addFolderToFavorites() {
        const uris = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: false,
            openLabel: l10n.t("Add to Favorites"),
            title: l10n.t("Add Folder to Favorites")
        });
        if (!uris || uris.length === 0) {
            return;
        }
        const uri = uris[ 0 ];
        const folderPath = uri.scheme === "file" ? uri.fsPath : uri.toString();
        saveProject(undefined, { name: path.basename(uri.path), path: folderPath });
    }

    async function editPath(node: ProjectNode) {
        const project = projectStorage.existsWithRootPath(node.command.arguments[0]);
        if (!project) {
            return;
        }

        const newPath = await vscode.window.showInputBox({
            prompt: l10n.t("New Project Path"),
            placeHolder: l10n.t("Type a new path for the project"),
            value: project.rootPath,
            validateInput: value => {
                if (value.trim() === "") {
                    return l10n.t("You must define a path for the project.");
                }
                // a warning, not an error: remote URIs or offline drives can still be saved
                if (!isRemotePath(value) && !fs.existsSync(PathUtils.expandHomePath(value.trim()))) {
                    return { message: l10n.t("Path does not exist or is unavailable."), severity: vscode.InputBoxValidationSeverity.Warning };
                }
                return undefined;
            }
        });
        if (newPath === undefined || newPath.trim() === project.rootPath) {
            return;
        }

        projectStorage.updateRootPath(project.name, newPath.trim());
        projectStorage.save();
        providerManager.storageProvider.refresh();
        providerManager.updateTreeViewStorage();
        vscode.window.showInformationMessage(l10n.t("Project updated!"));
    }

    async function editIcon(node: ProjectNode) {
        const project = projectStorage.existsWithRootPath(node.command.arguments[0]);
        if (!project) {
            return;
        }

        const picked = await pickIcon(true);
        if (picked !== undefined) {
            projectStorage.editIcon(project.name, picked);
            projectStorage.save();
            providerManager.storageProvider.refresh();
            providerManager.updateTreeViewStorage();
            vscode.window.showInformationMessage(l10n.t("Project updated!"));
        }
    }

    function toggleProjectEnabled(node: ProjectNode, askForUndo = true) {
        const projectName: string = node.command.arguments[1];
        const enabled: boolean = projectStorage.toggleEnabled(projectName);
        
        if (enabled === undefined) {
            return;
        }

        projectStorage.save();
        providerManager.updateTreeViewStorage();

        if (!askForUndo) {
            return;
        }

        if (enabled) {
            vscode.window.showInformationMessage(l10n.t("Project \"{0}\" enabled.", projectName), "Undo").then(undo => {
                if (undo) {
                    toggleProjectEnabled(node, false);
                }
            });
        } else {
            vscode.window.showInformationMessage(l10n.t("Project \"{0}\" disabled.", projectName), "Undo").then(undo => {
                if (undo) {
                    toggleProjectEnabled(node, false);
                }
            });
        }
            
    }

    return api;
}

function getDefaultWslDistro(): Promise<string> {
    return new Promise(resolve => {
        execFile("wsl.exe", [ "-l", "-v" ], { encoding: "buffer", windowsHide: true }, (error, stdout) => {
            if (error) {
                console.error("getDefaultWslDistro - EXCEPTION CAUGHT | wsl.exe -l -v failed", error);
                resolve("");
                return;
            }
            resolve(parseDefaultWslDistro(stdout.toString(stdout.includes(0) ? "utf16le" : "utf8")) ?? "");
        });
    });
}

// WSL base folders (`\\wsl.localhost\...`) need their UNC host allowed, or VS Code hides them from the scan
async function allowWslUncHosts() {
    if (!isWindows) {
        return;
    }
    const config = vscode.workspace.getConfiguration("easyManagerProjects");
    const baseFolders = [ "git", "hg", "svn", "vscode", "any" ].flatMap(kind => config.get<string[]>(`${kind}.baseFolders`, []));
    const security = vscode.workspace.getConfiguration("security");
    const allowedHosts = security.get<string[]>("allowedUNCHosts", []);
    const missing = missingWslUncHosts(baseFolders, allowedHosts);
    if (missing.length === 0) {
        return;
    }

    try {
        // application scoped: VS Code writes it to the default profile settings
        await security.update("allowedUNCHosts", [ ...allowedHosts, ...missing ], vscode.ConfigurationTarget.Global);
    } catch (error) {
        console.error("allowWslUncHosts - EXCEPTION CAUGHT | Could not update security.allowedUNCHosts", error);
        return;
    }
    const restart = l10n.t("Reload Window");
    const answer = await vscode.window.showInformationMessage(
        l10n.t("Added {0} to `security.allowedUNCHosts` so WSL projects can be detected. Restart VS Code to apply it.", missing.join(", ")), restart);
    if (answer === restart) {
        vscode.commands.executeCommand("workbench.action.reloadWindow");
    }
}

export function deactivate() {

    locators.dispose();
}