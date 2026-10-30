/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the GPLv3 License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { commands } from "vscode";
import { Container } from "../core/container";

function openSettings(kind?: string) {
    commands.executeCommand("workbench.action.openSettings", kind ? `lemari.${kind}` : "lemari");
}


export function registerOpenSettings() {
    Container.context.subscriptions.push(commands.registerCommand("lemari.openSettings#sideBarFavorites", () => openSettings()));
    Container.context.subscriptions.push(commands.registerCommand("lemari.openSettings#sideBarVSCode", () => openSettings("vscode")));
    Container.context.subscriptions.push(commands.registerCommand("lemari.openSettings#sideBarSVN", () => openSettings("svn")));
    Container.context.subscriptions.push(commands.registerCommand("lemari.openSettings#sideBarGit", () => openSettings("git")));
    Container.context.subscriptions.push(commands.registerCommand("lemari.openSettings#sideBarAny", () => openSettings("any")));
    Container.context.subscriptions.push(commands.registerCommand("lemari.openSettings#sideBarMercurial", () => openSettings("hg")));
}