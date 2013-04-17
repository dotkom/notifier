var Palettes = {
  
  /*
  background: {
    'pink':     {'-webkit-filter': 'hue-rotate(92deg)'},
    'purple':   {'-webkit-filter': 'hue-rotate(66deg)'},
    'green':    {'-webkit-filter': 'hue-rotate(-85deg)'},
    'grey':     {'-webkit-filter': 'grayscale(1) hue-rotate(0deg)'},
    'yellow':   {'-webkit-filter': 'hue-rotate(-151deg) saturate(1.6) brightness(2.3)'},
  },
  */

  palettes: {
    'blue': 'less/palettes/blue.css',
    'white': 'less/palettes/white.css',
    'cyan': 'less/palettes/cyan.css',
    
    'pink': 'less/palettes/pink.css',
    'red': 'less/palettes/red.css',
    'purple': 'less/palettes/purple.css',
    'green': 'less/palettes/green.css',
    'grey': 'less/palettes/grey.css',
    'yellow': 'less/palettes/yellow.css',
  },

  getColor: function(color) {
    if (this.palettes[color] != undefined) {
      return this.palettes[color];
    }
    else {
      if (this.debug) console.log('ERROR: unsupported palette', color);
      return this.palettes['blue'];
    }
  },

}