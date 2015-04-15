"use strict";

var Palettes = {
  debug: 0,

  palettes: {
    // Standard palettes
    'blue': 'less/palettes/blue.css',
    'red': 'less/palettes/red.css',
    'cyan': 'less/palettes/cyan.css',
    'green': 'less/palettes/green.css',
    'purple': 'less/palettes/purple.css',
    'grey': 'less/palettes/grey.css',
    'yellow': 'less/palettes/yellow.css',
  },

  get: function(palette) {
    // Standard palette?
    if (this.palettes[palette] !== undefined) {
      return this.palettes[palette];
    }

    // A special palette belonging to a specific affiliation?
    var affiliation = Affiliation.org[palette];
    if (typeof affiliation !== 'undefined') {
      var path = Affiliation.org[palette].palettePath;
      if (typeof path !== 'undefined') {
        return path;
      }
      else {
        if (this.debug) console.error('a special palette has not yet been created for the affiliation', palette);
        return this.palettes['blue'];
      }
    }

    if (this.debug) console.error('unsupported palette', palette);
    return this.palettes['blue'];
  },

  load: function(elementId) {
    // Guess an element with id="palette"
    if (typeof elementId === 'undefined') {
      var elementId = 'palette';
    }
    else {
      console.error('Palettes.load: No #palette element? Why did you bring me here?');
    }
    // For speed and esthetical reasons this script runs
    // before jQuery is loaded so don't use jQuery here.
    var paletteLink = document.getElementById(elementId);
    if (paletteLink !== null) {
      // Show the standard palette or special palette the user has chosen
      var stored = localStorage.affiliationPalette;
      var palette = this.get(stored);
      paletteLink.href = palette;
    }
    else {
      console.error('Palette link element with ID "#' + elementId + '" not found');
    }
  },

}

// Palette self-loading
Palettes.load();
