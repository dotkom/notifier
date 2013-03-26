var Coffee = {
  api: 'http://draug.online.ntnu.no/coffee_dev.txt',
  msgNoPots: 'Ingen kanner i dag',
  msgNoCoffee: 'Kaffen har ikke blitt satt på',
  msgFormatError: 'Feil i kaffeformat',
  msgConnectionError: 'Frakoblet fra kaffeknappen',
  msgComforting: 'Det er sikkert kaffe!',
  
  debug: 0,
  debugString: "200\n1. March 14:28:371",

  get: function(pretty, callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    // Receives the status for the coffee pot
    var self = this;
    $.ajax({
      url: self.api,
      success: function(data) {

        // If coffee debugging is enabled
        if (self.debug) {
          data = self.debugString;
        }

        try {
          // Split into pot number and age of last pot
          var pieces = data.split("\n");
          var pots = Number(pieces[0]);
          var ageString = pieces[1];

          // Coffee made today?
          if (this.isMadeToday(ageString)) {

            // Calculate minute difference from right now
            var age = this.minuteDiff(ageString);

            // If pretty strings are requested
            if (pretty) {
              age = this.prettyAgeString(age);
              pots = this.prettyPotsString(pots);
            }
            // Call it back
            callback(pots, age);
          }
          else {
            // Coffee was not made today
            callback(self.msgNoPots, self.msgNoCoffee);
          }
        } catch (err) {
          if (DEBUG) console.log('ERROR: Coffee format is wrong.');
          callback(self.msgFormatError, self.msgComforting);
        }
      },
      error: function(jqXHR, text, err) {
        if (DEBUG) console.log('ERROR: Failed to get coffee pot status.');
        callback(self.msgConnectionError, self.msgComforting);
      },
    });
  },

  isMadeToday: function(ageString) {
    // Get now
    var now = new Date();
    // Figure out which date the coffee was made
    var dateObject = ageString.match(/\d+\. [a-zA-Z]+/); // Operas JS-engine makes an object instead of a string
    var dateString = String(dateObject);
    dateString = dateString.replace('.', ''); // Remove period
    dateString = dateString + ', ' + now.getFullYear();
    var coffeeDate = new Date(dateString);
    // Check if the coffee pots were made today
    return coffeeDate.getDate() == now.getDate();
  },

  minuteDiff: function(ageString) {
    // Get now
    var now = new Date();
    // Calulate the age of the last pot better
    var coffeeTime = String(ageString.match(/\d+:\d+:\d+/)).split(':');
    var then = new Date(now.getFullYear(), now.getMonth(), now.getDate(), coffeeTime[0], coffeeTime[1]);
    var one_minute = 1000 * 60;
    // Calculate difference between the two dates, and convert to minutes
    return Math.floor(( now.getTime() - then.getTime() ) / one_minute);
  },

  prettyAgeString: function(diff) {
    // Create a proper time string from all the minutes
    if (0 <= diff && diff <= 9)
      return 'Kaffen ble <b>nettopp laget</b>';
    else if (10 <= diff && diff <= 59)
      return 'Kaffen ble laget for '+diff+' min siden';
    else if (60 <= diff)
      return 'Kaffen ble laget kl '+coffeeTime[0]+':'+coffeeTime[1];
    else
      return 'WAT? Lager noen kaffe i fremtiden nå?!';
  },

  prettyPotsString: function(pots) {
    return (pots=='0'?'Ingen kanner':pots=='1'?'1 kanne':pots+' kanner') + ' i dag';
  },

  showNotification: function(pots) {
    // Amount of pots currently not used
    Browser.createNotification('subscription.html');
  },

}
