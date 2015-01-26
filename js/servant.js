"use strict";

var Servant = {
  debug: 0,
  debugString: '11:00-12:00 Steinar Hagen\n12:00-13:00 Espen Skarsbø Kristoffersen Olsen\n13:00-14:00 Aina Elisabeth Thunestveit', // Online example
  // debugString: '00:00-23:59 Kjøkkenansvarlige: Dag Håkon Haneberg, Hanna Agersborg Aanjesen, Kristoffer Iversen', // Solan example
  
  msgNone: 'Ingen ansvarlige nå',
  msgError: 'Frakoblet fra ansvarkalender',

  get: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }
    if (!Affiliation.org[localStorage.affiliationKey1].hw) {
      if (this.debug) console.log('ERROR: affiliation without hw-features tried checking for servants');
      return;
    }

    var api = Affiliation.org[localStorage.affiliationKey1].hw.apis.servant;

    // Receives the meeting plan for today
    var self = this;
    Ajaxer.getPlainText({
      url: api,
      success: function(servant) {

        // If servant debugging is enabled
        if (self.debug) {
          servant = self.debugString;
        }

        var servantList = servant.split("\n");
        var currentServant = servantList[0];

        // If it's an actual servant with a time slot like this:
        // 12:00-13:00: Michael Johansen(, Servant Alice, Servant Bob)
        if (currentServant.match(/\d+:\d+\-\d+:\d+/)) {
          // Match out the name from the line
          var pieces = currentServant.match(/(\d+:\d+\-\d+:\d+) ([0-9a-zA-ZæøåÆØÅ \-]+)/);
          var timeSlot = pieces[1];
          var servantName = pieces[2];

          // If we are currently within the specified timeslot "12:00-13:00"
          var timePieces = timeSlot.split("-"); // ["12:00", "13:00"]
          var startTime = timePieces[0].split(":"); // ["12", "00"]
          var endTime = timePieces[1].split(":"); // ["13", "00"]
          var now = new Date();
          var start = new Date();
          start.setHours(startTime[0]);
          start.setMinutes(startTime[1]);
          var end = new Date();
          end.setHours(endTime[0]);
          end.setMinutes(endTime[1]);
          
          if (start <= now && now <= end) {
            servantName = self.shortenServantNames(servantName);
            callback(servantName);
          }
          else {
            // No servant in this timeslot
            callback(self.msgNone);
          }
        }
        // If it's an actual servant with a date slot instead:
        // 10.2-14.2 Michael Johansen(, Servant Alice, Servant Bob)
        else if (currentServant.match(/\d+\.\d+\-\d+\.\d+/)) {
          // Match out the name from the line
          var pieces = currentServant.match(/(\d+\.\d+\-\d+\.\d+) (.*)/);
          var timeSlot = pieces[1];
          var servantName = pieces[2];

          // Assume we are within the correct dates
          servantName = self.shortenServantNames(servantName);
          callback(servantName);
        }
        else {
          // No more servants today
          callback(self.msgNone);
        }
      },
      error: function(jqXHR, text, err) {
        if (self.debug) console.log('ERROR: Failed to get current servant.');
        callback(self.msgError);
      },
    });
  },

  // Recursive function that shortens long names for servants
  shortenServantNames: function(names) {
    var self = this;
    // Check for prefix, keep it out of the equation
    var prefix = '';
    if (names.match(/:+/)) {
      var pieces = names.split(/:+/);
      prefix = pieces[0] + ': ';
      names = pieces[1];
    }
    // If there are multiple names, shorten each
    if (names.match(/, /i)) {
      var namePieces = names.split(/, /i);
      for (i in namePieces) {
        namePieces[i] = namePieces[i].trim();
        namePieces[i] = self.shortenServantNames(namePieces[i]);
      }
      names = namePieces.join(', ');
      return prefix + names;
    }
    // If the name is quite long...
    else if (names.length >= 25) {
      if (names.split(" ").length >= 3) {
        var namePieces = names.split(" ");
        // ...we'll shorten all middle names to one letter
        for (var i = namePieces.length - 2; i >= 1; i--) {
          namePieces[i] = namePieces[i].charAt(0).toUpperCase()+'.';
        }
        names = '';
        for (var i in namePieces) {
          names += namePieces[i] + " ";
        }
      }
      names = names.trim();
    }
    return prefix + names;
  },
}
