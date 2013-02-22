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

}
