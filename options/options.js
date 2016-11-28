"use strict";

browser.storage.local.get(['show_context_menu', 'show_notifications', 'enable_ras'], prefs => {
    var show_context_menu = document.getElementById('show_context_menu');
    var show_notifications = document.getElementById('show_notifications');
    var enable_ras = document.getElementById('enable_ras');

    show_context_menu.checked = prefs.show_context_menu;
    show_notifications.checked = prefs.show_notifications;
    enable_ras.checked = prefs.enable_ras;

    show_context_menu.addEventListener("input", function(e) {
        browser.storage.local.set({
            show_context_menu: show_context_menu.checked
        });
    }, true);

    show_notifications.addEventListener("input", function(e) {
        browser.storage.local.set({
            show_notifications: show_notifications.checked
        });
    }, true);

    enable_ras.addEventListener("input", function(e) {
        browser.storage.local.set({
            enable_ras: enable_ras.checked
        });
    }, true);
});
