var Colors = {
  
  // CSS to add to #background-div
  background: {
    'blue':     {'-webkit-filter': 'hue-rotate(0deg)'},
    'cyan':     {'-webkit-filter': 'hue-rotate(-31deg)'},
    'pink':     {'-webkit-filter': 'hue-rotate(92deg)'},
    'red':      {'-webkit-filter': 'hue-rotate(144deg)'},
    'purple':   {'-webkit-filter': 'hue-rotate(66deg)'},
    'green':    {'-webkit-filter': 'hue-rotate(-85deg)'},
    'grey':     {'-webkit-filter': 'grayscale(1) hue-rotate(0deg)'},
    'yellow':   {'-webkit-filter': 'hue-rotate(-151deg) saturate(1.6) brightness(2.3)'},
  },

  // CSS to add to #bus-div
  bus: {
    'blue':     {'': ''},
  },

  // CSS to add to titles
  title {
    'blue':     {'': ''},
  },

  getBackgroundStyle: function(color) {
    if (this.background[color] != undefined) {
      return this.background[color];
    }
    else {
      if (this.debug) console.log('ERROR: unsupported color', color);
      return background['blue'];
    }
  },

  getBusStyle: function(color) {
    if (this.bus[color] != undefined) {
      return this.bus[color];
    }
    else {
      if (this.debug) console.log('ERROR: unsupported color', color);
      return bus['blue'];
    }
  },

  getTitleStyle: function(color) {
    if (this.title[color] != undefined) {
      return this.title[color];
    }
    else {
      if (this.debug) console.log('ERROR: unsupported color', color);
      return title['blue'];
    }
  },

}