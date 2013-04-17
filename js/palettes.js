var Palettes = {
  
  /*
  background: {
    'pink':     {'-webkit-filter': 'hue-rotate(92deg)'},
    'purple':   {'-webkit-filter': 'hue-rotate(66deg)'},
  },
  */

  palettes: {
    'blue': 'less/palettes/blue.css',
    'cyan': 'less/palettes/cyan.css',
    'green': 'less/palettes/green.css',
    'grey': 'less/palettes/grey.css',
    'red': 'less/palettes/red.css',
    'white': 'less/palettes/white.css',
    'yellow': 'less/palettes/yellow.css',
    
    'pink': 'less/palettes/pink.css',
    'purple': 'less/palettes/purple.css',
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