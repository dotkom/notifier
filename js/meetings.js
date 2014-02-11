var Meetings = {
  debug: 0,
  debugApi: 0,
  debugThisApi: 'https://online.ntnu.no/service_static/dev_meeting_plan',
  debugString: 0,
  debugThisString: '08:00-10:00 arrKom\n14:00-16:00 triKom\n18:00-23:59 dotKom',
  
  msgNone: 'Kontoret er ledig resten av dagen',
  msgError: 'Frakoblet fra møteplan',
  
  get: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }
    
    var api = Affiliation.org[localStorage.affiliationKey1].hw.apis.meetings;
    
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
        console.lolg('ERROR: Failed to get todays meeting plan.');
        callback(self.msgError);
      },
    });
  },

  prettifyTodaysMeetings: function(meetings) {
    meetings = meetings.trim();
    // Change 00:00 to 24
    meetings = meetings.replace(/00:00/g, '24');
    if (this.debug) console.log('24\t::', meetings);
    // Remove unnecessarily specific time info 10:00 -> 10, including the academic fifteen minutes
    meetings = meetings.replace(/:(00|15)/g, '');
    if (this.debug) console.log(':00\t::', meetings);
    // Trim unnecessary zero in time 08 -> 8
    meetings = meetings.replace(/0(\d)/g, '$1');
    if (this.debug) console.log('08\t::', meetings);
    // Add spaces for...
    // ...times "10-16:30" -> "10 - 16:30"
    // ...days "Fredag-Søndag" -> "Fredag - Søndag"
    // ...dates "14.2-16.2" -> "14.2 - 16.2"
    meetings = meetings.replace(/(dag|\d) ?- ?(\d+[\.:]?\d*|[a-zæøå]+dag)/gi, '$1 - $2:');
    if (this.debug) console.log('_ \t::', meetings);
    // Change times like 23:30 and 23:59 to just 24
    meetings = meetings.replace(/22:(30|59)/g, '23');
    meetings = meetings.replace(/23:(30|59)/g, '24');
    if (this.debug) console.log(':30\t::', meetings);
    return meetings;
  },

}
