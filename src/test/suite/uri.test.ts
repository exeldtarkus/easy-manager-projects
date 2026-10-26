/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the GPLv3 License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import * as assert from "assert";
import { buildProjectUri, buildWindowsProjectUri, buildWslProjectUri } from "../../utils/uri";

suite("URI utils", () => {

    test("buildProjectUri opens WSL UNC paths as a WSL remote", () => {
        const uri = buildProjectUri("\\\\wsl.localhost\\Ubuntu\\home\\user\\C#");
        assert.strictEqual(uri.scheme, "vscode-remote");
        assert.strictEqual(uri.authority, "wsl+Ubuntu");
        assert.strictEqual(uri.path, "/home/user/C#");
    });

    test("buildProjectUri keeps remote URIs and local paths as before", () => {
        assert.strictEqual(buildProjectUri("vscode-remote://ssh-remote%2Bhost/home/u").authority, "ssh-remote+host");
        assert.strictEqual(buildProjectUri("/home/user/app").scheme, "file");
    });

    test("buildWslProjectUri", () => {
        const uri = buildWslProjectUri("C:\\src\\app", "Ubuntu");
        assert.strictEqual(uri?.authority, "wsl+Ubuntu");
        assert.strictEqual(uri?.path, "/mnt/c/src/app");
        assert.strictEqual(buildWslProjectUri("C:\\src\\app", ""), undefined);
        assert.strictEqual(buildWslProjectUri("vscode-remote://wsl%2BUbuntu/home/u", "Ubuntu"), undefined);
    });

    test("buildWindowsProjectUri", () => {
        assert.strictEqual(buildWindowsProjectUri("vscode-remote://wsl%2BUbuntu/home/u")?.scheme, "file");
        assert.strictEqual(buildWindowsProjectUri("vscode-remote://ssh-remote%2Bhost/home/u"), undefined);
        assert.strictEqual(buildWindowsProjectUri("C:\\src\\app"), undefined);
        assert.strictEqual(buildWindowsProjectUri("\\\\wsl$\\Ubuntu\\home\\u")?.scheme, "file");
    });
});
