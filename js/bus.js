var Bus = {
  debug: 0,
  api: 'http://api.visuweb.no/bybussen/4.0/Departure/Route/',
  apiKey: '/5ce70df7d7ffa2a6728aef4eaf9200db', // phasing out oldkey: f6975f3c1a3d838dc69724b9445b3466
  msgDisconnected: 'Frakoblet fra api.visuweb.no',
  msgConnectionError: 'Tilkoblingsfeil',
  msgInvalidDirection: 'Ugyldig retning',
  msgKeyExpired: localStorage.extensionName + ' trenger oppdatering',

  get: function(stopId, favoriteLines, callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    var self = this;
    Ajaxer.getJson({
      url: self.api + stopId + self.apiKey,
      success: function(json) {
        self.parseDepartures(json, favoriteLines, callback);
      },
      error: function(jqXHR, text, err) {
        callback(self.msgDisconnected);
      },
    });
  },

  getLines: function(stopId, callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    // This function suffers from missing API features, there is currently no single
    // good call that will give all the lines passing a single stop.
    // - Realtime API will only give what's in the immediate future
    // - Route API will give more, but will still suffer closer to midnight
    // - Route API has a field for lines that might be implemented in the API one day, check there!
    var self = this;
    Ajaxer.getJson({
      url: self.api + stopId + self.apiKey,
      success: function(json) {
        callback(json);
      },
      error: function(jqXHR, text, err) {
        callback(self.msgDisconnected);
      },
    });
  },

  // Private functions, do not use externally

  parseDepartures: function(json, favoriteLines, callback) {

    var departures = json['next'];
    if (typeof departures == 'string') {
      if (departures.match(/unauthorized/gi) !== null)
        callback(this.msgKeyExpired);
      else
        callback(this.msgConnectionError);
      return;
    }

    // Create a map with an array of departures for each bus line
    var lines = {};
    lines['destination'] = [];
    lines['departures'] = [];

    var count = 0;
    var nLines = (favoriteLines.length == 0 ? 10 : 100);

    for (i in departures) {

      var line = departures[i]['l'];

      // Usually controlled by favorite lines
      if (favoriteLines.length != 0)
        if (favoriteLines.indexOf(Number(line)) === -1)
          continue;
      // Otherwise controlled with counter
      else if (count++ >= nLines) break;

      var time = departures[i]['t'];
      var isRealtime = departures[i]['r'];
      var destination = departures[i]['d'].trim();
      destination = this.prettifyDestination(destination);

      // Add destination
      lines['destination'].push(line + ' ' + destination);

      // Add departure
      var calculatedTime = this.calculateTime(time, isRealtime);
      lines['departures'].push(calculatedTime);
    }

    // lines: {
    //   'destination': ['5 Dragvoll', '22 Vestlia', '5 Dragvoll'],
    //   'departures':  ['2 min',      '26 min',     'ca 50 min' ],
    // }
    callback(lines);
  },

  calculateTime: function(time, isRealtime) {
    // We only need the time, the date is always today
    // Format is "10.11.2012 12:07"

    var datePieces = time.split(' ')[0].split('.');
    var timePieces = time.split(' ')[1].split(':');
    var yy = datePieces[2];
    var mm = datePieces[1] - 1; // Zero-indexed for some fucking reason
    var dd = datePieces[0];
    var hour = timePieces[0];
    var min = timePieces[1];

    // Set the two dates
    var now = new Date();
    var then = new Date(yy, mm, dd, hour, min);

    // Calculate difference between the two dates, and convert to minutes
    var one_minute = 1000 * 60;
    var diff = Math.floor(( then.getTime() - now.getTime() ) / one_minute);

    // Create a proper time string from all the minutes
    var calculatedTime;
    if (-1 <= diff && diff <= 0)
      calculatedTime = isRealtime?'nå':'ca nå';
    else if (1 <= diff && diff <= 59)
      calculatedTime = (isRealtime?'':'ca ') + diff+" min";
    else if (60 <= diff)
      calculatedTime = timePieces[0] + ':' + timePieces[1];

    if (this.debug) console.log('Calculated time:', calculatedTime)
    return calculatedTime;
  },

  prettifyDestination: function(destination) {
    if (destination.match(/Munkegata|(Dronningens|Kongens|Prinsens) ga?te?/) !== null)
      destination = "Sentrum";
    if (destination.match(/Dragvoll\/Lohove/) !== null)
      destination = "Lohove";
    return destination;
  },

}
