"use strict";

var Cantina = {

  api: 'http://passoa.online.ntnu.no/api/cantina/',
  web: 'https://www.sit.no/middag',
  msgClosed: 'Ingen publisert meny i dag',
  msgConnectionError: 'Frakoblet fra API',
  msgUnsupportedCantina: 'Kantinen støttes ikke',
  msgMalformedMenu: 'Galt format på meny',
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
    if (callback === undefined) {
      console.error('Callback required');
      return;
    }
    if (this.names[cantina] === undefined) {
      console.error(this.msgUnsupportedCantina);
      return;
    }

    var apiUrl = this.api + cantina;
    var self = this;

    Ajaxer.getJson({
      url: apiUrl,
      success: function(json) {
        callback(json);
      },
      error: function(jqXHR, text, err) {
        console.error(self.msgConnectionError);
        callback(self.msgConnectionError);
      },
    })
  },

};
