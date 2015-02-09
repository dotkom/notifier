"use strict";

var Hackerspace = {
  debug: 0,

  web: 'http://hackerspace.idi.ntnu.no/',
  api: 'http://hackerspace.idi.ntnu.no/api/door',
  
  msgPrefix: '<span>Hackerspace:</span> ',
  msgDisconnected: 'Frakoblet fra Hackerspace',
  msgError: 'Malformatert data fra Hackerspace',
  msgOpen: 'Åpent',
  msgClosed: 'Stengt',
  
  get: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }
    var key = localStorage.affiliationKey1;
    if (key !== 'online' && key !== 'abakus') {
      if (this.debug) console.log('ERROR: data only available for affiliations [online, abakus]');
      return;
    }
    
    // Receives the meeting plan for today
    var self = this;
    Ajaxer.getJson({
      url: self.api,
      success: function(door) {
        if (self.debug) console.log('Raw door:\n\n', door);
        
        if (typeof door === 'object') {
          var isOpen = door.isOpen.door;
          var message = isOpen ? self.msgOpen : self.msgClosed;
          callback(self.msgPrefix + message);
        }
        else {
          // Empty string returned from API
          callback(self.msgPrefix + self.msgError);
        }
      },
      error: function(jqXHR, text, err) {
        if (self.debug) console.log('ERROR: Failed to get hackerspace info.');
        callback(self.msgPrefix + self.msgDisconnected);
      },
    });
  },

}
