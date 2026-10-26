/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the GPLv3 License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

export interface WslLocation {
    distro: string;
    path: string;
}

// `\\wsl$\<distro>\...` or `\\wsl.localhost\<distro>\...`
const WSL_UNC = /^\\\\wsl(?:\$|\.localhost)\\([^\\]+)(\\.*)?$/i;
const DRIVE = /^([a-zA-Z]):(?:[\\/](.*))?$/;

export function parseWslUncPath(windowsPath: string): WslLocation | undefined {
    const match = WSL_UNC.exec(windowsPath);
    if (!match) {
        return undefined;
    }
    return { distro: match[ 1 ], path: (match[ 2 ] || "\\").replace(/\\/g, "/") };
}

// shortcut: assumes the default WSL automount root `/mnt/`, add a setting if someone uses a custom `automount.root`
export function windowsPathToWsl(windowsPath: string, distro: string): WslLocation | undefined {
    const unc = parseWslUncPath(windowsPath);
    if (unc) {
        return unc;
    }

    const match = DRIVE.exec(windowsPath);
    if (!match || !distro) {
        return undefined;
    }
    const rest = (match[ 2 ] || "").replace(/\\/g, "/");
    return { distro, path: `/mnt/${match[ 1 ].toLowerCase()}/${rest}` };
}

export function wslToWindowsPath(location: WslLocation): string {
    const mounted = /^\/mnt\/([a-zA-Z])(?:\/(.*))?$/.exec(location.path);
    if (mounted) {
        return `${mounted[ 1 ].toUpperCase()}:\\${(mounted[ 2 ] || "").replace(/\//g, "\\")}`;
    }
    return `\\\\wsl.localhost\\${location.distro}${location.path.replace(/\//g, "\\")}`;
}
