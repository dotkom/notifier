var Coffee = {
  api: 'http://draug.online.ntnu.no/coffee_dev.txt',
  msgNoPots: 'Ingen kanner i dag',
  msgNoCoffee: 'Kaffen har ikke blitt satt på',
  msgFormatError: 'Feil i kaffeformat',
  msgConnectionError: 'Frakoblet fra kaffeknappen',
  msgComforting: 'Det er sikkert kaffe!',
  
  debugCoffee: 0,
  debugCoffeeString: "200\n1. March 14:28:371",

  get: function(callback) {
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
        if (self.debugCoffee) {
          data = self.debugCoffeeString;
        }

        try {
          // Split into pot number and age of last pot
          var pieces = data.split("\n");
          var pots = pieces[0];
          var ageString = pieces[1];

          // Get now
          var now = new Date();

          // Figure out which date the coffee was made
          var dateObject = ageString.match(/\d+\. [a-zA-Z]+/); // Operas JS-engine makes an object instead of a string
          var dateString = String(dateObject);
          dateString = dateString.replace('.', ''); // Remove period
          dateString = dateString + ', ' + now.getFullYear();
          var coffeeDate = new Date(dateString);

          // Check if the coffee pots were made today
          if (coffeeDate.getDate() == now.getDate()) {

            // Calulate the age of the last pot better
            var coffeeTime = String(ageString.match(/\d+:\d+:\d+/)).split(':');
            var then = new Date(now.getFullYear(), now.getMonth(), now.getDate(), coffeeTime[0], coffeeTime[1]);
            var one_minute = 1000 * 60;

            // Calculate difference between the two dates, and convert to minutes
            var diff = Math.floor(( now.getTime() - then.getTime() ) / one_minute);
            
            // Create a proper time string from all the minutes
            var age;
            if (-1 <= diff && diff <= 9) {
              age = 'Kaffen ble <b>nettopp laget</b>';
            }
            else if (10 <= diff && diff <= 59) {
              age = 'Kaffen ble laget for '+diff+' min siden';
            }
            else if (60 <= diff) {
              age = 'Kaffen ble laget kl '+coffeeTime[0]+':'+coffeeTime[1];
            }
            else {
              age = 'WAT? Lager noen kaffe i fremtiden nå?!'
            }

            // Make pots-string
            pots = (pots=='0'?'Ingen kanner':pots=='1'?'1 kanne':pots+' kanner') + ' i dag';

            // Call it back
            callback(pots, age);
          }
          else {
            // Coffee was not made today
            var coffee = '';
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

  getPots: function(callback) {
    // Function used by background process to determine when a new coffee pot is cooking
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }
    var self = this;
    $.ajax({
      url: self.api,
      success: function(data) {
        try {
          // Split into pot number and age of last pot
          var pieces = data.split("\n");
          var pots = pieces[0];
          var ageString = pieces[1];

          // Get now
          var now = new Date();

          // Check if the coffee pots were made today
          var coffeeDate = new Date(ageString.match(/\d+\. [a-zA-Z]+/));
          if (coffeeDate.getDate() == now.getDate()) {
            callback(pots);
          }
          else {
            callback(0);
          }
        } catch (err) {
          if (DEBUG) console.log('ERROR: Failed to parse coffee status.');
          callback(0);
        }
      },
      error: function(jqXHR, text, err) {
        if (DEBUG) console.log('ERROR: Failed to get coffee pot status.');
        callback(0);
      },
    });
  },

  showNotification: function(pots) {
    // Amount of pots currently not used
    Browser.createNotification('subscription.html');
  },

}
