var Office = {
  eventApi: Affiliation.org[localStorage.affiliationKey1].eventApi,
  lightApi: Affiliation.org[localStorage.affiliationKey1].lightApi,
  titleError: 'Oops',
  titleOpen: 'Åpent',
  titleClosed: 'Lukket',
  titleMeeting: 'Møte',
  titleWaffles: 'Vafler',
  msgError: 'Klarte ikke hente kontorstatus',
  msgOpen: 'Gratis kaffe og te til alle!',
  msgClosed: 'Finn et komitemedlem for å åpne opp.',
  msgUntitledMeeting: 'Kontoret er opptatt', // titled meetings and waffles get names from calendar entries
  lightLimit: 860,

  debug: 0,

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
        // status: "closed"
        // title: "Lukket"
        // message: "Finn et komitemedlem for å åpne opp"
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
    Ajaxer.getPlainText({
      url: self.eventApi,
      success: function(data) {
        var status = data.split('\n',2)[0];
        var title = data.split('\n',2)[1];

        // empty meeting title?
        if (title == '' && status == 1)
          title = self.msgUntitledMeeting;

        // set the status from fetched data
        switch(Number(status)) {
          case 0: callback('open', self.titleOpen, self.msgOpen); break;
          case 1: callback('meeting', self.titleMeeting, title); break;
          case 2: callback('waffle', self.titleWaffles, title); break;
          default: callback('error', self.titleError, self.msgError);
        }
      },
      error: function(jqXHR, text, err) {
        if (self.debug) console.log('ERROR: Failed to get event data.');
        callback('error', self.titleError, self.msgError);
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
    Ajaxer.getPlainText({
      url: self.lightApi,
      success: function(data) {
        if (data > self.lightLimit) {
          callback('closed', self.titleClosed, self.msgClosed);
        }
        else {
          callback('open', self.titleOpen, self.msgOpen);
        }
      },
      error: function(jqXHR, err) {
        if (self.debug) console.log('ERROR: Failed to get light data.');
        callback('error', self.titleError, self.msgError);
      },
    });
  },

}
