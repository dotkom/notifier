"use strict";

var Cantina = {

  // URLs
  api: API_SERVER_1 + 'cantina/',
  webHours: 'https://www.sit.no/mat',
  webDinner: 'https://www.sit.no/middag',
  // Messages
  msgClosed: 'Ingen publisert meny i dag',
  msgConnectionError: 'Frakoblet fra Notiwire',
  msgUnsupportedCantina: 'Kantinen støttes ikke',
  names: {
    // Cantinas
    'dmmh': 'DMMH',
    'dragvoll': 'Dragvoll',
    'elektro': 'Elektro',
    'elgeseter': 'Elgeseter',
    'hangaren': 'Hangaren',
    'kalvskinnet': 'Kalvskinnet',
    'kjel': 'Kjelhuset',
    'moholt': 'Moholt',
    'mtfs': 'MTFS',
    'realfag': 'Realfag',
    'rotvoll': 'Rotvoll',
    'tungasletta': 'Tungasletta',
    'tyholt': 'Tyholt',
    'oya': 'Øya',
    // Kiosks
    'storkiosk dragvoll': 'Storkiosk Dragvoll',
    'storkiosk gloshaugen': 'Storkiosk Gløshaugen',
    'storkiosk oya': 'Storkiosk Øya',
    'idretts. dragvoll': 'Idretts. Dragvoll',
    // Cafés
    'sito dragvoll': 'Sito Dragvoll',
    'sito realfag': 'Sito Realfag',
    'sito stripa': 'Sito Stripa',
  },

  _autoLoadDefaults_: function() {
    var ls = localStorage;
    if (ls.showCantina === undefined)
      ls.showCantina = 'true';
    if (ls.cantina1 === undefined)
      ls.cantina1 = 'hangaren';
    if (ls.cantina2 === undefined)
      ls.cantina2 = 'realfag';
  }(),

  get: function (cantina, callback) {
    if (this.names[cantina] === undefined) {
      console.error(this.msgUnsupportedCantina);
      return;
    }

    var self = this;

    Ajaxer.getJson({
      url: this.api + cantina,
      success: callback,
      error: function() {
        console.error(self.msgConnectionError);
        callback(self.msgConnectionError);
      },
    });
  },

};
