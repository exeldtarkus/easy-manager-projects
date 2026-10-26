/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the GPLv3 License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { Uri } from "vscode";
import { isRemotePath, REMOTE_PREFIX } from "./remote";
import { parseWslUncPath, windowsPathToWsl, WslLocation, wslToWindowsPath } from "./wsl";

const WSL_AUTHORITY_PREFIX = "wsl+";

function buildWslRemoteUri(location: WslLocation): Uri {
    return Uri.from({ scheme: REMOTE_PREFIX, authority: `${WSL_AUTHORITY_PREFIX}${location.distro}`, path: location.path });
}

export function buildProjectUri(rootPath: string): Uri {
    if (isRemotePath(rootPath)) {
        return Uri.parse(rootPath);
    }

    // WSL folders reached through `\\wsl$` / `\\wsl.localhost` open in a WSL remote window, not as a slow local UNC folder
    const wsl = parseWslUncPath(rootPath);
    return wsl ? buildWslRemoteUri(wsl) : Uri.file(rootPath);
}

export function buildWslProjectUri(rootPath: string, distro: string): Uri | undefined {
    if (isRemotePath(rootPath)) {
        return undefined;
    }
    const location = windowsPathToWsl(rootPath, distro);
    return location ? buildWslRemoteUri(location) : undefined;
}

export function buildWindowsProjectUri(rootPath: string): Uri | undefined {
    if (!isRemotePath(rootPath)) {
        return parseWslUncPath(rootPath) ? Uri.file(rootPath) : undefined;
    }

    const uri = Uri.parse(rootPath);
    if (uri.scheme !== REMOTE_PREFIX || !uri.authority.startsWith(WSL_AUTHORITY_PREFIX)) {
        return undefined;
    }
    return Uri.file(wslToWindowsPath({ distro: uri.authority.substring(WSL_AUTHORITY_PREFIX.length), path: uri.path }));
}
