var Coffee = {
  msgConnectionError: 'Frakoblet fra kaffeknappen',

  get: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    // Receives the status for the coffee pot
    var self = this;
    $.ajax({
      url: 'http://draug.online.ntnu.no/coffee.txt',
      success: function(data) {

        // Split into pot number and age of last pot
        var pieces = data.split(/:(.+)/);
        var pots = pieces[0];
        var age = pieces[1];

        // Calulate the age of the last pot better
        var time = String(age.match(/\d+:\d+:\d+/)).split(':');
        var now = new Date();
        var then = new Date(now.getFullYear(), now.getMonth(), now.getDate(), time[0], time[1]);
        var one_minute = 1000 * 60;
        // Calculate difference between the two dates, and convert to minutes
        var diff = Math.floor(( then.getTime() - now.getTime() ) / one_minute);
        // Create a proper time string from all the minutes
        var ageString;
        if (-1 <= diff && diff <= 0) {
          ageString = 'Kaffen ble <b>nettopp laget</b>';
        }
        else if (1 <= diff && diff <= 59) {
          ageString = 'Kaffen ble laget for <b>'+diff+' min</b> siden';
        }
        else if (60 <= diff) {
          ageString = 'Kaffen er <b>'+time[0]+':'+time[1]+'</b> gammel';
        }

        // Add 'kanner' to pots-string
        pots = '<b>'+(pots=='0'?'Ingen kanner':pots=='1'?'1 kanne':pots+' kanner')+'</b>';

        // Make a string worthy of returning
        var coffee = ageString+'.<br />'+pots+' i dag.'

        callback(coffee);
      },
      error: function(jqXHR, text, err) {
        if (DEBUG) console.log('ERROR: Failed to get coffee pot status.');
        callback(self.msgConnectionError);
      },
    });
  },

}
