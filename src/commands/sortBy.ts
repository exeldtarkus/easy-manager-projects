/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the GPLv3 License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { commands, ConfigurationTarget, workspace } from "vscode";
import { Container } from "../core/container";

function toggleSortBy(sortBy: string) {
    commands.executeCommand("setContext", "easyManagerProjects.sortBy", sortBy);
    workspace.getConfiguration("easyManagerProjects").update("sortList", sortBy, ConfigurationTarget.Global);
}

export function registerSortBy() {
    updateSortByContext();
    Container.context.subscriptions.push(commands.registerCommand("_easyManagerProjects.sortBySaved#sideBarFavorites", () => toggleSortBy("Saved")));
    Container.context.subscriptions.push(commands.registerCommand("_easyManagerProjects.sortByName#sideBarFavorites", () => toggleSortBy("Name")));
    Container.context.subscriptions.push(commands.registerCommand("_easyManagerProjects.sortByPath#sideBarFavorites", () => toggleSortBy("Path")));
    Container.context.subscriptions.push(commands.registerCommand("_easyManagerProjects.sortByRecent#sideBarFavorites", () => toggleSortBy("Recent")));
}

export function updateSortByContext() {
    const sortBy = workspace.getConfiguration("easyManagerProjects").get<string>("sortList", "Name");
    commands.executeCommand("setContext", "easyManagerProjects.sortBy", sortBy);
}
