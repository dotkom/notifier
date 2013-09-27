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

    return pieces.join('. ');
  },

}
