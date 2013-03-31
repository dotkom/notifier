var Palettes = {
  
  /*
  background: {
    'blue':     {'-webkit-filter': 'hue-rotate(0deg)'},
    'cyan':     {'-webkit-filter': 'hue-rotate(-30deg) saturate(3) brightness(1.5)'},
    'pink':     {'-webkit-filter': 'hue-rotate(92deg)'},
    'red':      {'-webkit-filter': 'hue-rotate(144deg)'},
    'purple':   {'-webkit-filter': 'hue-rotate(66deg)'},
    'green':    {'-webkit-filter': 'hue-rotate(-85deg)'},
    'grey':     {'-webkit-filter': 'grayscale(1) hue-rotate(0deg)'},
    'yellow':   {'-webkit-filter': 'hue-rotate(-151deg) saturate(1.6) brightness(2.3)'},
  },
  */

  palettes: {
    'blue': 'less/palette_blue.css',
    'white': 'less/palette_white.css',
    'cyan': 'less/palette_cyan.css',
    
    'pink': 'less/palette_pink.css',
    'red': 'less/palette_red.css',
    'purple': 'less/palette_purple.css',
    'green': 'less/palette_green.css',
    'grey': 'less/palette_grey.css',
    'yellow': 'less/palette_yellow.css',
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