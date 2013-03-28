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
          if (self.isMadeToday(ageString)) {

            // Calculate minute difference from right now
            var coffeeTime = String(ageString.match(/\d+:\d+:\d+/)).split(':');
            var then = new Date(now.getFullYear(), now.getMonth(), now.getDate(), coffeeTime[0], coffeeTime[1]);
            var age = self.minuteDiff(then);

            // If pretty strings are requested
            if (pretty) {
              age = self.prettyAgeString(age, coffeeTime);
              pots = self.prettyPotsString(pots);
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

  minuteDiff: function(then) {
    // Get now
    var now = new Date();
    var one_minute = 1000 * 60;
    // Calculate difference between the two dates, and convert to minutes
    return Math.floor(( now.getTime() - then.getTime() ) / one_minute);
  },

  prettyAgeString: function(diff, coffeeTime) {
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

  showNotification: function(pots, age) { // Parameter vars not in use yet.
    // If the computer has slept for a while and there are
    // suddenly four new coffeepots then they will all be
    // lined up for notifications, giving the user four
    // notifications at once. This is prevented here by not
    // allowing two consecutive notifications within 4 minutes
    // of each other.
    var showIt = true;
    try {
      var then = JSON.parse(localStorage.lastSubscriptionTime);
      if (this.minuteDiff(then) <= 4) {
        showIt = false;
      }
    }
    catch (err) {
      if (this.debug) console.log('ERROR: failed to calculate coffee subscription time difference');
    }
    if (showIt) {
      localStorage.lastSubscriptionTime = JSON.stringify(new Date());
      Browser.createNotification('subscription.html');
    }
    else
      if (this.debug) console.log('ERROR: coffee notification displayed less than four minutes ago');
  },

}
