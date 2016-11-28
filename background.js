"use strict";

function rewriteUserAgentHeader(e) {
    // TODO use a global variable instead of using the storage
    browser.storage.local.get(['disallow_ping', 'disallow_beacon'], results => {
        const options = results || {
            disallow_ping: false,
            disallow_beacon: false
        };

        if (options.disallow_ping && e.type === "ping") {
            return {
                cancel: true
            }
        } else if (options.disallow_beacon && e.type === "beacon") {
            return {
                cancel: true
            }
        } else {
            for (var header of e.requestHeaders) {
                if (header.name == "User-Agent") {
                    header.value = ua;
                }
            }
            return {
                requestHeaders: e.requestHeaders
            }
        }
    });
}

browser.webRequest.onBeforeSendHeaders.addListener(
    rewriteUserAgentHeader,
    {urls: ['<all_urls>']},
    ["blocking", "requestHeaders"]
)
