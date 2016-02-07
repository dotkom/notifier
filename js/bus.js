"use strict";

var Bus = {
  debug: 0,
  api: 'http://bybussen.api.tmn.io/rt/',
  msgDisconnected: 'Frakoblet fra bybussen.api.tmn.io',
  msgConnectionError: 'Tilkoblingsfeil',
  msgInvalidDirection: 'Ugyldig retning',
  msgKeyExpired: 'Nøkkelen vår har utløpt, trenger oppdatering',

  // Public functions

  get: function(stopId, favoriteLines, callback) {
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
    timeString = timeString.replace('ca ', '');
    timeString = timeString.replace(' min', '');
    if (timeString.match(/kjørt/) !== null) {
      return '#ff69b4';
    }
    else if (timeString.match(/nå/) !== null) {
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
      var isRealtime = departures[i].rt;
      var destination = departures[i].d.trim();
      var calculatedTime = this.calculateTime(time, isRealtime);

      // Add destination and departure
      lines.destination.push(line + ' ' + destination);
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
    if (diff < -1)
      calculatedTime = isRealtime ? 'kjørt' : 'ca kjørt';
    else if (-1 <= diff && diff <= 0)
      calculatedTime = isRealtime ? 'nå' : 'ca nå';
    else if (1 <= diff && diff <= 59)
      calculatedTime = (isRealtime?'':'ca ') + diff + " min";
    else if (60 <= diff)
      calculatedTime = timePieces[0] + ':' + timePieces[1];

    if (this.debug) console.log('Calculated time:', calculatedTime);
    return calculatedTime;
  },

};
