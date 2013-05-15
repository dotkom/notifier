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
  },

  get: function(palette) {
    // Standard palette?
    if (this.palettes[palette] != undefined) {
      return this.palettes[palette];
    }

    // A special palette belonging to a specific affiliation?
    var affiliation = Affiliation.org[palette];
    if (typeof affiliation != 'undefined') {
      var path = Affiliation.org[palette].palettePath;
      if (typeof path != 'undefined') {
        return path;
      }
      else {
        console.log('ERROR: a special palette has not yet been created for the affiliation', palette);
        return this.palettes['blue'];
      }
    }

    console.log('ERROR: unsupported palette', palette);
    return this.palettes['blue'];
  },

}