var Browser = {
  msgCallbackMissing: 'ERROR: Callback is missing',
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

  getBadgeText: function(callback) {
    if (typeof callback == 'undefined') {
      console.log(this.msgCallbackMissing);
    }
    else {
      if (BROWSER == 'Chrome' || BROWSER == 'Opera') {
        chrome.browserAction.getBadgeText({}, function(badgeText) {
          callback(badgeText);
        });
      }
      else {
        console.log(this.msgUnsupported);
      }
    }
  },

  setBadgeText: function(text) {
    if (typeof text == 'undefined' || text == null || isNaN(Number(text)) || Number(text) <= 0) {
      text = '';
    }
    if (BROWSER == 'Chrome' || BROWSER == 'Opera') {
      if (chrome.browserAction != undefined) {
        text = String(text);
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

  createNotification: function(item) {
    if (BROWSER == 'Chrome') {
      // Check if browser is active, not "idle" or "locked"
      if (chrome.idle) {
        chrome.idle.queryState(30, function (state) {
          if (state == 'active') {

            // Load affiliation icon
            var symbol = Affiliation.org[item.feedKey].symbol;

            // Set options
            var options = {
               type: 'basic',
               iconUrl: symbol,
               title: item.title,
               message: item.description,
               priority: 0,
            };

            // We'll show an "image"-type notification if image exists and is not a placeholder
            if (typeof item.image != 'undefined') {
              if (item.image != Affiliation.org[item.feedKey].placeholder) {
                options.type = 'image';
                options.imageUrl = item.image;
              }
            }

            // Shorten messages to fit nicely
            var maxLength = 63;
            if (maxLength < item.description.length) {
              options.message = item.description.substring(0, maxLength) + '...';
            }
            // If basic type is used, we should also provide expandedMessage
            if (options.type == 'basic') {
              options.expandedMessage = item.description;
              var expandedMaxLength = 180;
              if (expandedMaxLength < item.description.length) {
                options.expandedMessage = item.description.substring(0, expandedMaxLength) + '...';
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
            chrome.notifications.create(id, options, function(notID) {
              if (DEBUG) console.log("Succesfully created notification with ID " + notID);
            });
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
      // Desktop Notifications not yet available
      if (DEBUG) console.log('BROWSER.JS: createNotification, not yet avaliable in Opera');
    }
    else {
      console.log(this.msgUnsupported);
    }
  },

  // Event handlers for the various notification events

  registerNotificationListeners: function() {
    if (BROWSER == 'Chrome') {
      window.addEventListener("load", function() {
        chrome.notifications.onClosed.addListener(Browser.notificationClosed);
        chrome.notifications.onClicked.addListener(Browser.notificationClicked);
        chrome.notifications.onButtonClicked.addListener(Browser.notificationBtnClick);
      });
    }
    else if (BROWSER == 'Opera') {
      console.log(this.msgUnsupported);
    }
    else {
      console.log(this.msgUnsupported);
    }
  },
  
  notificationClosed: function(notID, bByUser) {
    if (!DEBUG) {
      if (bByUser) {
        _gaq.push(['_trackEvent', 'notification', 'closeNotification', 'byUser']);
      }
      else {
        _gaq.push(['_trackEvent', 'notification', 'closeNotification', 'automatic']);
      }
    }
  },

  notificationClicked: function(notID) {
    var link = window[notID];
    if (!DEBUG) {
      _gaq.push(['_trackEvent', 'notification', 'clickNotification', link]);
    }
    Browser.openTab(link);
  },

  notificationBtnClick: function(notID, iBtn) {
    if (!DEBUG) {
      _gaq.push(['_trackEvent', 'notification', 'clickNotificationButton', iBtn]);
    }
  },

}
