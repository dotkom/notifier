var Office = {
  debug: 0,
  debugStatus: {enabled: 0, string: 'coffee\nDebugging office status'},

  // Light limit, 0-860 is ON, 860-1023 is OFF
  lightLimit: 860,
  // Basic statuses have titles and messages (icons are fetched from affiliation)
  statuses: {
    'error': {title: 'Oops', color: 'LightGray', message: 'Klarte ikke hente kontorstatus'},
    'open': {title: 'Åpent', color: 'LimeGreen', message: 'Gratis kaffe og te til alle!'},
    'closed': {title: 'Lukket', color: 'yellow', message: 'Finn et komitemedlem for å åpne opp.'},
    'meeting': {title: 'Møte', color: 'red', message: 'Kontoret er opptatt'}, // meetings usually get message from calendar entries
  },
  // Food statuses have titles and icons (messages exist as calendar titles)
  foods: {
    'bun': {title: 'Boller', color: 'NavajoWhite', icon: './img/icon-bun.png', image: './img/image-bun.png'},
    'cake': {title: 'Kake', color: 'NavajoWhite', icon: './img/icon-cake.png', image: './img/image-cake.png'},
    'coffee': {title: 'Kaffekos', color: 'NavajoWhite', icon: './img/icon-coffee.png'},
    'pizza': {title: 'Pizza', color: 'NavajoWhite', icon: './img/icon-pizza.png', image: './img/image-pizza.png'},
    'taco': {title: 'Taco', color: 'NavajoWhite', icon: './img/icon-taco.png', image: './img/image-taco.png'},
    'waffle': {title: 'Vafler', color: 'NavajoWhite', icon: './img/icon-waffle.png', image: './img/image-waffle.png'},
  },

  get: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    var self = this;
    this.getEventData( function(status, message) {
      
      if (status == 'free' || self.debugOpenOrClosed()) {
        // No events are active, check lights to find open or closed
        self.getLightData(callback);
      }
      else {
        // An event is active, either meeting or a food status
        if (self.debug) console.log('Office:\n- status is', status, '\n- message is', message);
        callback(status, message);
      }
    });
  },

  getEventData: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    var eventApi = Affiliation.org[localStorage.affiliationKey1].hw.apis.event;
    
    // Receives info on current event from Onlines servers (without comments)
    // meeting        // current status
    // Møte: dotKom   // event title or 'No title'-meeting or nothing
    var self = this;
    Ajaxer.getPlainText({
      url: eventApi,
      success: function(data) {

        // Debug particular status?
        if (self.debug && self.debugStatus.enabled) {
          data = self.debugStatus.string;
        }

        var status = data.split('\n',2)[0]; // 'meeting'
        var message = data.split('\n',2)[1]; // 'Arbeidskveld med arrKom'

        if (self.debug) console.log('status is "'+status+'" and message is "'+message+'"');

        // empty meeting message?
        if (isEmpty(message)) {
          if (status == 'meeting') {
            message = self.statuses['meeting'].message;
          }
        }
        else {
          message = message.trim();
        }

        // Temporary support for the old system, backwards compatibility
        if (isNumber(status)) {
          switch(Number(status)) {
            case 0: callback('free'); break;
            case 1: callback('meeting', message); break;
            case 2: callback('waffle', message); break;
            case 3:
            default: callback('error', self.statuses['error'].message);
          }
        }
        else {
          status = status.trim();
          // Set the status from fetched data
          switch(status) {
            
            case 'free': callback('free'); break;

            case 'meeting': callback('meeting', message); break;
            
            case 'bun': callback('bun', message); break;
            case 'cake': callback('cake', message); break;
            case 'coffee': callback('coffee', message); break;
            case 'waffle': callback('waffle', message); break;
            case 'pizza': callback('pizza', message); break;
            case 'taco': callback('taco', message); break;
            
            case 'error':
            default: callback('error', self.statuses['error'].message);
          }
        }

      },
      error: function(jqXHR, text, err) {
        if (self.debug) console.log('ERROR: Failed to get event data.');
        callback('error', self.statuses['error'].message);
      },
    });
  },

  getLightData: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    var lightApi = Affiliation.org[localStorage.affiliationKey1].hw.apis.light;

    var debugStatus = null;
    if (this.debugOpenOrClosed())
      if (this.debugStatus.string.startsWith('closed'))
        debugStatus = 'closed';

    // Receives current light intensity from the office: OFF 0-lightLimit-1023 ON
    var self = this;
    Ajaxer.getPlainText({
      url: lightApi,
      success: function(data) {
        var lights = false;

        if (isNumber(data)) {
          lights = data < self.lightLimit;
        }
        else {
          lights = data.match(/(on|true|på)/gi) !== null;
        }

        if (lights || debugStatus == 'open') {
          if (self.debug) console.log('Office:\n- status is open\n- message is', self.statuses['open'].message);
          callback('open', self.statuses['open'].message);
        }
        else {
          if (self.debug) console.log('Office:\n- status is closed\n- message is', self.statuses['closed'].message);
          callback('closed', self.statuses['closed'].message);
        }
      },
      error: function(jqXHR, err) {
        if (self.debug) console.log('ERROR: Failed to get light data.');
        callback('error', self.statuses['error'].message);
      },
    });
  },

  debugOpenOrClosed: function() {
    if (Office.debug && Office.debugStatus.enabled) {
      if (Office.debugStatus.string.startsWith('open') || Office.debugStatus.string.startsWith('closed')) {
        return true;
      }
    }
    return false;
  },

}
