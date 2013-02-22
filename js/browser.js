var Browser = {

  name: 'Chrome',

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
