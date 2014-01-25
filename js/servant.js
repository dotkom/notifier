var Servant = {
  debug: 0,
  debugString: '11:00-12:00 Steinar Hagen\n12:00-13:00 Espen Skarsbø Kristoffersen Olsen\n13:00-14:00 Aina Elisabeth Thunestveit',
  
  msgNone: 'Ingen har ansvar nå',
  msgError: 'Frakoblet fra vaktplan',

  get: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
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

        servantList = servant.split("\n");
        currentServant = servantList[0];

        // If it's an actual servant with a time slot like this:
        // 12:00-13:00: Michael Johansen
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

            // If the servantname is quite long...
            if (servantName.length >= 25) {
              if (servantName.split(" ").length >= 3) {
                names = servantName.split(" ");
                // ...we'll shorten all middle names to one letter
                for (var i = names.length - 2; i >= 1; i--) {
                  names[i] = names[i].charAt(0).toUpperCase()+'.';
                }
                servantName = '';
                for (i in names) {
                  servantName += names[i] + " ";
                }
              }
            }

            callback('Vakt: '+servantName);
          }
          else {
            // No servant in this timeslot
            callback(self.msgNone);
          }
        }
        else {
          // No more servants today
          callback(self.msgNone);
        }
      },
      error: function(jqXHR, text, err) {
        console.lolg('ERROR: Failed to get current servant.');
        callback(self.msgError);
      },
    });
  },
}