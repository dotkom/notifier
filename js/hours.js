var Hours = {
  api: 'https://www.sit.no/ajaxdiner/get',
  examPeriodLink: 'http://www.sit.no/content/24363/Eksamensapent',
  debugHours: 0,
  
  // This file contains Opening Hours for the SiT cantinas.
  // SiTs new format for ajaxing hours:

  // https://www.sit.no/ajaxdiner/get
  // POST: "diner=2532"
  // 1593 = SiT Kafe Dragvoll
  // 2379 = SiT Kafe administrasjon
  // 2393 = SiT Storkiosk Dragvoll
  // 2517 = SiT Kafe Dragvoll Idrettssenter
  // 2518 = SiT Kafe Elektro
  // 2519 = SiT Kafe Hangaren
  // 2520 = SiT Kafe Kjelhuset
  // 2521 = SiT Kafe Realfag
  // 2522 = Cafe-sito Realfag
  // 2523 = Cafe-sito Stripa
  // 2524 = SiT Storkiosk Gløshaugen
  // 2525 = SiT Kafe Tyholt
  // 2526 = SiT Kafe MTFS
  // 2527 = SiT Kafe Øya
  // 2528 = SiT Storkiosk Øya
  // 2529 = SiT Kafe Kalvskinnet
  // 2530 = SiT Kafe Moholt
  // 2531 = SiT Kafe Ranheimsveien
  // 2532 = SiT Kafe Rotvoll
  // 2533 = SiT Kafe Tunga
  // 2534 = SiT Kafe DMMH
  // 2602 = Cafe-sito Dragvoll

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

    /*
    var date = new Date();
    var minute = date.getMinutes();
    var hour = date.getHours();
    var day = date.getDay();
    var month = date.getMonth();
    var dayOfMonth = date.getDate();
    var _onejan = new Date(date.getFullYear(),0,1);
    var weekNumber = Math.ceil((((new Date() - _onejan) / 86400000) + _onejan.getDay()+1)/7);

    // Check if the cantina is supported
    if (cantina !== 'hangaren' && cantina !== 'realfag' && cantina !== 'storkiosk') {
      callback('Feil: Kantinen '+cantina+' støttes ikke');
    }
    else {
      // Is it the weekend?
      if (day === 0 || day === 6) {
        // Is it fall exam period?
        if ((month === 10 && 15 <= dayOfMonth) || (month === 11 && dayOfMonth <= 21)) {
          // Show the exam period notice all day long
          callback('Eksamensåpent? Sjekk <span class="link" data="'+this.examPeriodLink+'">sit.no</span>');
        }
        // Is it spring exam period?
        if ((month === 4 && 15 <= dayOfMonth) || (month === 5 && dayOfMonth <= 8)) {
          // Show the exam period notice all day long
          callback('Eksamensåpent? Sjekk <span class="link" data="'+this.examPeriodLink+'">sit.no</span>');
        }
        // It's probably closed
        else {
          callback('Stengt');
        }
      }
      // It's a regular day
      else {
        // Gløshaugen Storkiosk is open all year around
        if (cantina === 'storkiosk') {
          var closingHour = 18;
          // Closing an hour earlier on fridays
          if (day === 5) {
            closingHour = 17;
          }
          // Check hour and minutes
          if (hour < 8) {
            callback('Åpner kl 8');
          }
          else if (10 <= hour && hour <= closingHour) {
            callback('Åpent til kl '+closingHour);
          }
          else {
            callback('Stengt');
          }
        }
        // Hangaren is open all year around
        else if (cantina === 'hangaren') {
          var closingHour = 17;
          var closingMinute = 30;
          // Closing an hour earlier on fridays
          if (day === 5) {
            closingHour = 16;
          }
          // Check hour and minutes
          if (hour < 10) {
            callback('Åpner kl 10');
          }
          else if (10 <= hour && hour <= 13) {
            callback('Lunsjmeny til kl 14');
          }
          else if ((14 <= hour && hour <= closingHour) || (hour == closingHour && minute < closingMinute)) {
            var str = (closingMinute !== 0 ? ':'+closingMinute : '');
            callback('Middagsmeny til kl '+closingHour+str);
          }
          else {
            callback('Stengt');
          }
        }
        // Realfag is summer closed in weeks 27-31
        else if (cantina === 'realfag') {
          if (27 <= weekNumber && weekNumber <= 31) {
            callback('Sommerstengt');
          }
          else {
            var closingHour = 17;
            var closingMinute = 30;
            // Closing an hour earlier on fridays
            if (day === 5) {
              closingHour = 14;
              closingMinute = 0;
            }
            // Check hour and minutes
            if (hour < 10) {
              callback('Åpner kl 10');
            }
            else if ((10 <= hour && hour <= closingHour) || (hour == closingHour && minute < closingMinute)) {
              var str = (closingMinute !== 0 ? ':'+closingMinute : '');
              callback('Middagsmeny til kl '+closingHour+str);
            }
            else {
              callback('Stengt');
            }
          }
        }
        else {
          console.log('ERROR: How in the world did you get here?');
        }
      }
    }
    */
    /* Div eksamensåpent info:
                            November      Desember          Klokken
    Hangaren selger middag         24-25, 1-2, 8-9, 15-16   14-16
    Dragvoll selger middag                1-2, 8-9          15-17
    Storkiosk Gløs er åpen  17-18, 24-25, 1-2, 8-9, 15-16   10-15
    */
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
