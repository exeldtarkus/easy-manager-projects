/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the GPLv3 License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { commands, env, ViewColumn, window } from "vscode";
import { Container } from "../core/container";
import { buildWhatsNewHtml, isNewerMinor, PAGE_COMMANDS } from "./page";

// same key the previous What's New used, so upgrading does not show the page twice
const VERSION_KEY = "easy-manager-projects.version";

function showPage() {
    const version: string = Container.context.extension.packageJSON.version;
    const panel = window.createWebviewPanel("easy-manager-projects.whatsNew", "What's New in Easy Projects Manager", ViewColumn.One,
        { enableCommandUris: PAGE_COMMANDS });
    panel.webview.html = buildWhatsNewHtml(panel.webview.cspSource, version);
}

export function registerWhatsNew() {
    Container.context.subscriptions.push(commands.registerCommand("easyManagerProjects.whatsNew", showPage));
    Container.context.subscriptions.push(commands.registerCommand("_easyManagerProjects.whatsNewContextMenu", showPage));

    const version: string = Container.context.extension.packageJSON.version;
    const previous = Container.context.globalState.get<string>(VERSION_KEY);
    Container.context.globalState.update(VERSION_KEY, version);
    // shortcut: no "only in the focused window" check like the old page, add it if several windows pop the page at once
    if (isNewerMinor(version, previous) && env.remoteName?.toLowerCase() !== "codespaces") {
        showPage();
    }
}
