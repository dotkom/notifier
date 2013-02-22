var Browser = {

  name: 'Chrome',

  openTab: function(url, focused) {
    if (this.name == 'Chrome') {
      chrome.tabs.create({url: 'options.html'});
    }
    else if (this.name == 'Opera') {
      console.log('SPARTA OPERA BROWSER.JS');
    }
    else {
      console.log('ERROR: Unsupported browser');
    }
  },

}
