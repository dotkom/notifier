var Meetings = {
  api: 'https://online.ntnu.no/service_static/meeting_plan',
  msgError: 'Frakoblet fra møteplan',
  debugMeetings: 0,
  debugMeetingsString: '08:00-10:00 arrKom\n14:00-16:00 triKom\n18:00-23:59 dotKom',

  get: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    // Receives the meeting plan for today
    var self = this;
    $.ajax({
      url: self.api,
      success: function(meetings) {

        // If meeting debugging is enabled
        if (self.debugMeetings) {
          meetings = self.debugMeetingsString;
        }

        meetings = meetings.trim()
        callback(meetings);
      },
      error: function(jqXHR, text, err) {
        if (DEBUG) console.log('ERROR: Failed to get todays meeting plan.');
        callback(self.msgError);
      },
    });
  },

}
