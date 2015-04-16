"use strict";

var Hackerspace = {
  debug: 0,

  web: 'http://hackerspace.idi.ntnu.no/',
  api: API_SERVER_1 + 'hackerspace',
  
  msgPrefix: '<span>Hackerspace:</span> ',
  msgDisconnected: 'Frakoblet fra Notiwire',
  msgError: 'Oops, noe gikk galt',
  msgOpen: 'Åpent',
  msgClosed: 'Stengt',
  
  get: function(callback) {
    
    // Valid affiliation?
    var key = localStorage.affiliationKey1;
    if (key !== 'online' && key !== 'abakus') {
      if (this.debug) console.error('Data only available for affiliations [online, abakus]');
      return;
    }
    
    // Fetch Hackerspace data
    var self = this;
    Ajaxer.getJson({
      url: self.api,
      success: function(data) {
        if (self.debug) console.log('Raw:\n\n', data);
        try {
          var message = data.open ? self.msgOpen : self.msgClosed;
          callback(self.msgPrefix + message);
        }
        catch (e) {
          callback(self.msgPrefix + self.msgError);
        }
      },
      error: function(jqXHR, text, err) {
        if (self.debug) console.error('Failed to get Hackerspace info.');
        callback(self.msgPrefix + self.msgDisconnected);
      },
    });
  },

};
