"use strict";

var Bus = {
  debug: 0,
  api: 'http://bybussen.api.tmn.io/rt/',
  msgDisconnected: 'Frakoblet fra bybussen.api.tmn.io',
  msgConnectionError: 'Tilkoblingsfeil',
  msgInvalidDirection: 'Ugyldig retning',
  msgKeyExpired: localStorage.extensionName + ' trenger oppdatering',

  // Public functions

  get: function(stopId, favoriteLines, callback) {
    if (callback === undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    var self = this;
    Ajaxer.getJson({
      url: self.api + stopId,
      success: function(json) {
        self.parseDepartures(json, favoriteLines, callback);
      },
      error: function(jqXHR, text, err) {
        callback(self.msgDisconnected);
      },
    });
  },

  calculateUrgency: function(timeString) {
    var urgencyColors = ['#ad0000', '#c80909', '#d91a1a', '#eb3131', '#fd4242', '#e56565', '#d97575', '#ce7f7f', '#c58e8e', '#b68f8e', '#a99291', '#9c9595'];
    // var urgencyColors = ['#950000', '#a10f0f', '#b12222', '#b53535', '#b74b4b', '#b46161', '#a16767', '#906868', '#7e6969', '#6d6363', '#636262', '#4f4f4f'];
    // var urgencyColors = ['#df0101', '#ff0000', '#fe2e2e', '#ff5555', '#ff8686', '#ffadad', '#ffd1d1', '#f8e0e0', '#f0e2e2', '#eeeeee', '#cccccc', '#bbbbbb'];
    timeString = timeString.replace('ca ', '');
    timeString = timeString.replace(' min', '');
    if (timeString === 'nå') {
      return urgencyColors[0];
    }
    else if (timeString.match(/[0-9]{2}:[0-9]{2}/g)) {
      return urgencyColors[11];
    }
    else {
      var time = Number(timeString);
      if (time < 22) {
        return urgencyColors[Math.floor(time / 2)];
      }
    }
    return urgencyColors[11];
  },

  // Private functions, do not use externally

  parseDepartures: function(json, favoriteLines, callback) {

    var departures = json.next;
    if (typeof departures == 'string') {
      if (departures.match(/unauthorized/gi) !== null)
        callback(this.msgKeyExpired);
      else
        callback(this.msgConnectionError);
      return;
    }

    // Create a map with an array of departures for each bus line
    var lines = {};
    lines.destination = [];
    lines.departures = [];

    var count = 0;
    var nLines = (favoriteLines.length === 0 ? 10 : 100);

    for (var i in departures) {

      var line = departures[i].l;

      // Usually controlled by favorite lines
      if (favoriteLines.length != 0) {
        if (favoriteLines.indexOf(Number(line)) === -1) {
          continue;
        }
      }
      // Otherwise controlled with counter
      else if (count++ >= nLines) break;

      var time = departures[i].t;
      var isRealtime = departures[i].r;
      var destination = departures[i].d.trim();
      destination = this.prettifyDestination(destination);

      // Add destination
      lines.destination.push(line + ' ' + destination);

      // Add departure
      var calculatedTime = this.calculateTime(time, isRealtime);
      lines.departures.push(calculatedTime);
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

    if (this.debug) console.log('Calculated time:', calculatedTime);
    return calculatedTime;
  },

  prettifyDestination: function(destination) {
    if (destination.match(/Munkegata|(Dronningens|Kongens|Prinsens) ga?te?/) !== null)
      destination = "Sentrum";
    if (destination.match(/Dragvoll\/Lohove/) !== null)
      destination = "Lohove";
    return destination;
  },

};
