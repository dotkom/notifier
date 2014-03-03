var Events = {
	debug: 0,
	msgError: "Shit went to hell, sawwy",
	eventApi: 'https://online.ntnu.no/events/events.ics',
	msgNone: "Something",

	get: function(callback) {
		if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

		// Get ICS from server
		var self = this;
      	var shortenedevents = self.shortenevents(self.eventApi);

	},

	shortenevents: function(events){
		var self = this;
		jQuery(document).ready(function(){
	    	try {
	            var cal = $.parseIcs(events);

	            for (var i = 0; i < 3; i++) {
	            	console.log(self.prettifyDate(cal.event[i].dtend[0].value) + ' ' + self.treatTextField(cal.event[i].summary[0].value));
	            }
	        }
	        catch (err) {
	            alert(err);
	        }
	    });
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
    var submeetings = ((meetings.substring(6,8) - 0) + '.' + (meetings.substring(4,6) - 0))
    return submeetings;
  },

}

Events.get(function(resultData) {
	//console.log('result from callback: ' + resultData);
});