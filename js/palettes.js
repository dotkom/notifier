var Palettes = {

  palettes: {
    // Standard palettes
    'blue': 'less/palettes/blue.css',
    'cyan': 'less/palettes/cyan.css',
    'green': 'less/palettes/green.css',
    'grey': 'less/palettes/grey.css',
    'pink': 'less/palettes/pink.css',
    'purple': 'less/palettes/purple.css',
    'red': 'less/palettes/red.css',
    'yellow': 'less/palettes/yellow.css',
    // Special palettes
    'online': Affiliation.org['online'].palettePath,
  },

  get: function(palette) {
    if (this.palettes[palette] != undefined) {
      return this.palettes[palette];
    }
    else {
      if (this.debug) console.log('ERROR: unsupported palette', palette);
      return this.palettes['blue'];
    }
  },

}