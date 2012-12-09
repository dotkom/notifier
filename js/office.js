var Office = {
  TITLE_ERROR: 'Oops',
  TITLE_OPEN: 'Åpent',
  TITLE_CLOSED: 'Lukket',
  TITLE_MEETING: 'Møte',
  TITLE_WAFFLES: 'Vafler',
  MSG_ERROR: 'Klarte ikke hente kontorstatus',
  MSG_OPEN: 'Gratis kaffe og te til alle!',
  MSG_CLOSED: 'Finn et komitemedlem for å åpne opp.',
  MSG_UNTITLED_MEETING: 'Kontoret er opptatt', // titled meetings and waffles get names from calendar entries
  LIGHT_LIMIT: 840,

  get: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    var self = this;
    this.getEventData( function(status, title, message) {
      if (status == 'open') {
        self.getLightData(callback);
      }
      else {
        callback(status, title, message);
      }
    });
  },

  getEventData: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }
    
    // Receives info on current event from Onlines servers (without comments)
    // 1              // 0=closed, 1=meeting, 2=waffles, 3=error
    // Møte: dotKom   // event title or 'No title'-meeting or nothing
    var self = this;
    $.ajax({
      url: 'https://online.ntnu.no/service_static/online_notifier',
      success: function(data) {
        var status = data.split('\n',2)[0];
        var title = data.split('\n',2)[1];

        // empty meeting title?
        if (title == '' && status == 1)
          title = self.MSG_UNTITLED_MEETING;

        // set the status from fetched data
        switch(Number(status)) {
          case 0: callback('open', self.TITLE_OPEN, self.MSG_OPEN); break;
          case 1: callback('meeting', self.TITLE_MEETING, title); break;
          case 2: callback('waffle', self.TITLE_WAFFLES, title); break;
          default: callback('error', self.TITLE_ERROR, 'eventStatus was "'+status+'"');
        }
      },
      error: function(jqXHR, text, err) {
        if (DEBUG) console.log('ERROR: Failed to get event data.');
        callback('error', self.TITLE_ERROR, self.MSG_ERROR);
      },
    });
  },

  getLightData: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    // Receives current light intensity from the office: OFF 0-800-1023 ON
    var self = this;
    $.ajax({
      url: 'http://draug.online.ntnu.no/lys.txt',
      success: function(data) {
        if (data > self.LIGHT_LIMIT) {
          callback('closed', self.TITLE_CLOSED, self.MSG_CLOSED);
        }
        else {
          callback('open', self.TITLE_OPEN, self.MSG_OPEN);
        }
      },
      error: function(jqXHR, err) {
        if (DEBUG) console.log('ERROR: Failed to get light data.');
        callback('error', self.TITLE_ERROR, self.MSG_ERROR);
      },
    });
  },

  getTodaysEvents: function(callback) {
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
        callback();
      },
    });
  },

}
