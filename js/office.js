var Office = {
  MSG_ERROR: 'Noe gikk galt, prøver igjen...',
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
    this.getLightData( function(status, title) {
      if (status == undefined) {
        self.getEventData(callback);
      }
      else {
        callback(status, title);
      }
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
    })
    .success(function(data) {
      if (data > this.LIGHT_LIMIT) {
        callback('closed', self.MSG_CLOSED);
      }
      else {
        callback();
      }
    })
    .fail(function(jqXHR, err) {
      if (DEBUG) console.log('ERROR: Failed to get light data.');
      callback('error', self.MSG_ERROR);
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
    })
    .success(function(data) {
      var status = data.split('\n',2)[0];
      var title = data.split('\n',2)[1];

      // empty meeting title?
      if (title == '' && status == 1)
        title = self.MSG_UNTITLED_MEETING;

      // set the status from fetched data
      switch(Number(status)) {
        case 0: callback('open', self.MSG_OPEN); break;
        case 1: callback('meeting', title); break;
        case 2: callback('waffle', title); break;
        case 3: callback('error', 'eventStatus was 3 (error)'); break;
        default: officeStatus_error('error', 'determineEventStatus switched on '+Number(status));
      }
    })
    .fail(function(jqXHR, err) {
      if (DEBUG) console.log('ERROR: Failed to get event data.');
      callback('error', self.MSG_ERROR);
    });
  },

}
