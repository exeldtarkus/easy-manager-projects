/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the GPLv3 License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import * as assert from "assert";
import { buildWhatsNewHtml, isNewerMinor, RELEASES } from "../../whats-new/page";

suite("What's New page", () => {

    test("isNewerMinor reacts to minor/major updates and first installs only", () => {
        assert.strictEqual(isNewerMinor("1.5.0", undefined), true);
        assert.strictEqual(isNewerMinor("1.5.0", "1.4.0"), true);
        assert.strictEqual(isNewerMinor("2.0.0", "1.9.3"), true);
        assert.strictEqual(isNewerMinor("1.5.1", "1.5.0"), false);
        assert.strictEqual(isNewerMinor("1.5.0", "1.5.0"), false);
        assert.strictEqual(isNewerMinor("1.4.0", "1.5.0"), false);
        assert.strictEqual(isNewerMinor("1.10.0", "1.9.0"), true);
    });

    test("page shows the newest release first and every earlier one", () => {
        const html = buildWhatsNewHtml("vscode-resource:", "1.5.0");
        assert.ok(html.includes(`New in ${RELEASES[0].version}`));
        for (const r of RELEASES.slice(1)) {
            assert.ok(html.includes(`>${r.version}<`), r.version);
        }
        assert.ok(!html.includes("<script"));
    });
});
