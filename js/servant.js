var Servant = {
  api: 'https://online.ntnu.no/service_static/servant_list',
  msgError: 'Frakoblet fra vaktplan',

  get: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    // Receives the meeting plan for today
    var self = this;
    $.ajax({
      url: self.api,
      success: function(servant) {
        servantList = servant.split("\n");
        currentServant = servantList[0];
        // If it's an actual servant with a time slot like this:
        // 12:00-13:00: Michael Johansen
        if (currentServant.match(/\d+:\d+\-\d+:\d+/)) {
          // Match out the name from the line
          var servantName = currentServant.match(/(\d+:\d+\-\d+:\d+ )([a-zA-ZæøåÆØÅ ]+)/)[2];
          callback(servantName);
        }
        else {
          // Probably no servant at the moment, value is "Ingen"
          // ...or an error message, either way we'll return it
          callback(currentServant);
        }
      },
      error: function(jqXHR, text, err) {
        if (DEBUG) console.log('ERROR: Failed to get current servant.');
        callback(self.msgError);
      },
    });
  },

}
