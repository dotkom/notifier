"use strict";

var Favorite = {
  debug: 0,
  api: 'https://www.atb.no/holdeplassoversikt/',
  msgFailed: 'Oops! :(',

  getLinesForStop: function(stopId) {
    var stopsAndLines = localStorage.stopsAndLines;
    if (stopsAndLines != undefined) {
      stopsAndLines = JSON.parse(stopsAndLines);
      if (stopsAndLines[stopId] != undefined) {
        // Send back list of lines on this stop
        return stopsAndLines[stopId];
      }
    }
    return this.msgFailed;
  },

  // Private functions

  _load_: function() {

    // Nonexisting list of stops and lines?
    if (localStorage.stopsAndLines == undefined || localStorage.stopsAndLinesAge == undefined) {
      if (this.debug) console.log('Favorite: Nonexisting list of stops and their lines, fetching new')
      Favorite.fetch();
      return;
    }

    // Old list of stops and lines?
    var then = Number(localStorage.stopsAndLinesAge);
    var now = new Date().getTime();
    var week = 7 * 24 * 60 * 60 * 1000;
    if (isNaN(then) || (now - then) > week) {
      if (this.debug) console.log('Favorite: Old list of stops and their lines, fetching new');
      Favorite.fetch();
      return;
    }

    // Good list of stops and lines
    if (this.debug) console.log('Favorite: Stops and lines loaded');
  },

  fetch: function() {
    var self = this;
    Ajaxer.getCleanHtml({
      url: self.api,
      success: function(html) {

        if (self.debug) {
          console.log('Favorite: Parse start');
          var start = new Date().getTime();
        }

        // Parse out all busstop IDs and the lines that pass each stop
        var stopsAndLines = {}, id = '', lines = '';
        $(html).find('table.holdeplasser tr').each(function(i, v) {
          var id = $(this).children().eq(2).text().trim();
          var lines = $(this).children().eq(1).text().trim().split(', ');
          if (id != '' && lines != '') {
            stopsAndLines[id] = lines;
          }
        });

        if (self.debug) console.log('Favorite: Parse time', (new Date().getTime() - start), 'ms for', Object.keys(stopsAndLines).length, 'stops and their lines');
        
        // Save to localstorage
        localStorage.stopsAndLines = JSON.stringify(stopsAndLines);
        localStorage.stopsAndLinesAge = String(new Date().getTime());
      },
      error: function(jqXHR, text, err) {
        if (self.debug) console.error('Could not fetch busstops and their respective lines');
      },
    });
  },

}

// Favorite self-loading
Favorite._load_();
