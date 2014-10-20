"use strict";

var Hours = {
  
  // This file contains Opening Hours for the SiT cantinas.
  // SiTs new format for ajaxing hours is a POST api:
  // curl --data "diner=2532" https://www.sit.no/ajaxdiner/get

  url: 'https://www.sit.no/mat',
  api: 'https://www.sit.no/ajaxdiner/get',
  msgClosed: '- Det er nok stengt',
  msgConnectionError: '- Frakoblet fra sit.no/ajax',
  msgMalformedHours: '- Galt format på åpningstider',
  
  debug: 0, // General debugging
  debugDay: 0, // Whether or not to debug a particular day
  debugThisDay: '1', // Number corresponding to day of week, 0 is sunday
  debugText: 0, // Deep debugging of a specific string, insert below
  debugThisText: 'Mandag- Torsdag 10.00 -17.30\nFredag 08.00 - 14.00\nRealfagbygget på Gløshaugen 73 55 12 52 sit.kafe.realfag@sit.no', // debugText must be true
  // debugThisText is expected to be pre-stripped of JSON and HTML, otherwise intact

  cantinas: {
    'administrasjon': 2379,
    'dmmh': 2534,
    'dragvoll': 1593,
    'elektro': 2518,
    'hangaren': 2519,
    'kalvskinnet': 2529,
    'kjel': 2520,
    'moholt': 2530,
    'mtfs': 2526,
    'ranheimsveien': 2531,
    'realfag': 2521,
    'rotvoll': 2532,
    'tunga': 2533,
    'tyholt': 2525,
    'oya': 2527,
    'storkiosk dragvoll': 2393,
    'storkiosk gloshaugen': 2524,
    'storkiosk oya': 2528,
    'sito dragvoll': 2602,
    'sito realfag': 2522,
    'sito stripa': 2523,
    'idretts. dragvoll': 2517,
  },

  get: function (cantina, callback) {
    if (callback === undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    if (this.debugText) console.log('NOTE: Currently debugging a particular string');

    cantina = cantina.toLowerCase();
    var postString = 'diner='+this.cantinas[cantina];
    
    var self = this;
    Ajaxer.getJson({
      data: postString,
      url: self.api,
      success: function(json) {
        if (self.debug) console.log('Untreated JSON:', json);

        // Strip away JSON and HTML
        allHours = self.stripJsonAndHtml(json);
        if (self.debug) console.log('Entire string:', allHours);

        // Find todays hours
        var todaysHours = self.findTodaysHours(allHours);
        if (self.debug) console.log('Todays hours:', todaysHours);

        callback(todaysHours);
      },
      error: function(jqXHR, text, err) {
        callback(self.msgConnectionError);
      },
    });
  },

  stripJsonAndHtml: function(data) {
    var htmlString = data.html;
    // return htmlString.replace(/<(?:.|\n)*?>/gm, ''); // removes all tags
    return htmlString.replace(/<\/?(div|ul|li|p|a|br|\n).*?>/gi, ''); // keeps the <strong> tag
  },

  findTodaysHours: function(allHours) {
    // Debugging a particular string now?
    if (this.debugText) return '- ' + this.debugThisText.split('\n').join('<br />- ');
    
    var pieces = allHours.split('\n');
    var dayNames = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
    var dailyHours = [];

    // Strip away useless lines
    pieces = this.stripUselessLines(pieces);

    // Regular daily hours (not special cases)

    // Monday to Friday allowed at line 0
    if (typeof pieces[0] != 'undefined') {
      // Filling the day array, some days might not be defined
      for (var dayNum=1; dayNum<=5; dayNum++) {
        var dayRegex = new RegExp(dayNames[dayNum],'gi');
        if (pieces[0].match(dayRegex) != null) {
          dailyHours[dayNum] = pieces[0];
        }
      }
    }
    // Friday or Saturday allowed at line 1
    if (typeof pieces[1] != 'undefined') {
      // Filling the day array, some days might not be defined
      for (var dayNum=5; dayNum<=6; dayNum++) {
        var dayRegex = new RegExp(dayNames[dayNum],'gi');
        if (pieces[1].match(dayRegex) != null) {
          dailyHours[dayNum] = pieces[1];
        }
      }
    }
    // Saturday or Sunday allowed at line 2
    if (typeof pieces[2] != 'undefined') {
      // Filling the day array, some days might not be defined
      for (var dayNum=0; dayNum==0 || dayNum == 6; dayNum+=6) {
        var dayRegex = new RegExp(dayNames[dayNum],'gi');
        if (pieces[2].match(dayRegex) != null) {
          dailyHours[dayNum] = pieces[2];
        }
      }
    }

    // Filling empty ranges from monday to friday, and inbetween,
    // this is fairly naïve, but interestingly accurate
    var lastDay = dailyHours[1]; // Starting with monday (not sunday)
    for (var i=1; i<=5; i++) {
      if (typeof dailyHours[i] == 'undefined') {
        if (typeof lastDay != 'undefined') {
          dailyHours[i] = lastDay;
        }
      }
      lastDay = dailyHours[i];
    }

    var currentDay = new Date().getDay();

    // Debugging a particular day now?
    if (this.debugDay) currentDay = this.debugThisDay;
    
    var today = dailyHours[currentDay];

    // Prettifying
    if (typeof today != 'undefined') {
      today = this.prettifyTodaysHours(today);
    }

    var specialCase = null;

    // Adding any extra info to the end of the string,
    // special info might be e.g. eksamensåpent or vacations
    for (var i=1; i<pieces.length; i++) {
      // Special case titles contains EITHER strong text or NEITHER days nor hours
      // Note that this is valid: <strong>Torsdag 3. oktober</strong>
      if (pieces[i].match(/\<\/?strong\>/gi) != null || (pieces[i].match(/\w+(dag)/gi) == null && pieces[i].match(/\d?\d[\.:]\d\d/gi) == null)) {
        specialCase = pieces.slice(i).join('<br />- ');
        break;
      }
    }
    if (specialCase != null) {
      if (typeof today != 'undefined') {
        specialCase = '<br />- ' + specialCase;
        today += specialCase;
      }
      else {
        today = specialCase;
      }
    }

    // Returning todays
    if (typeof today != 'undefined') {
      if (this.debug) console.log('findTodaysHours returns', today, 'from', dailyHours, 'with special case', specialCase);
      return '- ' + today;
    }
    else {
      if (this.debug) console.log('findTodaysHours returns', this.msgClosed);
      return this.msgClosed;
    }
  },

  stripUselessLines: function(pieces) {
    for (var i = pieces.length - 1; i >= 0; i--) {
      // Trim
      pieces[i] = pieces[i].trim();
      // Remove empty lines
      if (pieces[i] == '' || pieces[i] == '&nbsp;') {
        pieces.splice(i, 1);
      }
      // Remove irrelevant lines
      else if (pieces[i].match(/ha\sen\s|god\s/gi) != null) {
        pieces.splice(i, 1);
      }
      // Remove contact information, indentify by '@sit.no' from email or by phone number
      else if (pieces[i].indexOf('@sit.no') != -1 || pieces[i].match(/\d(\d|\s)+\d/g) != null) {
        pieces.splice(i, 1);
      }
    }
    return pieces;
  },

  prettifyTodaysHours: function(todays) {
    // All en-dashes and em-dashes to regular dashes
    todays = todays.replace(/\u2013|\u2014|&ndash;|&mdash;/g, '-');
    // All dots to colons
    todays = todays.replace(/\./g,':');
    // Add colons where missing 1600 -> 16:00
    todays = todays.replace(/(\d\d)(\d\d)/g, '$1:$2');
    // Remove unnecessarily specific time info 10:00 -> 10
    todays = todays.replace(/:00/g, '');
    // Trim unnecessary zero in time 08 -> 8
    todays = todays.replace(/0(\d)/g, '$1');
    // Remove colon after day names
    todays = todays.replace(/: /g, ' ');
    // Change any dash or the likes between days to 'til'
    todays = todays.replace(/(dag) ?. ?([a-zA-ZæøåÆØÅ]+dag)/g, '$1 til $2');
    // Add a space if needed, e.g. "10- 16:30" -> "10 - 16:30"
    todays = todays.replace(/(\d) ?- ?(\d)/g, '$1 - $2');
    // Only first letter should be capitalized
    todays = this.capitalizeFirstLetterOnly(todays);
    return todays;
  },

  capitalizeFirstLetterOnly: function(string) {
    string = string.toLowerCase();
    var regex = /[a-zæøå]/;
    var firstLetter = String(string.match(regex)).toUpperCase();
    return string.replace(regex, firstLetter);
  },

}
