var Stops = {
  api: 'http://api.visuweb.no/bybussen/3.0/Stops/GetStops',
  apiKey: '/5ce70df7d7ffa2a6728aef4eaf9200db', // phasing out oldkey: f6975f3c1a3d838dc69724b9445b3466
  msgDisconnected: 'Frakoblet fra api.visuweb.no',
  msgKeyExpired: localStorage.extensionName + ' trenger oppdatering',
  msgParsingCompleted: 'Busslister lastet fra localstorage',
  msgParsingStopsSuccess: 'Busslister lastet fra API',
  msgParsingStopsFailed: 'Klarte ikke hente liste over busstopp',
  msgMalformedLocalStops: 'Feil format på lokal liste over busstopp',
  msgMalformedExternalStops: 'Feil format på hentet liste over busstopp',

  debug: 0,

  // List format:
  // Stops.list = {
  //   16011333: "Gløshaugen Nord",
  //   16011265: "Gløshaugen Syd",
  // }
  list: null,
  names: null,

  load: function(callback) {
    if (callback == undefined) {
      if (this.debug) console.log('WARNING: Callback is recommended. The callback contains completion/error message.');
    }

    // Check if the lists we have are old. They are expensive to fetch
    // so we'll only get the list from Tri's API every two weeks and
    // this is only checked when the user opens the options page.
    var needNewList = false;
    var listAge = localStorage.stopListAge;
    if (listAge == undefined) {
      needNewList = true;
    }
    else {
      var now = new Date();
      var listAge = new Date(JSON.parse(listAge));
      var diff = now - listAge;
      // Using four weeks instead of actual month
      var fourWeeks = 2 * 7 * 24 * 60 * 60 * 1000;
      if (this.debug) console.log('load - ListAge:',fourWeeks,'<',diff,':',(fourWeeks<diff));
      if (fourWeeks < diff) {
        needNewList = true;
      }
    }

    // Parse the saved copies of stopList and stopNames
    if (!needNewList && localStorage.stopList != undefined && localStorage.stopNames != undefined) {
      try {
        if (this.debug) console.log('load - parsing saved lists');
        this.list = JSON.parse(localStorage.stopList);
        this.names = JSON.parse(localStorage.stopNames);
        if (callback != undefined)
          callback(this.msgParsingCompleted);
      }
      catch (err) {
        console.log('ERROR: '+this.msgMalformedLocalStops);
        this.reset(callback);
      }
    }
    // Get a fresh copy of bus stops
    else {
      if (this.debug) console.log('load - getting fresh lists');
      var self = this;
      Ajaxer.getJson({
        url: self.api + self.apiKey,
        success: function(json) {
          if (this.debug) console.log('load - fresh lists retrieved');
          self.parse(json, callback);
        },
        error: function(jqXHR, text, err) {
          if (callback != undefined)
            callback(self.msgDisconnected);
        },
      });
    }
  },

  reset: function(callback) {
    if (this.debug) console.log('reset');
    // Remove any saved info
    localStorage.removeItem('stopList');
    localStorage.removeItem('stopNames');
    // Get a new, fresh list with requested callback
    this.load(callback);
  },

  parse: function(json, callback) {
    if (this.debug) console.log('parse', json);

    // API response will contain 'unauthorized' when key is invalid or arguments are missing
    if (typeof json === 'string') {
        if (json.indexOf('unauthorized') !== -1) {
        console.log('ERROR: ' + this.msgKeyExpired);
        if (callback != undefined)
          callback(this.msgKeyExpired);
        return;
      }
    }
    try {
      var busStops = json['busStops'];

      // Bus stops missing from the json?
      if (busStops == undefined) {
        if (callback != undefined)
          callback(this.msgMalformedExternalStops);
        console.log('ERROR: ' + this.msgMalformedExternalStops);
        return;
      }

      // The list with both stopIds and stopNames
      var tempList = {};
      for (i in busStops) {
        // Important: Use locationId, not busStopId
        tempList[busStops[i].locationId] = busStops[i].name;
      }
      this.list = tempList;
      // From this.list, create list with just stopNames
      var tempNames = [];
      for (i in this.list) {
        tempNames.push(this.list[i]);
      }
      this.names = tempNames;

      // Save lists to localStorage when done
      localStorage.stopList = JSON.stringify(this.list);
      localStorage.stopNames = JSON.stringify(this.names);

      // ...and note the time so we can compare it later
      localStorage.stopListAge = JSON.stringify(new Date());

      // All done!
      if (this.debug) console.log('parse - list parsing success');
      if (callback != undefined) {
        callback(this.msgParsingStopsSuccess);
      }
    }
    catch (err) {
      console.log('ERROR: ' + this.msgParsingStopsFailed + ': ' + err);
      if (callback != undefined)
        callback(this.msgParsingStopsFailed);
    }
  },

  // Index of following functions:
  // - idToName( stopId )
  // - nameToIds( stopName )
  // - nameToDirections( stopName )
  // - nameAndDirectionToId( stopName, direction )
  // - partialNameToPotentialNames( nameStart )

  idToName: function(stopId) {
    if (this.debug) console.log('idToName', stopId);
    return this.list[stopId];
  },

  nameToIds: function(stopName) {
    if (this.debug) console.log('nameToIds', stopName);
    if (typeof stopName != 'string')
      return console.log('ERROR: stopName must be a string');

    // Remember: One stop name can have two IDs, one 'til byen' and one 'fra byen'.
    // Using all lowercase, just in case the user has been inconsistent with casing.
    stopName = stopName.trim().toLowerCase();
    var foundStops = [];
    for (id in this.list) {
      var currentStop = this.list[id].toLowerCase();
      if (currentStop == stopName) {
        foundStops.push(id);
      }
    }
    return foundStops;
  },

  nameToDirections: function(stopName) {
    if (this.debug) console.log('nameToDirections', stopName);
    if (typeof stopName != 'string')
      return console.log('ERROR: stopName must be a string');

    // The fourth character of a stop ID tells us which direction a bus is going
    var foundStops = this.nameToIds(stopName);
    var toTown = false;
    var fromTown = false;
    for (i in foundStops) {
      var currentId = foundStops[i] + '';
      if (currentId.charAt(4) == '1')
        toTown = true;
      else if (currentId.charAt(4) == '0')
        fromTown = true;
    }
    if (toTown && fromTown)
      return ['til byen', 'fra byen'];
    else if (toTown)
      return ['til byen'];
    else if (fromTown)
      return ['fra byen'];
    else
      return [];
  },

  nameAndDirectionToId: function(stopName, direction) {
    if (this.debug) console.log('nameAndDirectionToId', stopName, direction);
    if (typeof stopName != 'string')
      return console.log('ERROR: stopName must be a string');
    if (typeof direction != 'string')
      return console.log('ERROR: direction must be a string');

    // Get possible IDs with stopName and find the right one by filtering with direction
    var checkTheseStops = this.nameToIds(stopName);
    if (direction == 'til byen') {
      for (i in checkTheseStops) {
        var currentId = checkTheseStops[i] + '';
        if (currentId.charAt(4) == '1') {
          return currentId;
        }
      }
    }
    else if (direction == 'fra byen') {
      for (i in checkTheseStops) {
        var currentId = checkTheseStops[i] + '';
        if (currentId.charAt(4) == '0') {
          return currentId;
        }
      }
    }
    else {
      console.log('ERROR: '+this.msgInvalidDirection);
      return -1;
    }
  },
  
  partialNameToPotentialNames: function(nameStart) {
    if (this.debug) console.log('partialNameToPotentialNames', nameStart);
    if (typeof nameStart != 'string')
      return console.log('ERROR: nameStart must be a string');

    // Using lowercase all the way to allow user case insensitivity
    nameStart = nameStart.toLowerCase();
    var foundStops = [];
    var i = 0;
    // Find stops which start with nameStart
    for (id in this.names) {
      var currentName = this.names[id];
      if (currentName.toLowerCase().indexOf(nameStart) == 0) {
        // If not already added, add newfound name
        if (foundStops.indexOf(currentName) == -1) {
          foundStops.push(currentName);
        }
      }
    }
    return foundStops;
  },

}
