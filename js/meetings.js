var Meetings = {
  api: 'https://online.ntnu.no/service_static/meeting_plan',
  msgError: 'Frakoblet fra møteplan',
  
  debug: 0,
  debugApi: 0,
  debugThisApi: 'https://online.ntnu.no/service_static/dev_meeting_plan',
  debugString: 0,
  debugThisString: '08:00-10:00 arrKom\n14:00-16:00 triKom\n18:00-23:59 dotKom',

  get: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    // Receives the meeting plan for today
    var self = this;
    $.ajax({
      url: (self.debugApi ? self.debugThisApi : self.api),
      success: function(meetings) {
        if (self.debug) console.log('Raw meetings:\n\n', meetings);
        
        // Debugging a particular string right now?
        if (self.debugString)
          meetings = self.debugThisString;

        // Prettify todays meetings
        var prettyMeetings = self.prettifyTodaysMeetings(meetings);
        if (self.debug) console.log('Pretty meetings:', prettyMeetings);

        callback(prettyMeetings);
      },
      error: function(jqXHR, text, err) {
        if (DEBUG) console.log('ERROR: Failed to get todays meeting plan.');
        callback(self.msgError);
      },
    });
  },

  prettifyTodaysMeetings: function(meetings) {
    meetings = meetings.trim();
    // Remove unnecessarily specific time info 10:00 -> 10
    meetings = meetings.replace(/:00/g, '');
    // Trim unnecessary zero in time 08 -> 8
    meetings = meetings.replace(/0(\d)/g, '$1');
    // Add spaces for times "10-16:30" -> "10 - 16:30" and days "Fredag-Søndag" -> "Fredag - Søndag"
    meetings = meetings.replace(/(dag|\d) ?- ?(\d+:?\d*|[a-zæøå]+dag)/gi, '$1 - $2:');
    return meetings;
  },

}
