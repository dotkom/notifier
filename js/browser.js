var Browser = {
  msgUnsupported: 'ERROR: Unsupported browser',

  setIcon: function(path) {
    if (BROWSER == 'Chrome' || BROWSER == 'Opera') {
      if (chrome.browserAction != undefined) {
        chrome.browserAction.setIcon({path: path});
      }
    }
    else {
      console.log(this.msgUnsupported);
    }
  },

  setTitle: function(title) {
    if (BROWSER == 'Chrome' || BROWSER == 'Opera') {
      if (chrome.browserAction != undefined) {
        chrome.browserAction.setTitle({title: title});
      }
    }
    else {
      console.log(this.msgUnsupported);
    }
  },

  setBadgeText: function(text) {
    if (typeof text == 'undefined' || text == null || text == 0 || text == '0') {
      text = '';
    }
    if (BROWSER == 'Chrome' || BROWSER == 'Opera') {
      if (chrome.browserAction != undefined) {
        chrome.browserAction.setBadgeText({text: text});
      }
    }
    else {
      console.log(this.msgUnsupported);
    }
  },

  openTab: function(url) {
    if (BROWSER == 'Chrome' || BROWSER == 'Opera') {
      if (chrome.tabs != undefined) {
        chrome.tabs.create({url: url, selected: true});
      }
    }
    else {
      console.log(this.msgUnsupported);
    }
  },

  openBackgroundTab: function(url) {
    if (BROWSER == 'Chrome' || BROWSER == 'Opera') {
      if (chrome.tabs != undefined) {
        chrome.tabs.create({url: url, selected: false});
      }
    }
    else {
      console.log(this.msgUnsupported);
    }
  },

  getBackgroundProcess: function() {
    if (BROWSER == 'Chrome' || BROWSER == 'Opera') {
      if (chrome.extension != undefined) {
        return chrome.extension.getBackgroundPage();
      }
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
      // Check if browser is active, not "idle" or "locked"
      if (chrome.idle) {
        chrome.idle.queryState(30, function (state) {
          if (state == 'active') {
            notification = webkitNotifications.createHTMLNotification(path);
            notification.show();
          }
          else {
            if (DEBUG) console.log('Notification not sent, state was', state);
          }
        });
      }
      else {
        if (DEBUG) console.log('ERROR: This version of Chrome does not support chrome.idle');
      }
    }
    else if (BROWSER == 'Opera') {
      // Desktop Notifications will be available in Opera 12.50
      console.log('BROWSER.JS: createNotification, not yet avaliable in Opera');
    }
    else {
      console.log(this.msgUnsupported);
    }
  },

  // getUrl: function(path) {
  //   if (BROWSER == 'Chrome' || BROWSER == 'Opera') {
  //     return chrome.extension.getURL(path);
  //   }
  //   else {
  //     console.log(this.msgUnsupported);
  //   }
  // },

}
