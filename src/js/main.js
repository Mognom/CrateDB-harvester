/*
 * crateDB-harvester
 * https://github.com/mognom/crateDB-harvester-operator
 *
 * Copyright (c) 2018 CoNWeT
 * Licensed under the MIT license.
 */

(function () {

    "use strict";

    var init = function init() {
        MashupPlatform.wiring.registerStatusCallback(pushInfo);

        // On preferences update
        MashupPlatform.prefs.registerCallback(updatePrefs);
        updatePrefs();
    };
    var server, query, data;
    var updatePrefs = function updatePrefs() {
        server = MashupPlatform.prefs.get("server").trim();
        query = MashupPlatform.prefs.get("query").trim();

        harvestNewData();
    };

    var harvestNewData = function harvestNewData() {
        var headers = {};
        headers["Content-Type"] = "application/json; charset=UTF-8";
        MashupPlatform.http.makeRequest(server + "/_sql", {
            method: 'POST',
            supportsAccessControl: false,
            postBody: JSON.stringify({stmt: query}),
            requestHeaders: headers,
            onSuccess: function (response) {
                // If there's no data, its probably the last page.
                var res = JSON.parse(response.responseText);

                // Build response format
                var cols = res.cols;
                data = [];
                data = res.rows.map(function (e) {
                    var result = {};
                    cols.forEach(function (col, i) {
                        result[col] = e[i];
                    });
                    return result;
                });

                pushInfo();
            }
        });
    };

    var pushInfo = function pushInfo() {
        MashupPlatform.wiring.pushEvent("output", data);
    };

    init();
})();
