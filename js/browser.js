var Browser = {

  setIcon: function(path) {
    if (BROWSER == 'Chrome') {
      chrome.browserAction.setIcon({path: path});
    }
    else if (BROWSER == 'Opera') {
      // If this is the background page
      if (typeof OPERA_BUTTON != "undefined") {
        OPERA_BUTTON.icon = path;
      }
      // If this is another page reference button through background process
      else {
        opera.extension.bgProcess.OPERA_BUTTON.icon = path;
      }
    }
    else {
      console.log('ERROR: Unsupported browser');
    }
  },

  setTitle: function(title) {
    if (BROWSER == 'Chrome') {
      chrome.browserAction.setTitle({title: title});
    }
    else if (BROWSER == 'Opera') {
      // If this is the background page
      if (typeof OPERA_BUTTON != "undefined") {
        OPERA_BUTTON.title = title;
      }
      // If this is another page reference button through background process
      else {
        opera.extension.bgProcess.OPERA_BUTTON.title = title;
      }
    }
    else {
      console.log('ERROR: Unsupported browser');
    }
  },

  setBadgeText: function(text) {
    if (BROWSER == 'Chrome') {
      chrome.browserAction.setBadgeText({text: text});
    }
    else if (BROWSER == 'Opera') {
      // If this is the background page
      if (typeof OPERA_BUTTON != "undefined") {
        OPERA_BUTTON.badge.textContent = text;
      }
      // If this is another page reference button through background process
      else {
        opera.extension.bgProcess.OPERA_BUTTON.badge.textContent = text;
      }
    }
    else {
      console.log('ERROR: Unsupported browser');
    }
  },

  openTab: function(url) {
    if (BROWSER == 'Chrome') {
      chrome.tabs.create({url: url, selected: true});
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
        opera.extension.bgProcess.Browser.openTab(url);
      }
    }
    else {
      console.log('ERROR: Unsupported browser');
    }
  },

  openBackgroundTab: function(url) {
    if (BROWSER == 'Chrome') {
      chrome.tabs.create({url: url, selected: false});
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
        opera.extension.bgProcess.Browser.openBackgroundTab(url);
      }
    }
    else {
      console.log('ERROR: Unsupported browser');
    }
  },

  // FUNCTIONS BELOW ARE NOT YET FULLY IMPLEMENTED

  createNotification: function(path) {
    if (BROWSER == 'Chrome') {
      notification = webkitNotifications.createHTMLNotification(path);
      notification.show();
    }
    else if (BROWSER == 'Opera') {
      // Desktop Notifications will be available in Opera 12.50
      console.log('BROWSER.JS: createNotification, will not be avaliable in Opera until 12.50');
    }
    else {
      console.log('ERROR: Unsupported browser');
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
  //     console.log('ERROR: Unsupported browser');
  //   }
  // },

}
