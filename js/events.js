"use strict";

var Events = {
  debug: 0,
  api: 'https://online.ntnu.no/events/events.ics',

  get: function(callback) {
    if (callback == undefined) {
      if (this.debug) console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    // Get ICS from server
    try {
      var cal = $.parseIcs(this.api);
      for (var i = 0; i < 3; i++) {
        if (this.debug) console.log(this.prettifyDate(cal.event[i].dtend[0].value) + ' ' + this.treatTextField(cal.event[i].summary[0].value));
      }
    }
    catch (err) {
      if (this.debug) console.log('ERROR: Fetching events failed', err);
    }
  },

  treatTextField: function(field) {
    field = field.replace(/(\d\.*[\s-]+)*\d\.*\s+klasse/gi, '');
    field = field.replace(/\-/, '');
    // Remove multiple whitespace
    field = field.replace(/\s\s+/g,'');
    // "..stedHvor.." -> "..sted. Hvor.."
    field = field.replace(/([a-z])([A-Z])/g, '$1. '+'$2'.capitalize());
    // Remove meta information from title or description, within curly brackets {}
    field = field.replace(/\{.*\}/gi,'');
    // Shorten 'bedriftspresentasjon' to 'bedpres'
    field = field.replace(/edrift(s)?presentasjon/gi, 'edpres');
    field = field.replace(/\./gi, '');
    field = field.replace(/consulting/gi, '');
    // Trimming
    field = field.trim();
    return field;
  },

  prettifyDate: function(meetings) {
    meetings = meetings.trim();
    var submeetings = ((meetings.substring(6,8) - 0) + '.' + (meetings.substring(4,6) - 0));
    return submeetings;
  },

}
