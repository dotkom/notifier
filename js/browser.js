"use strict";

var Browser = {
  debug: 0,
  msgCallbackMissing: 'Callback is missing',
  msgUnsupported: 'Unsupported browser',

  name: 'Unknown', // Changed automatically at the end of this file with Browser.detect()
  version: 0,

  _detect_: function() {
    if (navigator.userAgent.indexOf('Chrome') !== -1 && navigator.userAgent.indexOf('OPR') === -1) {
      var verOffset = navigator.userAgent.indexOf("Chrome/");
      if (verOffset !== -1) {
        this.version = parseInt(navigator.userAgent.substring(verOffset + 7));
      }
      this.name = 'Chrome';
    }
    else if (navigator.userAgent.indexOf('Chrome') !== -1 && navigator.userAgent.indexOf('OPR') !== -1) {
      var verOffset = navigator.userAgent.indexOf("OPR/");
      if (verOffset !== -1) {
        this.version = parseInt(navigator.userAgent.substring(verOffset + 4));
      }
      this.name = 'Opera';
    }
    else {
      console.error(this.msgUnsupported);
      this.name = 'Unknown';
    }
  },

  onMac: function() {
    return navigator.platform.toLowerCase().indexOf('mac')!==-1;
  },

  onLinux: function() {
    return navigator.platform.toLowerCase().indexOf('linux')!==-1;
  },

  onWindows: function() {
    return navigator.platform.toLowerCase().indexOf('win')!==-1;
  },

  setIcon: function(path) {
    if (this.name == 'Chrome' || this.name == 'Opera') {
      if (chrome.browserAction != undefined) {
        chrome.browserAction.setIcon({
          path: {
            "19": path,
            "38": path,
          }
        });
      }
    }
    else {
      console.error(this.msgUnsupported);
    }
  },

  setTitle: function(title) {
    if (this.name == 'Chrome' || this.name == 'Opera') {
      if (chrome.browserAction != undefined) {
        chrome.browserAction.setTitle({title: title});
      }
    }
    else {
      console.error(this.msgUnsupported);
    }
  },

  getBadgeText: function(callback) {
    if (typeof callback == 'undefined') {
      console.error(this.msgCallbackMissing);
    }
    else {
      if (this.name == 'Chrome' || this.name == 'Opera') {
        chrome.browserAction.getBadgeText({}, function(badgeText) {
          callback(badgeText);
        });
      }
      else {
        console.error(this.msgUnsupported);
      }
    }
  },

  setBadgeText: function(text) {
    if (typeof text == 'undefined' || text == null || isNaN(Number(text)) || Number(text) <= 0) {
      text = '';
    }
    if (this.name == 'Chrome' || this.name == 'Opera') {
      if (chrome.browserAction != undefined) {
        text = String(text);
        chrome.browserAction.setBadgeText({text: text});
      }
    }
    else {
      console.error(this.msgUnsupported);
    }
  },

  openTab: function(url) {
    if (this.name == 'Chrome' || this.name == 'Opera') {
      if (chrome.tabs != undefined) {
        chrome.tabs.create({url: url, selected: true});
      }
    }
    else {
      console.error(this.msgUnsupported);
    }
  },

  openBackgroundTab: function(url) {
    if (this.name == 'Chrome' || this.name == 'Opera') {
      if (chrome.tabs != undefined) {
        chrome.tabs.create({url: url, selected: false});
      }
    }
    else {
      console.error(this.msgUnsupported);
    }
  },

  getUrl: function(url) {
    // Allows you to get an accessible URL for a resource in the extension, e.g. an image
    if (this.name == 'Chrome' || this.name == 'Opera') {
      return chrome.extension.getURL(url);
    }
    else {
      console.error(this.msgUnsupported);
    }
  },

  getBackgroundProcess: function() {
    if (this.name == 'Chrome' || this.name == 'Opera') {
      if (chrome.extension != undefined) {
        return chrome.extension.getBackgroundPage();
      }
    }
    else {
      console.error(this.msgUnsupported);
    }
  },

  getAppVersion: function() {
    try {
      if (this.name == 'Chrome' || this.name == 'Opera') {
        return chrome.app.getDetails().version;
      }
    } catch (err) {
      // Do nothing
    }
    console.error(this.msgUnsupported);
    return 'Unknown';
  },

  inProduction: function() {
    // Is the app in production? If so, there will be an update URL
    try {
      if (this.name === 'Chrome' || this.name === 'Opera') {
        if (chrome.app.getDetails().id === 'hfgffimlnajpbenfpaofmmffcdmgkllf') {
          return true;
        }
        else if (chrome.app.getDetails().id === 'npnpbddfcaibgnegafofkmffmbmflelj') {
          return true;
        }
        else if (typeof chrome.app.getDetails().update_url === 'string') {
          return true;
        }
        else {
          return false;
        }
      }
    } catch (err) {
      // Do nothing
    }
    console.error(this.msgUnsupported);
    return false; // assume dev mode
  },

  bindCommandHotkeys: function() {
    if (this.name === 'Chrome' || this.name === 'Opera') {
      chrome.commands.onCommand.addListener(function(command) {
        if (command == 'open_instabart') {
          Analytics.trackEvent('usedHotkey', 'open_instabart');
          Browser.openTab('http://instabart.no');
        }
        else {
          if (Browser.debug) console.error('Unrecognized browser command');
        }
      });
    }
    else {
      console.error(this.msgUnsupported);
    }
  },

  // Things in item:
  // - feedKey: 'orgx'
  // - title: 'Hello World'
  // - description: 'Good day to you World, how are you today?'
  // - link: 'http://orgx.no/news/helloworld'
  // Optional things in item:
  // - image: 'http://orgx.no/media/helloworld.png'
  // - symbol: 'img/whatever.png'
  // - longStory: true
  // - stay: true
  createNotification: function(item) {
    // Check required params
    if (!item) console.error('function takes one object, {feedKey, title, description, link, *image, *symbol, *longStory, *stay} (* == optional)');
    if (!item.feedKey) console.error('item.feedKey is required');
    if (!item.title) console.error('item.title is required');
    if (!item.link) console.error('item.link is required');
    // Check recommended params
    if (!item.description) console.warn('item.description is recommended');

    // Do not show any notifications within the first half minute after install
    if (!DEBUG && (new Date().getTime() - Number(localStorage.installTime)) < 30000) {
      if (this.debug) console.log('No notifications within the first half minute after install (sent from affiliation "'+item.feedKey+'")');
      return;
    }

    var self = this;
    if (this.name == 'Chrome' || (this.name == 'Opera' && this.version >= 25)) {
      // Check if browser is "active" or "idle", not "locked"
      if (chrome.idle) {
        chrome.idle.queryState(30, function (state) {
          if (state === 'active' || state === 'idle') {

            // Load affiliation icon if symbol is not provided
            if (!item.symbol)
              item.symbol = Affiliation.org[item.feedKey].symbol;

            // Set notification
            var notification = {
               type: 'basic',
               iconUrl: item.symbol,
               title: item.title,
               message: item.description,
               priority: 0,
            };

            // We'll show an "image"-type notification if image exists and is not a placeholder
            if (item.image) {
              if (item.image != Affiliation.org[item.feedKey].placeholder) {
                notification.type = 'image';
                notification.imageUrl = item.image;
              }
            }

            // Shorten messages to fit nicely (300 because around 250 is max limit anyway)
            var maxLength = (item.longStory ? 300 : 63);
            if (maxLength < item.description.length) {
              notification.message = item.description.substring(0, maxLength) + '...';
            }

            // If basic type is used, we should also provide expandedMessage
            if (notification.type == 'basic') {
              notification.expandedMessage = item.description;
              var expandedMaxLength = (item.longStory ? 300 : 180);
              if (expandedMaxLength < item.description.length) {
                notification.expandedMessage = item.description.substring(0, expandedMaxLength) + '...';
              }
            }

            // Generate random ID
            var id = String(Math.round(Math.random()*100000));

            // Save the link to make the notification clickable. Associating the id with the
            // window object instead of putting it in localStorage makes sure all links are
            // cleared every time the background process restarts, rather than filling up
            // localStorage with links.
            window[id] = item.link;

            // Show the notification
            chrome.notifications.create(id, notification, function(notID) {
              if (self.debug) console.log('Succesfully created notification with ID', notID);
              Analytics.trackEvent('createNotification', item.feedKey, item.link);
            });
            // Choose how long the notification stays around for
            // if stay? 10 minutes
            // if longStory? 10 seconds
            // else 5 seconds
            // Note: Chrom(e|ium) on Linux doesn't remove the notification,
            // automatically, so it needs to be manually cleared.
            var timeout = (item.stay ? 600000 : (item.longStory ? 10000 : 5000));
            setTimeout(function() {
              chrome.notifications.clear(id, function(wasCleared) {
                if (self.debug) console.log('Cleared notification?', wasCleared);
              });
            }, timeout);
          }
          else {
            if (self.debug) console.log('Notification not sent, state was', state);
          }
        });
      }
      else {
        if (self.debug) console.error('This version of Chrome does not support chrome.idle');
      }
    }
    else if (this.name == 'Opera') {
      // Desktop Notifications not yet available
      if (self.debug) console.log('BROWSER.JS: createNotification only supported in Opera 25 and greater. Please upgrade your browser.');
    }
    else {
      console.error(this.msgUnsupported);
    }
  },

  // Event handlers for the various notification events

  registerNotificationListeners: function() {
    if (this.name === 'Chrome' || this.name === 'Opera') {
      window.addEventListener("load", function() {
        chrome.notifications.onClosed.addListener(Browser.notificationClosed);
        chrome.notifications.onClicked.addListener(Browser.notificationClicked);
        chrome.notifications.onButtonClicked.addListener(Browser.notificationBtnClick);
      });
    }
    else {
      console.error(this.msgUnsupported);
    }
  },

  notificationClosed: function(notID, byUser) {
    if (byUser) {
      Analytics.trackEvent('closeNotification', 'byUser');
    }
    else {
      Analytics.trackEvent('closeNotification', 'automatic');
    }
  },

  notificationClicked: function(notID) {
    var link = window[notID];
    Analytics.trackEvent('clickNotification', link);
    Browser.openTab(link);
  },

  notificationBtnClick: function(notID, iBtn) {
    Analytics.trackEvent('clickNotificationButton', iBtn);
  },

  bindOmniboxToOracle: function() {
    if (this.name === 'Chrome' || this.name === 'Opera') {
      // This event is fired each time the user updates the text in the omnibox,
      // as long as the extension's keyword mode is still active.
      // chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
      //   if (Browser.debug) console.log('inputChanged: ' + text);
      //   suggest([
      //     {content: text + " one", description: text + " the first one"},
      //     {content: text + " number two", description: text + " the second entry"}
      //   ]);
      // });
      // This event is fired with the user accepts the input in the omnibox.
      chrome.omnibox.onInputEntered.addListener(function(text) {
        // console.log('inputEntered: ' + text);
        Oracle.ask(text, function(answer) {
          answer = answer.replace(/@/g, '\n');
          if (Browser.debug) console.log('oracle answer: ' + answer);
          Analytics.trackEvent('oracleOmniboxAnswer');
          // Browser.createNotification
          //   'feedKey': ls.affiliationKey1
          //   'title': 'Orakelet'
          //   'description': answer
          //   'link': 'http://atb.no'
          //   'longStory': true
          //   'stay': true
          alert(answer);
        });
      });
    }
    else {
      console.error(this.msgUnsupported);
    }
  },

}

// Detect name and version
Browser._detect_();
