'use strict';

function blockOrRewriteRequest(e) {
  // TODO use a global variable instead of using the storage
  browser.storage.local.get(['disallow_ping', 'disallow_beacon'], (results) => {
    const options = results || {
      disallow_ping: false,
      disallow_beacon: false,
    };

    if (options.disallow_ping && e.type === 'ping') {
      return {
        cancel: true,
      };
    } else if (options.disallow_beacon && e.type === 'beacon') {
      return {
        cancel: true,
      };
    }
    // TODO Might not work and return when the function is finished
    browser.storage.local.get('uaChosen').then((ua) => {
      for (const header of e.requestHeaders) {
        if (header.name === 'User-Agent') {
          header.value = ua;
        }
      }
      return {
        requestHeaders: e.requestHeaders,
      };
    });
  });
}

browser.webRequest.onBeforeSendHeaders.addListener(
  blockOrRewriteRequest, {
    urls: ['<all_urls>'],
  }, ['blocking', 'requestHeaders'],
);
