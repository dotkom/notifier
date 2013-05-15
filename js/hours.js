var Hours = {
  
  // This file contains Opening Hours for the SiT cantinas.
  // SiTs new format for ajaxing hours is a POST api:
  // curl --data "diner=2532" https://www.sit.no/ajaxdiner/get

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

        // Debugging a particular string now?
        if (self.debugText) allHours = self.debugThisText;

        // Find todays hours
        todaysHours = self.findTodaysHours(allHours);
        if (self.debug) console.log('Todays hours:', todaysHours);

        if (todaysHours.match(/e[ksx]+[ame]+ns? ?[åÅ][pen]+t?/gi) == null) {
          // Prettify todays hours
          prettyHours = self.prettifyTodaysHours(todaysHours);
          if (self.debug) console.log('Pretty hours:', prettyHours);
          callback(prettyHours);
        }
        else {
          if (self.debug) console.log('Not prettifying exam period hours');
          callback(todaysHours);
        }
      },
      error: function(jqXHR, text, err) {
        callback(self.msgConnectionError);
      },
    });
  },

  stripJsonAndHtml: function(data) {
    var htmlString = data.html;
    return htmlString.replace(/<(?:.|\n)*?>/gm, '');
  },

  findTodaysHours: function(allHours) {
    var day = new Date().getDay();
    if (this.debugDay)
      day = this.debugThisDay;
    var pieces = allHours.split('\n');
    if (this.debugText) {
      return '- ' + pieces[0] + '<br />- ' + pieces[1];
    }
    
    // Remove lines from pieces containing contact information and such
    for (var i = pieces.length - 1; i >= 0; i--) {
      // Identify by '@sit.no' from the email address or the phone number
      if (pieces[i].indexOf('@sit.no') != -1 || pieces[i].match(/\d(\d|\s)+\d/g) != null) {
        pieces.splice(i, 1);
      }
    };

    var dailyHours = [];
    // It is important to have this loop counting upwards, this is because
    // overriding information for specific days might be posted later in
    // the pieces array. E.g. pieces[0] might contain something about monday,
    // but pieces[4] might have overriding information about the current monday.
    for (var i=0; i<pieces.length; i++) {
      if (pieces[i].match(/e[ksx]+[ame]+ns? ?[åÅ][pen]+t?/gi) != null) {
        var exams = pieces.slice(i).join('<br />- ');
        dailyHours[0] = exams;
        dailyHours[6] = exams;
      }
      // These if-statements violates the DRY-principle, but please don't
      // overengineer this, - at least these are trivial to understand
      if (pieces[i].match(/søndag/gi) != null) {
        dailyHours[0] = pieces[i];
      }
      if (pieces[i].match(/mandag/gi) != null) {
        dailyHours[1] = pieces[i];
      }
      if (pieces[i].match(/tirsdag/gi) != null) {
        dailyHours[2] = pieces[i];
      }
      if (pieces[i].match(/onsdag/gi) != null) {
        dailyHours[3] = pieces[i];
      }
      if (pieces[i].match(/torsdag/gi) != null) {
        dailyHours[4] = pieces[i];
      }
      if (pieces[i].match(/fredag/gi) != null) {
        dailyHours[5] = pieces[i];
      }
      if (pieces[i].match(/lørdag/gi) != null) {
        dailyHours[6] = pieces[i];
      }
    };

    // Filling ranges from monday to e.g. thursday, this is
    // fairly naïve, but interestingly accurate
    var lastDay = dailyHours[1]; // Starting with monday
    for (var i = 1; i < 6; i++) {
      if (typeof dailyHours[i] == 'undefined') {
        if (typeof lastDay != 'undefined') {
          dailyHours[i] = lastDay;
        }
      }
      lastDay = dailyHours[i];
    };

    // Returning todays, if info exist about it
    var today = dailyHours[day];
    if (typeof today == 'undefined') {
      if (this.debug) console.log('findTodaysHours returns', this.msgClosed);
      return this.msgClosed;
    }
    else {
      if (this.debug) console.log('findTodaysHours returns', dailyHours[day], 'from', dailyHours);
      return '- ' + dailyHours[day];
    }
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
