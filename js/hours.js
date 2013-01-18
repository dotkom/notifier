var Hours = {
  
  // This file contains Opening Hours for the SiT cantinas.
  // SiTs new format for ajaxing hours is a POST api:
  // curl --data "diner=2532" https://www.sit.no/ajaxdiner/get

  api: 'https://www.sit.no/ajaxdiner/get',
  debugHours: 0,

  cantinas: {
    'administrasjon': 2379,
    'dmmh': 2534,
    'dragvoll': 1593, // got dinner info
    'dragvoll idrettssenter': 2517,
    'elektro': 2518,
    'hangaren': 2519, // got dinner info
    'kalvskinnet': 2529, // got dinner info
    'kjelhuset': 2520,
    'moholt': 2530, // got dinner info
    'mtfs': 2526,
    'ranheimsveien': 2531,
    'realfag': 2521, // got dinner info
    'rotvoll': 2532,
    'tunga': 2533,
    'tyholt': 2525, // got dinner info
    'øya': 2527,

    'storkiosk dragvoll': 2393,
    'storkiosk gløshaugen': 2524,
    'storkiosk øya': 2528,

    'sito dragvoll': 2602,
    'sito realfag': 2522,
    'sito stripa': 2523,
  },

  get: function (cantina, callback) {
    if (callback === undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    cantina = cantina.toLowerCase();
    var postString = 'diner='+this.cantinas[cantina];

    var self = this;
    $.ajax({
      type: 'POST',
      data: postString,
      url: self.api,
      dataType: 'json',
      success: function(json) {
        if (self.debugHours) console.log('Untreated JSON:', json);

        // Strip away JSON and HTML
        allOpeningHours = self.stripJsonAndHtml(json);
        if (self.debugHours) console.log('Entire string:', allOpeningHours);

        // Find todays hours
        todaysOpeningHours = self.findTodaysOpeningHours(allOpeningHours);
        if (self.debugHours) console.log('Todays hours:', todaysOpeningHours);
        callback(todaysOpeningHours);
      },
      error: function(jqXHR, text, err) {
        callback('Klarte ikke koble til sit.no/ajax');
      },
    });
  },

  stripJsonAndHtml: function(data) {
    var htmlString = data.html;
    // Strip away HTML tags
    return htmlString.replace(/<(?:.|\n)*?>/gm, '');
  },

  findTodaysOpeningHours: function(allOpeningHours) {
    var day = new Date().getDay();
    var pieces = allOpeningHours.split('\n');
    if (1 <= day && day <= 4) {
      return pieces[0];
    }
    else if (day == 5) {
      return pieces[1];
    }
    else if (day == 0 || day == 6) {
      return 'Stengt';
    }
    else {
      console.log('ERROR: How in the world did you get here?');
      return '';
    }
  },

}
