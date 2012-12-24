var Meetings = {
  MSG_ERROR: 'Klarte ikke hente møteplan',

  get: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    // Receives the meeting plan for today
    var self = this;
    $.ajax({
      url: 'https://online.ntnu.no/service_static/online_notifier2',
      success: function(data) {
        callback(data);
      },
      error: function(jqXHR, text, err) {
        if (DEBUG) console.log('ERROR: Failed to get todays meeting plan.');
        callback(self.MSG_ERROR);
      },
    });
  },

}
