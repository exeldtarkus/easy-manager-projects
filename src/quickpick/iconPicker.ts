/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the GPLv3 License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { l10n, window } from "vscode";
import { codicons } from "vscode-ext-codicons";

// returns the codicon id (e.g. `rocket`), "" for "No icon" (only with allowNone), or undefined when the user cancels
export async function pickIcon(allowNone = false, current?: string): Promise<string | undefined> {
    const items = Object.values(codicons).map(icon => {
        const id = icon.substring(2, icon.length - 1);
        return { label: `${icon} ${id}`, id };
    });
    if (allowNone) {
        items.unshift({ label: `$(close) ${l10n.t("No icon")}`, id: "" });
    }
    // Enter right away keeps what the project already has
    if (current) {
        items.unshift({ label: `$(${current}) ${l10n.t("Keep current icon ({0})", current)}`, id: current });
    }
    const picked = await window.showQuickPick(items, { placeHolder: l10n.t("Select an icon for the project") });
    return picked?.id;
}
