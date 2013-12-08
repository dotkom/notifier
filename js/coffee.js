var Coffee = {
  debug: 0,
  debugString: "200\n1. March 14:28:371",

  msgNoPots: 'Ingen kanner i dag',
  msgNoCoffee: 'Kaffen har ikke blitt satt på',
  msgFormatError: 'Feil i kaffeformat',
  msgConnectionError: 'Frakoblet fra kaffekanna',
  msgComforting: 'Så så, det er sikkert kaffe :)',
  msgNotification: 'Kaffen er satt på, straks klar :)',

  get: function(pretty, callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    var api = Affiliation.org[localStorage.affiliationKey1].hw.apis.coffee;

    // Receives the status for the coffee pot
    var self = this;
    Ajaxer.getPlainText({
      url: api,
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
            var now = new Date();
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
            if (pretty) {
              callback(self.msgNoPots, self.msgNoCoffee);
            }
            else {
              callback(0, 0);
            }
          }
        } catch (err) {
          if (self.debug) console.log('ERROR: Coffee format is wrong:', err);
          callback(self.msgFormatError, self.msgComforting);
        }
      },
      error: function(jqXHR, text, err) {
        if (self.debug) console.log('ERROR: Failed to get coffee pot status.');
        callback(self.msgConnectionError, self.msgComforting);
      },
    });
  },

  isMadeToday: function(ageString) {
    // Get now
    var now = new Date();
    // Figure out which date the coffee was made
    var dateObject = ageString.match(/\d+\. [a-zA-Z]+/);
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

  showNotification: function(pots, age) { // Parameters 'pots' and 'age' not in use yet.
    var demo = (typeof pots == 'undefined' && typeof age == 'undefined');
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
    if (showIt || demo) {

      // Save timestamp if this was a real coffee notification
      if (!demo)
        localStorage.lastSubscriptionTime = JSON.stringify(new Date());
      
      var key = localStorage.affiliationKey1;
      var memes = [];

      // Add regular memes
      var amount = MEME_AMOUNT; // Number of memes, in regular human numbers, not zero-indexed
      for (var i = 1; i <= amount; i++) {
        memes.push('./meme/'+i+'.jpg');
      }

      // Add affiliation memes
      if (Affiliation.org[key].hw.memes) {
        amount = Affiliation.org[key].hw.memes.numberOfMemes;
        var path = Affiliation.org[key].hw.memes.memePath;
        for (var i = 1; i <= amount; i++) {
          memes.push(path+i+'.jpg');
        }
      }

      // Randomize image
      var random = 1 + (Math.floor(Math.random() * memes.length));
      if (this.debug) console.log('memes['+(random-1)+'] of '+0+'-'+(memes.length-1)+' is "'+memes[random-1]+'"');
      var image = memes[random - 1]; // the list is zero-indexed

      // Create the notification
      item = {
        title: Affiliation.org[key].name + ' Notifier',
        description: this.msgNotification,
        image: image,
        link: 'options.html',
        feedKey: key,
      }
      if (!demo)
        Browser.createNotification(item);
      else
        // Need to run it by the background process because the event listeners are there
        Browser.getBackgroundProcess().Browser.createNotification(item);
    }
    else {
      if (this.debug) console.log('ERROR: coffee notification displayed less than four minutes ago');
    }
  },

}
