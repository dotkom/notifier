var Servant = {
  MSG_ERROR: 'Klarte ikke sjekke kalender med kontorvakter',

  get: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    callback('David Storjord');

    // // Receives the meeting plan for today
    // var self = this;
    // $.ajax({
    //   url: 'https://online.ntnu.no/service_static/online_notifier3',
    //   success: function(servant) {
    //     callback(servant);
    //   },
    //   error: function(jqXHR, text, err) {
    //     if (DEBUG) console.log('ERROR: Failed to get current servant.');
    //     callback(self.MSG_ERROR);
    //   },
    // });
  },

}
