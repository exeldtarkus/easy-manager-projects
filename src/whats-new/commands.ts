/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the GPLv3 License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { commands } from "vscode";
import { Container } from "../core/container";
import { WhatsNewManager } from "../../vscode-whats-new/src/Manager";
import { ProjectManagerContentProvider, ProjectManagerSocialMediaProvider } from "./contentProvider";

export function registerWhatsNew() {
    const provider = new ProjectManagerContentProvider();
    const viewer = new WhatsNewManager(Container.context)
        .registerContentProvider("exeldtarkus", "easy-manager-projects", provider)
        .registerSocialMediaProvider(new ProjectManagerSocialMediaProvider());
    viewer.showPageInActivation();
    Container.context.subscriptions.push(commands.registerCommand("easyManagerProjects.whatsNew", () => viewer.showPage()));
    Container.context.subscriptions.push(commands.registerCommand("_easyManagerProjects.whatsNewContextMenu", () => viewer.showPage()));
}
