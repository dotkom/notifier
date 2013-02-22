var Browser = {

  name: 'Chrome',

  addPopupIcon: function() {
    if (this.name == 'Chrome') {
      console.log('LOLLLOLLOLOL NOTHING TO DO, CHROME ROX, browser.js')
    }
    else if (this.name == 'Opera') {
      window.addEventListener("load", function() {
        var theButton;
        var ToolbarUIItemProperties = {
          title: EXTENSION_NAME,
          icon: "img/logo-18.png",
          popup: {
            href: "popup.html",
            width: 482,
            height: 534
          }
        }
        theButton = opera.contexts.toolbar.createItem(ToolbarUIItemProperties);
        opera.contexts.toolbar.addItem(theButton);
      }, false);
    }
    else {
      console.log('ERROR: Unsupported browser');
    }    
  },

  openTab: function(url) {
    if (this.name == 'Chrome') {
      chrome.tabs.create({url: url});
    }
    else if (this.name == 'Opera') {
      console.log('BROWSER.JS: openTab');
      opera.extension.tabs.create({url: url});
    }
    else {
      console.log('ERROR: Unsupported browser');
    }
  },

  openBackgroundTab: function(url) {
    if (this.name == 'Chrome') {
      chrome.tabs.create({url: url, selected: false});
    }
    else if (this.name == 'Opera') {
      console.log('BROWSER.JS: openBackgroundTab');
      opera.extension.tabs.create({url: url, focused: false});
    }
    else {
      console.log('ERROR: Unsupported browser');
    }
  },

  setIcon: function(path) {
    if (this.name == 'Chrome') {
      chrome.browserAction.setIcon({path: path});
    }
    else if (this.name == 'Opera') {
      console.log('BROWSER.JS: setIcon');
    }
    else {
      console.log('ERROR: Unsupported browser');
    }
  },

  setTitle: function(title) {
    if (this.name == 'Chrome') {
      chrome.browserAction.setTitle({title: title});
    }
    else if (this.name == 'Opera') {
      console.log('BROWSER.JS: setTitle');
    }
    else {
      console.log('ERROR: Unsupported browser');
    }
  },

  setBadgeText: function(text) {
    if (this.name == 'Chrome') {
      chrome.browserAction.setBadgeText({text: text});
    }
    else if (this.name == 'Opera') {
      console.log('BROWSER.JS: setBadgeText');
    }
    else {
      console.log('ERROR: Unsupported browser');
    }
  },

  createNotification: function(path) {
    if (this.name == 'Chrome') {
      notification = webkitNotifications.createHTMLNotification(path);
      notification.show();
    }
    else if (this.name == 'Opera') {
      console.log('BROWSER.JS: createNotification');
    }
    else {
      console.log('ERROR: Unsupported browser');
    }
  },

  getUrl: function(path) {
    if (this.name == 'Chrome') {
      return chrome.extension.getURL(path);
    }
    else if (this.name == 'Opera') {
      console.log('BROWSER.JS: getUrl');
    }
    else {
      console.log('ERROR: Unsupported browser');
    }
  },

}
