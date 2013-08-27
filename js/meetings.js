var Meetings = {
  msgNone: 'Ingen flere møter i dag',
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
    
    var api = Affiliation.org[localStorage.affiliationKey1].meetingsApi;
    
    // Receives the meeting plan for today
    var self = this;
    Ajaxer.getPlainText({
      url: (self.debugApi ? self.debugThisApi : api),
      success: function(meetings) {
        if (self.debug) console.log('Raw meetings:\n\n', meetings);
        
        // Debugging a particular string right now?
        if (self.debugString)
          meetings = self.debugThisString;

        if (meetings != '') {
          // Prettify todays meetings
          var prettyMeetings = self.prettifyTodaysMeetings(meetings);
          if (self.debug) console.log('Pretty meetings:', prettyMeetings);

          callback(prettyMeetings);
        }
        else {
          // Empty string returned from API
          callback(self.msgNone);
        }
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
    // Change times like 23:30 and 23:59 to just 24
    meetings = meetings.replace(/22:(59|30)/g, '23');
    meetings = meetings.replace(/23:(59|30)/g, '24');
    return meetings;
  },

}
