var Hours = {
  EXAM_PERIOD_LINK: 'http://www.sit.no/content/24363/Eksamensapent',

  // SiTs new format for ajaxing hours:

  // "diner=2532"
  // https://www.sit.no/ajaxdiner/get
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
  // 2534 =  SiT Kafe DMMH
  // 2602 = Cafe-sito Dragvoll
  
  /* This file: Opening Hours for the SiT cantinas */

  get: function (cantina, callback) {
    if (callback === undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    cantina = cantina.toLowerCase();

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
          callback('Eksamensåpent? Sjekk <span class="link" data="'+this.EXAM_PERIOD_LINK+'">sit.no</span>');
        }
        // Is it spring exam period?
        if ((month === 4 && 15 <= dayOfMonth) || (month === 5 && dayOfMonth <= 8)) {
          // Show the exam period notice all day long
          callback('Eksamensåpent? Sjekk <span class="link" data="'+this.EXAM_PERIOD_LINK+'">sit.no</span>');
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
          else if (14 <= hour && (hour <= closingHour && minute < closingMinute)) {
            var str = (closingMinute !== 0 ? ':'+closingMinute : '');
            callback('Middagsmeny til '+closingHour+str);
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
            else if (10 <= hour && (hour <= closingHour && minute < closingMinute)) {
              var str = (closingMinute !== 0 ? ':'+closingMinute : '');
              callback('Middagsmeny til '+closingHour+str);
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
    /* Div eksamensåpent info:
                            November      Desember          Klokken
    Hangaren selger middag         24-25, 1-2, 8-9, 15-16   14-16
    Dragvoll selger middag                1-2, 8-9          15-17
    Storkiosk Gløs er åpen  17-18, 24-25, 1-2, 8-9, 15-16   10-15
    */
  },

}
