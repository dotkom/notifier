"use strict";

var Hackerspace = {
  debug: 0,

  web: 'http://hackerspace.idi.ntnu.no/',
  api: 'http://hackerspace.idi.ntnu.no/api/door',
  
  msgPrefix: '<span>Hackerspace:</span> ',
  msgDisconnected: 'Frakoblet fra Hackerspace',
  msgError: 'Malformatert data fra Hackerspace',
  
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
        
        if (door.length >= 1) {
          var isOpen = door[0].isOpen;
          
          var timeString = '';
          if (isOpen) {
            var opened = door[0].opened;
            var prettyTime = self.prettyTime(opened);
            timeString = 'Åpnet ' + prettyTime;
          }
          else {
            var closed = door[0].closed;
            var prettyTime = self.prettyTime(closed);
            timeString = 'Stengte ' + prettyTime;
          }

          callback(self.msgPrefix + timeString);
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

  prettyTime: function(then) {
    var now = new Date().getTime();
    var diff = Math.floor((now - then) / 1000); // diff in seconds
    if (diff >= 3600) {
      return 'for ' + (diff < 7200 ? '1 time' : Math.floor(diff / 3600) + ' timer') + ' siden';
    }
    else if (diff >= 60) {
      return 'for ' + (diff < 120 ? '1 minutt' : Math.floor(diff / 60) + ' minutter') + ' siden';
    }
    else if (diff >= 0) {
      return 'for ' + (diff == 1 ? '1 sekund' : diff + ' sekunder') + ' siden';
    }
    else {
      return 'i fremtiden (ha en fin reise!)';
    }
  },

}
