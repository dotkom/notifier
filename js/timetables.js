"use strict";

var Timetables = {
  debug: 0,
  api: 'https://www.atb.no/rutetider/',

  _initStorage_: function() {
    if (localStorage.busTimetables === undefined)
      localStorage.busTimetables = JSON.stringify({});
    if (localStorage.busTimetablesAge === undefined)
      localStorage.busTimetablesAge = 0;
  },

  _load_: function() {
    // Old list of PDFs?
    var then = Number(localStorage.busTimetablesAge);
    var now = new Date().getTime();
    var week = 7 * 24 * 60 * 60 * 1000;
    if (isNaN(then) || (now - then) > week) {
      if (this.debug) console.log('Timetables: Old list of PDFs, fetching new');

      var self = this;
      Ajaxer.getCleanHtml({
        url: self.api,
        success: function(html) {

          // Parse out all the PDF links from the rutetider-page
          var timetables = JSON.parse(localStorage.busTimetables);

          $.each($(html).find('table.rutetabell:first tr a[href*=".pdf"]'), function(i, val) {

            var link = $(this).prop('href');
            var line = link.match(/_rute_(\d+)/);

            if (line != null) {
              // Store all lines in our local timetable PDF-list
              line = line[1];
              timetables[line] = link;
              if (self.debug) console.log('Timetables: Line',line+':',link);
            }
            else {
              if (self.debug) console.log('Timetables: Unknown link', link);
            }
          });

          // Save it all back to localstorage
          localStorage.busTimetables = JSON.stringify(timetables);
          localStorage.busTimetablesAge = String(new Date().getTime());
        },
        error: function(err) {
          if (self.debug) console.error('Could not fetch AtB\'s timetables:', err);
        },
      });
    }
    else {
      if (this.debug) console.log('Timetables: Bus timetables loaded and good');
    }
  },

}

// Timetables self-loading
Timetables._initStorage_();
Timetables._load_();
