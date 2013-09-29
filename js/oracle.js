var Oracle = {
  api: 'http://m.atb.no/xmlhttprequest.php?service=routeplannerOracle.getOracleAnswer&question=',
  msgDisconnected: 'Frakoblet fra m.atb.no',

  get: function(question, callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }
    if (isEmpty(question)) {
      console.log('ERROR: question is empty');
      return;
    }

    // Encode URL component.... as it says below :D
    question = encodeURIComponent(question);

    var self = this;
    Ajaxer.getPlainText({
      url: self.api + question,
      success: function(answer) {
        answer = self.shorten(answer);
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
      'Spør et busspørsmål her!',
      'De som laget Notifier er ganske snille mot AtB.',
      'Ta bussen til Tiller og kjøp no stæsj du trenger.',
      'Ta bussen til Nidar og spis masse sjokolade.',
      'Tralala, jeg kan synge en sang.',
      'Buss her, buss der, buss overalt.',
      'Ta bussen til campus.',

      // Funfacts
      'Bussorakelet ble utviklet på NTNU, spør om noe!',
      'Tri M. Nguyen har laget APIet som brukes til sanntiden. Tri <3',
      'AtB har minibusser også.',
      'UKA har en egen buss.',
      'Flybussen går hvert 10. minutt.',
      'Leddbusser har wifi.',
      'AtB har også langdistansebusser, de er mørkegrønne.',
      'Da Roy Sindre fant nøkkelen ble det plutselig en bussapp før AtB visste hva som skjedde.',
      'En av bussjåførene er julenisse hver desember.',
      'Både AtB og SiT liker Notifier.',
      'Notifier fikk støtte for sanntidsbuss i versjon 1.3.0.',
      'Notifier og bussorakelet ble venner i Notifier versjon 1.3.1',
      'Tenk om Kantinelizzie hadde kjørt buss.',
      'Hvis du har installert Notifier på forskjellige maskiner kan du ha forskjellige busstopp på hver.',
      'Større busser, flere busser, raskere busser, AtB gjør alle tre på 5ern.',
      'En gang gikk 5ern via Gryta og Lohove til Dragvoll.',
      'Før i tiden møttes alle bussene i Munkegata/Dronningens gate.',
      'AtB laget egen bussapp som het Bussøyet, men den var for sent etter Bartebuss.',
      'Det finnes mange bussapper.',
      'AtB sitt API er laget av italienere.',
      'AtB sitt API har italienske metodenavn.',
      'Bartebuss og ByBussen er de beste bussappene.',
      'Bussene sjekker inn med GPS på hvert stopp, cirka.',
      'Bussene som må kjøre langt mellom hvert stopp har upresis sanntid.',
      'busskartet.no er ganske morsomt.',
      'Han som laget busskartet.no må ha kost seg gløgg i hjæl med alle de små bussene sine.',
      'Sekkemannen sitter alltid på en utgave av Under Dusken for å unngå bakterier fra bussetet.',

      // Om orakelet
      'Bussorakelets wiki er på ntnu.no/wiki/display/FUIROS',
      'Bussorakelet kom til live i 1998.',
      'I 2002 begynte bussorakelet å besvare spørsmål via SMS.',
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
      'Christoffer Jun Marcussen har vært med å lage bussorakelet (2011-2012)',
      'Jon S Bratseth har vært med å lage bussorakelet (1996-1997)',
      'Magnus Raaum har vært med å lage bussorakelet (2010-2011)',
      'Martin Thorsen Ranang har vært med å lage bussorakelet (2001-2011)',
      'Marius Qvam Wollamo har vært med å lage bussorakelet (2012-2013)',
      'Runar Andersstuen har vært med å lage bussorakelet (2011-2012)',
      'Rune Martin Andersen har vært med å lage bussorakelet (2011-2012)',
      'Rune Sætre har vært med å lage bussorakelet (2000-2012)',
      'Tore Amble har vært med å lage bussorakelet (1996-2012)',
      'Tore Bruland har vært med å lage bussorakelet (2004-2011)',
      'Trond Bø Engell har vært med å lage bussorakelet (2011-2012)',
    ];
    var randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    return randomGreeting;
  },

  // Private functions, do not use externally

  shorten: function(answer) {

    // Example:
    // "Holdeplassen nærmest Gløshaugen er Gløshaugen Syd. Buss 5 går fra
    // Gløshaugen Syd kl. 2054 til Prinsen kinosenter kl. 2058 og buss 19
    // går fra Prinsen kinosenter kl. 2105 til Studentersamfundet kl. 2106.
    // Tidene angir tidligste passeringer av holdeplassene."

    var pieces = answer.split('. ');

    // Slice away "Holdeplassen nærmest X er X."
    if (pieces[0].startsWith('Holdeplassen nærmest')) {
      pieces = pieces.slice(1);
    }

    // Slice away "Tidene angir tidligste passeringer av holdeplassene."
    if (pieces[pieces.length-1].startsWith('Tidene angir tidligste')) {
      pieces = pieces.slice(0, pieces.length-1);
    }

    return pieces.join('. ') + '.';
  },

}
