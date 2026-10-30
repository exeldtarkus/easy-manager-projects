/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the GPLv3 License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { commands, ConfigurationTarget, workspace } from "vscode";
import { Container } from "../core/container";

function toggleSortBy(sortBy: string) {
    commands.executeCommand("setContext", "lemari.sortBy", sortBy);
    workspace.getConfiguration("lemari").update("sortList", sortBy, ConfigurationTarget.Global);
}

export function registerSortBy() {
    updateSortByContext();
    Container.context.subscriptions.push(commands.registerCommand("_lemari.sortBySaved#sideBarFavorites", () => toggleSortBy("Saved")));
    Container.context.subscriptions.push(commands.registerCommand("_lemari.sortByName#sideBarFavorites", () => toggleSortBy("Name")));
    Container.context.subscriptions.push(commands.registerCommand("_lemari.sortByPath#sideBarFavorites", () => toggleSortBy("Path")));
    Container.context.subscriptions.push(commands.registerCommand("_lemari.sortByRecent#sideBarFavorites", () => toggleSortBy("Recent")));
}

export function updateSortByContext() {
    const sortBy = workspace.getConfiguration("lemari").get<string>("sortList", "Name");
    commands.executeCommand("setContext", "lemari.sortBy", sortBy);
}
