var Browser = {
  msgUnsupported: 'ERROR: Unsupported browser',

  setIcon: function(path) {
    if (BROWSER == 'Chrome') {
      if (chrome.browserAction != undefined) {
        chrome.browserAction.setIcon({path: path});
      }
    }
    else if (BROWSER == 'Opera') {
      // If this is the background page
      if (typeof OPERA_BUTTON != "undefined") {
        OPERA_BUTTON.icon = path;
      }
      // If this is another page reference button through background process
      else {
        this.getBackgroundProcess().OPERA_BUTTON.icon = path;
      }
    }
    else {
      console.log(this.msgUnsupported);
    }
  },

  setTitle: function(title) {
    if (BROWSER == 'Chrome') {
      if (chrome.browserAction != undefined) {
        chrome.browserAction.setTitle({title: title});
      }
    }
    else if (BROWSER == 'Opera') {
      // If this is the background page
      if (typeof OPERA_BUTTON != "undefined") {
        OPERA_BUTTON.title = title;
      }
      // If this is another page reference button through background process
      else {
        this.getBackgroundProcess().OPERA_BUTTON.title = title;
      }
    }
    else {
      console.log(this.msgUnsupported);
    }
  },

  setBadgeText: function(text) {
    if (BROWSER == 'Chrome') {
      if (chrome.browserAction != undefined) {
        chrome.browserAction.setBadgeText({text: text});
      }
    }
    else if (BROWSER == 'Opera') {
      // If this is the background page
      if (typeof OPERA_BUTTON != "undefined") {
        OPERA_BUTTON.badge.textContent = text;
      }
      // If this is another page reference button through background process
      else {
        this.getBackgroundProcess().OPERA_BUTTON.badge.textContent = text;
      }
    }
    else {
      console.log(this.msgUnsupported);
    }
  },

  openTab: function(url) {
    if (BROWSER == 'Chrome') {
      if (chrome.tabs != undefined) {
        chrome.tabs.create({url: url, selected: true});
      }
    }
    else if (BROWSER == 'Opera') {
      // If this is the background page
      if (typeof OPERA_BUTTON != "undefined") {
        if (opera.extension.tabs) {
          opera.extension.tabs.create({url: url, focused: true});
        }
        else {
          console.log('ERROR: Opera tab creation not avaliable');
        }
      }
      // Recurse to the background page
      else {
        this.getBackgroundProcess().Browser.openTab(url);
      }
    }
    else {
      console.log(this.msgUnsupported);
    }
  },

  openBackgroundTab: function(url) {
    if (BROWSER == 'Chrome') {
      if (chrome.tabs != undefined) {
        chrome.tabs.create({url: url, selected: false});
      }
    }
    else if (BROWSER == 'Opera') {
      // If this is the background page
      if (typeof OPERA_BUTTON != "undefined") {
        if (opera.extension.tabs) {
          opera.extension.tabs.create({url: url, focused: false});
        }
        else {
          console.log('ERROR: Opera tab creation not avaliable');
        }
      }
      // Recurse to the background page
      else {
        this.getBackgroundProcess().Browser.openBackgroundTab(url);
      }
    }
    else {
      console.log(this.msgUnsupported);
    }
  },

  getBackgroundProcess: function() {
    if (BROWSER == 'Chrome') {
      if (chrome.extension != undefined) {
        return chrome.extension.getBackgroundPage();
      }
    }
    else if (BROWSER == 'Opera') {
      return opera.extension.bgProcess;
    }
    else {
      console.log(this.msgUnsupported);
    }
  },

  // FUNCTIONS BELOW ARE NOT YET FULLY IMPLEMENTED

  createNotification: function(path) {
    // For future reference, support for webkit notifications can be
    // tested with (!window.webkitNotifications)
    if (BROWSER == 'Chrome') {
      notification = webkitNotifications.createHTMLNotification(path);
      notification.show();
    }
    else if (BROWSER == 'Opera') {
      // Desktop Notifications will be available in Opera 12.50
      console.log('BROWSER.JS: createNotification, will not be avaliable in Opera until 12.50');
    }
    else {
      console.log(this.msgUnsupported);
    }
  },

  // getUrl: function(path) {
  //   if (BROWSER == 'Chrome') {
  //     return chrome.extension.getURL(path);
  //   }
  //   else if (BROWSER == 'Opera') {
  //     console.log('BROWSER.JS: getUrl');
  //   }
  //   else {
  //     console.log(this.msgUnsupported);
  //   }
  // },

}
