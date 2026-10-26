/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the GPLv3 License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import * as assert from "assert";
import { parseWslUncPath, windowsPathToWsl, wslToWindowsPath } from "../../utils/wsl";

suite("WSL utils", () => {

    test("parseWslUncPath handles wsl$ and wsl.localhost", () => {
        assert.deepStrictEqual(parseWslUncPath("\\\\wsl$\\Ubuntu\\home\\user\\app"), { distro: "Ubuntu", path: "/home/user/app" });
        assert.deepStrictEqual(parseWslUncPath("\\\\WSL.localhost\\Ubuntu-22.04\\home\\my app"), { distro: "Ubuntu-22.04", path: "/home/my app" });
        assert.deepStrictEqual(parseWslUncPath("\\\\wsl.localhost\\Ubuntu"), { distro: "Ubuntu", path: "/" });
    });

    test("parseWslUncPath ignores non WSL paths", () => {
        assert.strictEqual(parseWslUncPath("C:\\src\\app"), undefined);
        assert.strictEqual(parseWslUncPath("\\\\server\\share\\app"), undefined);
        assert.strictEqual(parseWslUncPath("/home/user/app"), undefined);
    });

    test("windowsPathToWsl maps drives to /mnt using the given distro", () => {
        assert.deepStrictEqual(windowsPathToWsl("C:\\src\\my app", "Ubuntu"), { distro: "Ubuntu", path: "/mnt/c/src/my app" });
        assert.deepStrictEqual(windowsPathToWsl("d:/work", "Debian"), { distro: "Debian", path: "/mnt/d/work" });
        assert.deepStrictEqual(windowsPathToWsl("E:\\", "Ubuntu"), { distro: "Ubuntu", path: "/mnt/e/" });
    });

    test("windowsPathToWsl needs a distro for drives, but not for WSL UNC paths", () => {
        assert.strictEqual(windowsPathToWsl("C:\\src\\app", ""), undefined);
        assert.deepStrictEqual(windowsPathToWsl("\\\\wsl$\\Ubuntu\\home\\u", ""), { distro: "Ubuntu", path: "/home/u" });
        assert.strictEqual(windowsPathToWsl("\\\\server\\share", "Ubuntu"), undefined);
    });

    test("wslToWindowsPath maps /mnt back to drives and the rest to wsl.localhost", () => {
        assert.strictEqual(wslToWindowsPath({ distro: "Ubuntu", path: "/mnt/c/src/my app" }), "C:\\src\\my app");
        assert.strictEqual(wslToWindowsPath({ distro: "Ubuntu", path: "/mnt/d" }), "D:\\");
        assert.strictEqual(wslToWindowsPath({ distro: "Ubuntu", path: "/home/user/app" }), "\\\\wsl.localhost\\Ubuntu\\home\\user\\app");
        assert.strictEqual(wslToWindowsPath({ distro: "Ubuntu", path: "/mnt/wsl/x" }), "\\\\wsl.localhost\\Ubuntu\\mnt\\wsl\\x");
    });
});
