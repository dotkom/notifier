var Coffee = {
  api: 'http://draug.online.ntnu.no/coffee.txt',
  msgConnectionError: 'Frakoblet fra kaffeknappen',

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

        // Test data
        // if (DEBUG) {
        //   data = "200\n27. February 21:20:371";
        //   // data = "what";
        // }

        try {
          // Split into pot number and age of last pot
          var pieces = data.split("\n");
          var pots = pieces[0];
          var age = pieces[1];

          // Get now
          var now = new Date();

          // Check if the coffee pots were made today
          var coffeeDate = new Date(age.match(/\d+\. [a-zA-Z]+/));
          if (coffeeDate.getDate() == now.getDate()) {

            // Calulate the age of the last pot better
            var coffeeTime = String(age.match(/\d+:\d+:\d+/)).split(':');
            var then = new Date(now.getFullYear(), now.getMonth(), now.getDate(), coffeeTime[0], coffeeTime[1]);
            var one_minute = 1000 * 60;

            // Calculate difference between the two dates, and convert to minutes
            var diff = Math.floor(( now.getTime() - then.getTime() ) / one_minute);
            
            // Create a proper time string from all the minutes
            var ageString;
            if (-1 <= diff && diff <= 9) {
              ageString = 'Kaffen ble <b>nettopp laget</b>';
            }
            else if (10 <= diff && diff <= 59) {
              ageString = 'Kaffen ble laget for '+diff+' min siden';
            }
            else if (60 <= diff) {
              ageString = 'Kaffen ble laget kl '+coffeeTime[0]+':'+coffeeTime[1];
            }
            else {
              ageString = 'Har noen laget kaffe i fremtiden?!'
            }

            // Add 'kanner' to pots-string
            pots = (pots=='0'?'Ingen kanner':pots=='1'?'1 kanne':pots+' kanner') + ' i dag';

            // Make a complete string
            var coffee = ageString+'<br />'+pots
            callback(coffee);
          }
          else {
            // Coffee was not made today
            var coffee = 'Kaffen har ikke blitt satt på<br />Ingen kanner i dag';
            callback(coffee);
          }
        } catch (err) {
          // Coffee format is wrong
          var coffee = 'Feil i kaffeformat...<br />Det er sikkert kaffe!';
          callback(coffee);
        }
      },
      error: function(jqXHR, text, err) {
        if (DEBUG) console.log('ERROR: Failed to get coffee pot status.');
        callback(self.msgConnectionError);
      },
    });
  },

  getPots: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }
    var self = this;
    $.ajax({
      url: self.api,
      success: function(data) {
        // Find amount of pots today, convert to number
        var pieces = data.split(/:(.+)/);
        var pots = Number(pieces[0]);
        callback(pots);
      },
      error: function(jqXHR, text, err) {
        if (DEBUG) console.log('ERROR: Failed to get coffee pot status.');
        callback(-1);
      },
    });
  },

  showNotification: function(pots) {
    var notification = webkitNotifications.createHTMLNotification('subscription.html');
    notification.show(); // HTML5-style
  },

}
