"use strict";

var Servant = {
  debug: 0,
  debugString: '11:00-12:00 Steinar Hagen\n12:00-13:00 Espen Skarsbø Kristoffersen Olsen\n13:00-14:00 Aina Elisabeth Thunestveit', // Online example
  // debugString: '00:00-23:59 Kjøkkenansvarlige: Dag Håkon Haneberg, Hanna Agersborg Aanjesen, Kristoffer Iversen', // Solan example
  
  msgNone: 'Ingen ansvarlige nå',
  msgError: 'Frakoblet fra ansvarkalender',

  get: function(callback) {
    if (callback == undefined) {
      console.error('Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }
    if (!Affiliation.org[localStorage.affiliationKey1].hw) {
      if (this.debug) console.error('affiliation without hw-features tried checking for servants');
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
          callback(servantName);
        }
        else {
          // No more servants today
          callback(self.msgNone);
        }
      },
      error: function(jqXHR, text, err) {
        if (self.debug) console.error('Failed to get current servant.');
        callback(self.msgError);
      },
    });
  },
}
