"use strict";

var Cantina = {

  api: 'http://passoa.online.ntnu.no/api/cantina/',
  webHours: 'https://www.sit.no/mat',
  webDinner: 'https://www.sit.no/middag',
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

    var self = this;

    Ajaxer.getJson({
      url: this.api + cantina,
      success: callback,
      error: function(jqXHR, text, err) {
        console.error(self.msgConnectionError);
        // Temporary hack to work around a 400 Bad Request that really isn't
        if (jqXHR.responseText.indexOf('name') !== -1) {
          var json = jqXHR.responseText;
          try{
            json = JSON.parse(json);
            console.warn('Had to work around an error, found this:', json);
            callback(json);
          }
          catch(e) {
            callback(self.msgConnectionError);
          }
        }
        else {
          callback(self.msgConnectionError);
        }
      },
    })
  },

};
