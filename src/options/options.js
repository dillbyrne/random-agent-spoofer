'use strict';

browser.storage.local.get(['showContextMenu', 'showNotifications', 'enableRas'], (prefs) => {
  const showContextMenu = document.getElementById('showContextMenu');
  const showNotifications = document.getElementById('showNotifications');
  const enableRas = document.getElementById('enableRas');

  showContextMenu.checked = prefs.showContextMenu;
  showNotifications.checked = prefs.showNotifications;
  enableRas.checked = prefs.enableRas;

  showContextMenu.addEventListener('input', () => {
    browser.storage.local.set({
      showContextMenu: showContextMenu.checked,
    });
  }, true);

  showNotifications.addEventListener('input', () => {
    browser.storage.local.set({
      showNotifications: showNotifications.checked,
    });
  }, true);

  enableRas.addEventListener('input', () => {
    browser.storage.local.set({
      enableRas: enableRas.checked,
    });
  }, true);
});
