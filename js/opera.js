// WARNING: This file must only be called from background.html
var OPERA_BUTTON = null;

// If this is an opera extension, add the popup icon
if (BROWSER == "Opera") {
  var properties = {
    title: localStorage.extensionName,
    icon: "img/logo-18.png",
    badge: {
      backgroundColor: '#b90014',
      color: '#ffffff',
    },
    popup: {
      href: "popup.html",
      width: 482,
      height: 534
    }
  }
  OPERA_BUTTON = opera.contexts.toolbar.createItem(properties);
  opera.contexts.toolbar.addItem(OPERA_BUTTON);
}