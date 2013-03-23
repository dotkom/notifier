var Hours = {
  
  // This file contains Opening Hours for the SiT cantinas.
  // SiTs new format for ajaxing hours is a POST api:
  // curl --data "diner=2532" https://www.sit.no/ajaxdiner/get

  api: 'https://www.sit.no/ajaxdiner/get',
  msgClosed: '- Kantinen er nok stengt',
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
    'kjelhuset': 2520,
    'moholt': 2530,
    'mtfs': 2526,
    'ranheimsveien': 2531,
    'realfag': 2521,
    'rotvoll': 2532,
    'tunga': 2533,
    'tyholt': 2525,
    'øya': 2527,
    'storkiosk dragvoll': 2393,
    'storkiosk gløshaugen': 2524,
    'storkiosk øya': 2528,
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
    $.ajax({
      type: 'POST',
      data: postString,
      url: self.api,
      dataType: 'json',
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

        // Prettify todays hours
        prettyHours = self.prettifyTodaysHours(todaysHours);
        if (self.debug) console.log('Pretty hours:', prettyHours);

        callback(prettyHours);
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
    // Monday - Thursday on the first line
    else if (1 <= day && day <= 4) {
      return '- ' + pieces[0];
    }
    // Friday on the second line
    else if (day === 5) {
      if (pieces[1].match(/[a-zA-Z]+dag/) != null) {
        return '- ' + pieces[1];
      }
      else {
        // Some cantinas have just one opening hour for monday - friday
        return '- ' + pieces[0];
      }
    }
    else if (day === 0 || day === 6) {
      return this.msgClosed;
    }
    else {
      console.log('ERROR: How in the world did you get here?');
      return this.msgMalformedHours;
    }
  },

  prettifyTodaysHours: function(todays) {
    // All en-dashes and em-dashes to regular dashes
    todays = todays.replace(/\u2013|\u2014/gm, '-');
    // All dots to colons
    todays = todays.replace(/\./gm,':');
    // Add colons where missing 1600 -> 16:00
    todays = todays.replace(/(\d\d)(\d\d)/gm, '$1:$2');
    // Remove unnecessarily specific time info 10:00 -> 10
    todays = todays.replace(/:00/gm, '');
    // Trim unnecessary zero in time 08 -> 8
    todays = todays.replace(/0(\d)/gm, '$1');
    // Remove colon after day names
    todays = todays.replace(/: /gm, ' ');
    // Change any dash or the likes between days to 'til'
    todays = todays.replace(/(dag) ?. ?([a-zA-ZæøåÆØÅ]+dag)/gm, "$1" + " til " + "$2");
    // Add a space if needed, e.g. "10- 16:30" -> "10 - 16:30"
    todays = todays.replace(/(\d) ?- ?(\d)/gm, "$1" + " - " + "$2");
    // Only first letter should be capitalized
    todays = this.capitalizeFirstLetterOnly(todays);
    return todays;
  },

  capitalizeFirstLetterOnly: function(string) {
    string = string.toLowerCase();
    var regex = /[a-z]/;
    var firstLetter = String(string.match(regex)).toUpperCase();
    return string.replace(regex, firstLetter);
  },

}
