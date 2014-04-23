var Oracle = {
  debug: 0,
  api: 'http://m.atb.no/xmlhttprequest.php?service=routeplannerOracle.getOracleAnswer&question=',
  msgAboutPredict: 'Etter å ha brukt orakelet en stund kan det forutsi spørsmålet ditt når du trykker [tab]',
  msgDisconnected: 'Frakoblet fra m.atb.no',
  msgPredictPostfix: ' [tab]',
  msg503: 'Orakelet har for mye å gjøre, vent littegrann er du grei',

  _autoLoad_: function() {
    if (localStorage.oracleBrain == undefined) {
      var oracleBrain = {};
      for (var i=0; i<=6; i++)
        oracleBrain[i] = {night:'', morning:'', afternoon:'', evening:''};
      localStorage.oracleBrain = JSON.stringify(oracleBrain);
    }
  }(),

  ask: function(question, callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }
    if (isEmpty(question)) {
      console.log('ERROR: question is empty');
      return;
    }

    // Encode URL component.... as it says below :D
    var encodedQuestion = encodeURIComponent(question);

    var self = this;
    Ajaxer.getPlainText({
      url: self.api + encodedQuestion,
      success: function(answer) {

        // Handle errors
        if (answer.match(/error/gi) != null) {
          if (answer.match(/503/gi) != null) {
            callback(self.msg503);
            return;
          }
          else {
            callback(self.msgDisconnected);
            return;
          }
        }

        // Store answer for later prediction (should be done before shorten+prettify)
        self.consider(question, answer);

        // Shorten, prettify
        answer = self.shorten(answer);
        answer = self.convert12to24(answer);
        answer = self.prettify(answer);

        // Call it back
        callback(answer);
      },
      error: function(jqXHR, text, err) {
        callback(self.msgDisconnected);
      },
    });
  },

  greet: function() {
    var greetings = [
      // Spørsmål
      'Når vil du ta bussen?',
      'Bussorakelet trenger noe å gjøre, har du et spørsmål?',
      'Har du et busspørsmål eller skal du bare lese litt tilfeldig tekst?',
      'Lurer du på hvilken buss du skal ta?',
      'Vil du ta bussen til Samfundet kanskje?',
      'Vil du ta bussen til kjellerne på Moholt kanskje?',
      'Har du et lite bussspørsmål?',
      'Skal det være en buss?',
      'Vil du ha en liten privat buss kanskje? En femseter?',
      
      // Statements
      'Orakelet tar gjerne imot spørsmål.',
      'Orakelet vet alt om hvilke busser som kjører.',
      'Orakelet svarer på alle spørsmål om busser.',
      'Spør, og du vil få svar.',
      'Bussorakelet er sultent på spørsmål, eller kantinemat, alt ettersom.',
      'Spør et busspørsmål her.',
      'De som laget Notifier er ganske snille mot AtB.',
      'Buss her, buss der, buss overalt.',
      'Ta bussen til Tiller og kjøp no stæsj du trenger.',
      'Ta bussen til Nidar og spis masse sjokolade.',
      'Ta bussen til campus når det er for kaldt for å sykle.',
      'Åååååå Macarena!',
      'Never gonna give you up!',
      'I\'m a barbie girl!',
      'Bird is the word!',
      'STOP! Hammertime.',
      'Aaaaaaaaa Sevenyaaaaaaaa!',
      'I\'m blue, da bee dee da be daa',
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Typi non habent claritatem insitam; est usus legentis in iis qui facit eorum claritatem. Investigationes demonstraverunt lectores legere me lius quod ii legunt saepius. Claritas est etiam processus dynamicus, qui sequitur mutationem consuetudium lectorum. Mirum est notare quam littera gothica, quam nunc putamus parum claram, anteposuerit litterarum formas humanitatis per seacula quarta decima et quinta decima. Eodem modo typi, qui nunc nobis videntur parum clari, fiant sollemnes in futurum.',

      // Funfacts
      'Bussorakelet ble utviklet på NTNU, spør om noe!',
      'Michael Johansen laget Notifier. Det tok mye tid, men var visst veldig gøy.',
      'Tri M. Nguyen har laget APIet som brukes til sanntiden. Takk, Tri <3',
      'Tri M. Nguyen har laget APIet som Notifier bruker, det er på <a href="http://api.visuweb.no/bybussen">api.visuweb.no/bybussen</a>',
      'Morten Noddeland har laget <a href="http://instabart.no">instabart.no</a>, den siden bør alle Trondheimsstudenter vite om.',
      'Om du liker Notifier kommer du sikkert også til å like <a href="http://instabart.no">instabart.no</a>.',
      'AtB har minibusser også.',
      'UKA har en egen buss.',
      'Flybussen går hvert 10. minutt.',
      'Leddbusser har wifi.',
      'AtB har også langdistansebusser, de er mørkegrønne.',
      'Da Roy Sindre fant nøkkelen ble det plutselig en bussapp før AtB visste hva som skjedde.',
      'En av bussjåførene er julenisse hver desember.',
      'Både AtB og SiT liker Notifier.',
      'Notifier fikk støtte for sanntidsbuss i versjon 1.3.0.',
      'Notifier og bussorakelet ble venner i Notifier versjon 3.2.0',
      'Tenk om Kantinelizzie hadde kjørt buss.',
      'Hvis du har installert Notifier på forskjellige maskiner kan du ha forskjellige busstopp på hver.',
      'Større busser, flere busser, raskere busser, AtB gjør alle tre på 5ern.',
      'En gang gikk 5ern via Gryta og Lohove til Dragvoll.',
      'Før i tiden møttes alle bussene i Munkegata/Dronningens gate.',
      'AtB laget egen bussapp som het Bussøyet, men den var for sent etter 5 studentlagde apper.',
      'Det finnes mange bussapper.',
      'AtB sitt API er laget av italienere.',
      'AtB sitt API har italienske metodenavn.',
      'ByBussen er den mest oppdaterte bussappen.',
      'Bussene sjekker inn med GPS på hvert stopp, cirka.',
      'Bussene som må kjøre langt mellom hvert stopp har upresis sanntid.',
      '<a href="http://busskartet.no">busskartet.no</a> er ganske morsomt.',
      'Han som laget <a href="http://busskartet.no">busskartet.no</a> må ha kost seg gløgg i hjæl med alle de små bussene sine.',
      'Sekkemannen sitter alltid på en utgave av Under Dusken for å unngå bakterier fra bussetet.',

      // Om orakelet
      'Bussorakelets wiki er på <a href="http://ntnu.no/wiki/display/FUIROS">ntnu.no/wiki/display/FUIROS</a>',
      'Bussorakelet kom til live i 1998.',
      'I 2002 begynte bussorakelet å besvare spørsmål på SMS.',
      'BussTUC betyr "Buss: The Understanding Computer".',
      'Orakelet består av tre hjerner: Den første kan beregning, den andre kan språk, den tredje forstår de to første.',
      'Orakelet forstår språk ved hjelp av et komplekst sett med regler skrevet i Prolog.',
      'Bussorakelet er den sentrale delen i FUIROS-prosjektet.',
      'Orakelet kan 4590 ord, 1204 stoppnavn, 80 busslinjer og 9970 navnevarianter.',
      'Orakelet forstår språk ved hjelp av 5000 språkregler.',
      'Orakelet kan 960 substantiv, 1100 verb og 450 adjektiv.',
      'Orakelets kodebase består av 130.500 linjer Prolog.',
      'Orakelet forstår språk ved hjelp av "Consensical Grammar" (CONtext SENSItive CompositionAL Grammar).',
      
      // Team Trafikk
      'AtB er tusen ganger bedre enn Team Trafikk var.',
      'I 2010 byttet Team Trafikk navn til AtB, og byttet eiere.',
      'Team Trafikk sine busser var hvite, gamle og slitne.',
      'Da Team Trafikk ble AtB ble alt mye bedre.',
      'Da Team Trafikk ble AtB fikk de miljøvennlige busser.',
      'Da Team Trafikk ble AtB fikk de grønnere busser.',
      'Da Team Trafikk ble AtB fikk de mobillett.',
      'Da Team Trafikk ble AtB fikk de nye kontorer.',
      'Da Team Trafikk ble AtB fikk de API-er som man kunne hente data fra.',
      'Da Team Trafikk ble AtB fant Roy Sindre en nøkkel til API-et, han spurte ikke om lov.',
      'Åpne bussdata var veldig lurt av AtB.',

      // Contributors
      'Christoffer J. Marcussen er en av hjernene bak bussorakelet (2011-2012).',
      'Jon S. Bratseth er en av hjernene bak bussorakelet (1996-1997).',
      'Magnus Raaum er en av hjernene bak bussorakelet (2010-2011).',
      'Martin T. Ranang er en av hjernene bak bussorakelet (2001-2011).',
      'Marius Q. Wollamo er en av hjernene bak bussorakelet (2012-2013).',
      'Runar Andersstuen er en av hjernene bak bussorakelet (2011-2012).',
      'Rune M. Andersen er en av hjernene bak bussorakelet (2011-2012).',
      'Rune Sætre er en av hjernene bak bussorakelet (2000-2012).',
      'Tore Amble er en av hjernene bak bussorakelet (1996-2012).',
      'Tore Bruland er en av hjernene bak bussorakelet (2004-2011).',
      'Trond Bø Engell er en av hjernene bak bussorakelet (2011-2012).',
    ];
    var randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    return randomGreeting;
  },

  predict: function() {
    var oracleBrain = JSON.parse(localStorage.oracleBrain);
    
    // Get question from timeslot
    var timeslot = this.getTimeslot();
    var question = oracleBrain[timeslot.day][timeslot.hour];
    if (this.debug) console.log('Oracle predicting question for day '+timeslot.day+' in the '+timeslot.hour+': "'+question+'"');
    
    return (question != '' ? question : null);
  },

  // Private functions, do not use externally

  consider: function(question, answer) {
    if (this.debug) console.log('Oracle considering...\n- Question:', question, '\n- Answer:', answer);

    var pieces = answer.match(/buss|bus|til|to|fra|from|passerer|passes|kommer|arrives|senere|later|går|leaves/gi);
    if (pieces != null) {
      // Relevant enough? Simple keyword recognition
      if (pieces.length >= 3) {
        var oracleBrain = JSON.parse(localStorage.oracleBrain);
        
        // Get timeslot
        var timeslot = this.getTimeslot();
        
        // Insert question at correct timeslot
        oracleBrain[timeslot.day][timeslot.hour] = question;
        if (this.debug) console.log('Oracle considered question to be valuable');

        // Check if the same timeslot is free on other days, and insert answer there too
        for (i in oracleBrain) {
          if (oracleBrain[i][timeslot.hour] == '') {
            oracleBrain[i][timeslot.hour] = question;
            if (this.debug) console.log('Oracle used question for day', i, 'as well (monday=0)');
          }
        }

        // Stringify the brain
        localStorage.oracleBrain = JSON.stringify(oracleBrain);
      }
      else {
        if (this.debug) console.log('Oracle thinks the answer did not contain enough expected keywords');
      }
    }
    else {
      if (this.debug) console.log('Oracle thinks the answer did not contain expected keywords');
    }
  },

  getTimeslot: function() {
    // Night:       0 -  5:59
    // Morning:     6 - 11:59
    // Afternoon:  12 - 17:59
    // Evening:    18 - 23:59
    var d = new Date();
    var hour = d.getHours();

    var timeslot = {};
    timeslot.day = d.getDay();
    
    if (0 <= hour && hour < 6)
      timeslot.hour = 'night';
    else if (6 <= hour && hour < 12)
      timeslot.hour = 'morning';
    else if (12 <= hour && hour < 18)
      timeslot.hour = 'afternoon';
    else //if (18 <= hour && hour <= 23)
      timeslot.hour = 'evening';
    
    return timeslot;
  },

  shorten: function(answer) {
    if (this.debug) console.log('\nBEFORE shorten\n' + answer);
    // Example input:
    // "
    // Holdeplassen nærmest Gløshaugen er Gløshaugen Syd. Buss 5 går fra
    // Gløshaugen Syd kl. 2054 til Prinsen kinosenter kl. 2058 og buss 19
    // går fra Prinsen kinosenter kl. 2105 til Studentersamfundet kl. 2106.
    //
    // Tidene angir tidligste passeringer av holdeplassene.
    // "

    // All newlines -> Spaces, we don't want to work with multiline strings when regexing
    answer = answer.replace(/\n/g, ' ').trim();
    // Slice away from string end: "Tidene angir tidligste passeringer av holdeplassene."
    answer = answer.replace(/(Tidene angir|The hours indicate).*/gi, '');
    // Remove "Jeg antar du mener avganger fra ikveld. 27. Jan. 2014 er en mandag."
    answer = answer.replace(/^Jeg antar.*?[man|tirs|ons|tors|fre|lør]dag\. /i, '');
    answer = answer.replace(/^I assume.*?[mon|tues|wednes|thurs|fri|satur]day\. /i, '');
    // Remove any double spaces
    answer = answer.replace(/  /g, ' ');
    // Done!
    if (this.debug) console.log('\nAFTER shorten\n' + answer);
    return answer;
  },

  convert12to24: function(answer) {
    // Don't convert
    if (answer.match(/ (am|pm)/gi) === null)
      return answer;
    
    if (this.debug) console.log('BEFORE 12to24\n' + answer);

    // Extract time strings
    var gotcha = true;
    var timePieces = [];
    do {
      var timePiece = answer.match(/\d+:\d+ [ap]m/i);
      if (timePiece !== null) {
        var t = timePiece[0];
        timePieces.push(t);
        answer = answer.replace(t, '§');
      }
    } while (timePiece !== null);

    // Change each time string individually
    for (i in timePieces) {
      var t = timePieces[i];
      var hours = Number(t.match(/^(\d+):/)[1]);
      var ampm = t.match(/\s(.*)$/)[1].toLowerCase();
      if (ampm == "pm" && hours<12)
        hours = hours+12;
      if (ampm == "am" && hours==12)
        hours = hours-12;
      timePieces[i] = t.replace(/(\d+):(\d+) (am|pm)/i, hours + ':$2');
    }

    // Load answer with new time strings
    for (i in timePieces) {
      answer = answer.replace(/§/, timePieces[i]);
    }
    if (this.debug) console.log('AFTER 12to24\n' + answer);
    return answer;
  },

  prettify: function(answer) {
    // If not meant to be prettified
    if (answer.match(/(Buss \d+ (passerer|går fra) .*? kl\. )|(Bus \d+ (|passes by|goes from) .*? at )/) == null)
      return answer;
    
    if (this.debug) console.log('\nBEFORE prettify\n' + answer);

    //
    // The advanced stuff first: the routes with stops in-between
    //

    // Answer:
    // Holdeplassen nærmest Gløshaugen er Gløshaugen Syd. Buss 5 går fra
    // Gløshaugen Syd kl. 2139 til Prinsen kinosenter kl. 2143 og buss 66
    // går fra Prinsen kinosenter kl. 2148 til Studentersamfundet kl. 2149."

    // Capture groups:
    // 1. 36
    // 2. Høiset
    // 3. 1002
    // 4. Lerkendal gård
    // 5. 1009
    // 6. 8
    // 7. Lerkendal gård
    // 8. 1027
    // 9. Steinan
    // 10. 1040

    // Target:
    // Ta buss 36 fra Høiset 0616 til 1009 Lerkendal Gård
    // -> Så buss 8 fra Lerkendal Gård 1027 til 1040 Steinan

    answer = answer.replace(/Buss (\d+) går fra (.*?) kl\. (\d{4}) til (.*?) kl\. (\d{4}) og buss (\d+) går fra (.*?) kl\. (\d{4}) til (.*?) kl\. (\d{4})\./gi,
      '@Ta først buss $1 fra $2 $3 til $4 $5...@...deretter buss $6 fra $7 $8 til $9 $10');
    answer = answer.replace(/Bus (\d+) goes from (.*?) at (\d+:\d+) to (.*?) at (\d+:\d+) and bus (\d+) goes from (.*?) at (\d+:\d+) to (.*?) at (\d+:\d+\.)/gi,
      '@Take the first bus $1 from $2 $3 to $4 $5...@...then bus $6 from $7 $8 to $9 $10');

    //
    // Now the easier stuff: the direct routes
    //

    // Answer 1:
    // Buss 66 passerer NTNU Dragvoll kl. 1816 og kl. 1831 og kommer til
    // Dronningens gate D1, 31 minutter senere. Buss 5 passerer NTNU Dragvoll
    // kl. 1820, kl. 1830 og kl. 1840 og kommer til Kongens gate K1, 15
    // minutter senere. Buss 36 passerer NTNU Dragvoll kl. 1826 og kommer
    // til Munkegata M4, 16 minutter senere.
    
    // Answer 2:
    // 12. Des. 2013 er en torsdag. Holdeplassen nærmest Gløshaugen er
    // Gløshaugen Syd. Buss 22 går fra Gløshaugen Syd kl. 0616 til Prinsen
    // kinosenter kl. 0621 og buss 8 går fra Prinsen kinosenter kl. 0627
    // til Studentersamfundet kl. 0628.

    // Target:
    // Holdeplass: NTNU Dragvoll
    // Buss 66: 1816, 1831 til Dronningens gate D1 (31 minutter)
    // Buss 5: 1820, 1830, 1840 til Kongens gate K1 (15 minutter)
    // Buss 36: 1826, kommer til Munkegata M4 (16 minutter)

    // Put an @ where you want a linebreak

    // Replace "Holdeplassen nærmest Gløshaugen er Gløshaugen Syd." with just "Holdeplass: Gløshaugen Syd"
    answer = answer.replace(/Holdeplassen nærmest .*? er (.*?)\. /gi, '@Holdeplass: $1 ');
    answer = answer.replace(/The station nearest to .*? is (.*?)\. /gi, '@Station: $1 ');
    // Replace "Buss 66 passerer NTNU Dragvoll kl." with just "Buss 66:"
    answer = answer.replace(/(Buss \d+) passerer .*? kl\. /gi, '@$1 går ');
    answer = answer.replace(/(Bus \d+) passes by .*? at /gi, '@$1 leaves ');
    // Replace "og kl." with just a comma
    answer = answer.replace(/,?( og)? kl\. /gi, ', ');
    answer = answer.replace(/,?( and)? at (\d+)/gi, ', $2');
    // Make sure the first time isn't prefixed with a comma, "Dragvoll, 11:08, 12:10" -> "Dragvoll 11:08, 12:10"
    answer = answer.replace(/(\w+), (\d{2}:?\d{2})/gi, '$1 $2');
    // Replace "og kommer til Munkegata M4, 16 minutter senere" with just ""
    answer = answer.replace(/og kommer til (.*?), (\d+)(-\d+)? minutter senere./gi, 'til $1'); // på $2 min');
    answer = answer.replace(/and arrives at (.*?), (\d+)(-\d+)? minutes later./gi, 'to $1');

    // Replace 2321 with 23:21, but not when it says "11 Des. 2013 er en onsdag"
    answer = answer.replace(/(\d\d)(\d\d)(?! (er en|is a))/gi, '$1:$2');
    // English version already contains colons

    // Trim and remove punctuation at end of line
    answer = answer.trim();
    answer = answer.replace(/[\.,;:]$/,'');
    // Don't start with a line break
    answer = answer.replace(/^@/, '');

    if (this.debug) console.log('\nAFTER prettify\n' + answer);
    return answer;
  },

}
