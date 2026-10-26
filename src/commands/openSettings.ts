/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the GPLv3 License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { commands } from "vscode";
import { Container } from "../core/container";

function openSettings(kind?: string) {
    commands.executeCommand("workbench.action.openSettings", kind ? `easyManagerProjects.${kind}` : "easyManagerProjects");
}


export function registerOpenSettings() {
    Container.context.subscriptions.push(commands.registerCommand("easyManagerProjects.openSettings#sideBarFavorites", () => openSettings()));
    Container.context.subscriptions.push(commands.registerCommand("easyManagerProjects.openSettings#sideBarVSCode", () => openSettings("vscode")));
    Container.context.subscriptions.push(commands.registerCommand("easyManagerProjects.openSettings#sideBarSVN", () => openSettings("svn")));
    Container.context.subscriptions.push(commands.registerCommand("easyManagerProjects.openSettings#sideBarGit", () => openSettings("git")));
    Container.context.subscriptions.push(commands.registerCommand("easyManagerProjects.openSettings#sideBarAny", () => openSettings("any")));
    Container.context.subscriptions.push(commands.registerCommand("easyManagerProjects.openSettings#sideBarMercurial", () => openSettings("hg")));
}