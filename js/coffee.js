"use strict";

var Coffee = {

  msgNoPots: 'Ingen kanner i dag',
  msgNoCoffee: 'Kaffen har ikke blitt satt på',
  msgConnectionError: 'Frakoblet fra kaffekanna',
  msgComforting: 'Så så, det er sikkert kaffe :)',
  msgNotification: 'Kaffen er satt på, straks klar :)',

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
      // time is negative, computer is likely in a timezone between GMT -12 and +1
      return 'God reise! Håper de har kaffe! :)';
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
    if (typeof localStorage.lastSubscriptionTime !== 'undefined') {
      try {
        var then = JSON.parse(localStorage.lastSubscriptionTime);
        if (this.minuteDiff(then) < 5) {
          showIt = false;
        }
      }
      catch (err) {
        if (this.debug) console.error('failed to calculate coffee subscription time difference');
      }
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
        memes.push('./meme/'+i+'.png');
      }

      // Add affiliation memes
      if (Affiliation.org[key].hw.memePath) {
        var amount = Affiliation.getMemeCount(key);
        var path = Affiliation.org[key].hw.memePath;
        for (var i = 1; i <= amount; i++) {
          memes.push(path+i+'.png');
        }
      }

      // Randomize image
      var random = 1 + (Math.floor(Math.random() * memes.length));
      if (this.debug) console.log('memes['+(random-1)+'] of '+0+'-'+(memes.length-1)+' is "'+memes[random-1]+'"');
      var image = memes[random - 1]; // the list is zero-indexed

      if (this.debug) console.log('memes', random - 1, '/', memes.length, image);

      // Create the notification
      var item = {
        title: Affiliation.org[key].name + ' Notifier',
        description: this.msgNotification,
        image: image,
        link: 'options.html',
        feedKey: key,
      }
      if (!demo) {
        Browser.createNotification(item);
      }
      else {
        // Need to run it by the background process because the event listeners are there
        Browser.getBackgroundProcess().Browser.createNotification(item);
      }
    }
    else {
      if (this.debug) console.error('coffee notification displayed less than four minutes ago');
    }
  },

}
