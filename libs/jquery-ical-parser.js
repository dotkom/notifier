/**
 * jQuery icalendar processing plugin
 *
 * Version: 0.2
 *
 * Author: Michael Sieber
 * Web: http://www.bitfish.eu
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *
 * Implementation resources:
 *		- http://tools.ietf.org/html/rfc5545
 * 		- http://upload.wikimedia.org/wikipedia/commons/c/c0/ICalendarSpecification.png
 */
(function($){

	/**
	* Parse an ics file
	* @param url The url to the ics file which should be parsed
	* @return A JSON object tree with the values of the parsed ics files
	* @throws Error message if parsing fails or the file could not be loaded
	*/
	$.parseIcs = function(url) {
		if(!icsExists(url)){
			throw "Unable to load file from: " + url;
		}
		
		return parse(url);
	};
	
	/**
	* Check if a given ics file exists and is therefore available for further processing.
	* @param url The file url to check
	* @return True if the ics files exists, false if not or if any error occurs
	*/
	function icsExists(url){
		if(url){
			var response = $.ajax({
				url: url,
				type: 'HEAD',
				async: false
			}).status;
			
			return (response != "200") ? false : true;
		}
		
		return false;
	}
	
	/**
	* Start parsing the ics calendar.
	* @param url The url where the calendar is located.
	* @return A JSON object tree with the values of the parsed ics files
	* @throws An error if parsing fails or the file couldn't be loaded
	*/
	function parse(url){
		var cal = {};
		cal['event'] = new Array();
		cal['todo'] = new Array();
		cal['journal'] = new Array();
		cal['freebusy'] = new Array();
		cal['timezone'] = new Array();
		
		// open the ics file
		$.ajax({
			url: url,
			dataType: 'text',
			async: false,
			success: function(data){
				// content lines are delimited by a line break, which is a CRLF sequence
				// RFC 5545: 3.1 Content Lines, Page 9
				var file = data.split('\u000d\u000a');
				var idx = parseCalendar(file, cal, 0);
				
				// check if at least one main object has an entry
				if(!(cal['event'].length > 0 || cal['todo'].length > 0 || cal['journal'].length > 0 || 
						cal['freebusy'].length > 0 || cal['timezone'].length > 0)){
					throw "At least one main object (event, todo, journal, freebusy or timezone) has to be set.";
				}
				
				// skip empty lines at the end of the file
				while(file[idx] == ""){
					idx++;
				}
				
				// check if the whole file has bee processed
				if(idx != file.length){
					throw "Unable to process the whole ics file.";
				}
			}
		});
		
		return cal;
	}
	
	/**
	* Parse the calendar object.
	* @param file The ics file object
	* @param parent The parent calendar object to which the entries will be added
	* @param line The current line index to process
	* @return The next line index to process
	* @throws An error if the ics does not correspond to rfc 5545
	*/
	function parseCalendar(file, parent, idx){
		if(!(file[idx] == 'BEGIN:VCALENDAR')){
			throw "Syntax error: No BEGIN:VCALENDAR found.";
		}
		idx++;
		
		parent.type = "VCALENDAR";
		
		while(idx < file.length){
			var lineObj = splitLine(file[idx]);
			
			if(lineObj.name != "END" && lineObj.name != "BEGIN"){
				if(!parent[lineObj.name.toLowerCase()]){
					parent[lineObj.name.toLowerCase()] = new Array();
				}
				
				// set the value to the property
				parent[lineObj.name.toLowerCase()].push(lineObj);
				idx++;
			} else {
				break;
			}
		}
		
		checkOccurence({
			obj: parent,
			props: [
				{
					name: "calscale",
					min: 0,
					max: 1
				},
				{
					name: "method",
					min: 0,
					max: 1
				},
				{
					name: "prodid",
					min: 1,
					max: 1
				},
				{
					name: "version",
					min: 1,
					max: 1
				},
				{
					name: "x-prop",
					min: 0,
					max: 1
				}
			]
		});
		
		// let's start with content parsing
		while(idx < file.length){
			var line = file[idx].split(":");
			var prop = line[0];
			var val = line[1];
			
			if(prop == "BEGIN"){
				switch(val){
					case "VEVENT":
						idx = parseEvent(file, parent.event, idx);
						break;
					case "VTODO":
						idx = parseTodo(file, parent.todo, idx);
						break;
					case "VJOURNAL":
						idx = parseJournal(file, parent.journal, idx);
						break;
					case "VFREEBUSY":
						idx = parseFreebusy(file, parent.freebusy, idx);
						break;
					case "VTIMEZONE":
						idx = parseTimezone(file, parent.timezone, idx);
						break;
					default:
						break;
				}
			} else {
				break;
			}
		}
		
		if(!(file[idx] == 'END:VCALENDAR')){
			throw "Syntax error: No END:VCALENDAR found.";
		}
		
		return ++idx;
	}
	
	/**
	* Parse the event object.
	* @param file The ics file object
	* @param parent The parent calendar object to which the entries will be added
	* @param line The current line index to process
	* @return The next line index to process
	* @throws An error if the ics does not correspond to rfc 5545
	*/
	function parseEvent(file, parent, idx){
		if(!(file[idx] == 'BEGIN:VEVENT')){
			throw "Syntax error: No BEGIN:VEVENT found.";
		}
		idx++;
		
		var event = {};
		event.alarm = new Array();
		event.type = "VEVENT";
		
		while(idx < file.length){
			var lineObj = splitLine(file[idx]);
			
			if((lineObj.name != "END" && lineObj.name != "BEGIN")){
				if(!event[lineObj.name.toLowerCase()]){
					event[lineObj.name.toLowerCase()] = new Array();
				}
				
				// set the value to the property
				event[lineObj.name.toLowerCase()].push(lineObj);
				idx++;
			} else if (lineObj.name == "BEGIN" && lineObj.value == "VALARM") {
				idx = parseAlarm(file, event.alarm, idx);
			} else {
				break;
			}
		}
		
		checkOccurence({
			obj: event,
			props: [
				{
					name: "attach",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "attendee",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "categories",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "class",
					min: 0,
					max: 1
				},
				{
					name: "comment",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "contact",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "created",
					min: 0,
					max: 1
				},
				{
					name: "description",
					min: 0,
					max: 1
				},
				{
					name: "dtend",
					min: 1,
					max: 1,
					en: "duration"
				},
				{
					name: "dtstamp",
					min: 0,
					max: 1
				},
				{
					name: "dtstart",
					min: 0,
					max: 1
				},
				{
					name: "duration",
					min: 1,
					max: 1,
					en: "dtend"
				},
				{
					name: "exdate",
					min: 0,
					max: 1
				},
				{
					name: "exrule",
					min: 0,
					max: 1
				},
				{
					name: "geo",
					min: 0,
					max: 1
				},
				{
					name: "last-mod",
					min: 0,
					max: 1
				},
				{
					name: "location",
					min: 0,
					max: 1
				},
				{
					name: "organizer",
					min: 0,
					max: 1
				},
				{
					name: "priority",
					min: 0,
					max: 1
				},
				{
					name: "rdate",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "recurId",
					min: 0,
					max: 1
				},
				{
					name: "related",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "resources",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "rrule",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "rstatus",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "seq",
					min: 0,
					max: 1
				},
				{
					name: "status",
					min: 0,
					max: 1
				},
				{
					name: "summary",
					min: 0,
					max: 1
				},
				{
					name: "transp",
					min: 0,
					max: 1
				},
				{
					name: "uid",
					min: 0,
					max: 1
				},
				{
					name: "url",
					min: 0,
					max: 1
				},
				{
					name: "x-prop",
					min: 0,
					max: Number.MAX_VALUE
				}
			]
		});
		
		if(!(file[idx] == 'END:VEVENT')){
			throw "Syntax error: No END:VEVENT found.";
		}
		
		// add the event to the calendar
		parent.push(event);
		
		return ++idx;
	}
	
	/**
	* Parse the todo object.
	* @param file The ics file object
	* @param parent The parent calendar object to which the entries will be added
	* @param line The current line index to process
	* @return The next line index to process
	* @throws An error if the ics does not correspond to rfc 5545
	*/
	function parseTodo(file, parent, idx){
		if(!(file[idx] == 'BEGIN:VTODO')){
			throw "Syntax error: No BEGIN:VTODO found.";
		}
		idx++;
		
		var todo = {};
		todo.alarm = new Array();
		todo.type = "VTODO";
		
		while(idx < file.length){
			var lineObj = splitLine(file[idx]);
			
			if((lineObj.name != "END" && lineObj.name != "BEGIN")){
				if(!todo[lineObj.name.toLowerCase()]){
					todo[lineObj.name.toLowerCase()] = new Array();
				}
				
				// set the value to the property
				todo[lineObj.name.toLowerCase()].push(lineObj);
				idx++;
			} else if (lineObj.name == "BEGIN" && lineObj.value == "VALARM") {
				idx = parseAlarm(file, todo.alarm, idx);
			} else {
				break;
			}
		}
		
		checkOccurence({
			obj: todo,
			props: [
				{
					name: "attach",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "attendee",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "categories",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "class",
					min: 0,
					max: 1
				},
				{
					name: "comment",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "completed",
					min: 0,
					max: 1
				},
				{
					name: "contact",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "created",
					min: 0,
					max: 1
				},
				{
					name: "description",
					min: 0,
					max: 1
				},
				{
					name: "dtstamp",
					min: 0,
					max: 1
				},
				{
					name: "dtstart",
					min: 0,
					max: 1
				},
				{
					name: "due",
					min: 1,
					max: 1,
					en: "duration"
				},
				{
					name: "duration",
					min: 1,
					max: 1,
					en: "due"
				},
				{
					name: "exdate",
					min: 0,
					max: 1
				},
				{
					name: "exrule",
					min: 0,
					max: 1
				},
				{
					name: "geo",
					min: 0,
					max: 1
				},
				{
					name: "last-mod",
					min: 0,
					max: 1
				},
				{
					name: "location",
					min: 0,
					max: 1
				},
				{
					name: "organizer",
					min: 0,
					max: 1
				},
				{
					name: "percent",
					min: 0,
					max: 1
				},
				{
					name: "priority",
					min: 0,
					max: 1
				},
				{
					name: "rdate",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "recurId",
					min: 0,
					max: 1
				},
				{
					name: "related",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "resources",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "rrule",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "rstatus",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "seq",
					min: 0,
					max: 1
				},
				{
					name: "status",
					min: 0,
					max: 1
				},
				{
					name: "summary",
					min: 0,
					max: 1
				},
				{
					name: "uid",
					min: 0,
					max: 1
				},
				{
					name: "url",
					min: 0,
					max: 1
				},
				{
					name: "x-prop",
					min: 0,
					max: Number.MAX_VALUE
				}
			]
		});
		
		if(!(file[idx] == 'END:VTODO')){
			throw "Syntax error: No END:VTODO found.";
		}
		
		// add the event to the calendar
		parent.push(todo);
		
		return ++idx;
	}
	
	/**
	* Parse the journal object.
	* @param file The ics file object
	* @param parent The parent calendar object to which the entries will be added
	* @param line The current line index to process
	* @return The next line index to process
	* @throws An error if the ics does not correspond to rfc 5545
	*/
	function parseJournal(file, parent, idx){
	if(!(file[idx] == 'BEGIN:VJOURNAL')){
			throw "Syntax error: No BEGIN:VJOURNAL found.";
		}
		idx++;
		
		var journal = {};
		journal.type = "VJOURNAL";
		
		while(idx < file.length){
			var lineObj = splitLine(file[idx]);
			
			if((lineObj.name != "END" && lineObj.name != "BEGIN")){
				if(!journal[lineObj.name.toLowerCase()]){
					journal[lineObj.name.toLowerCase()] = new Array();
				}
				
				// set the value to the property
				journal[lineObj.name.toLowerCase()].push(lineObj);
				idx++;
			} else {
				break;
			}
		}
		
		checkOccurence({
			obj: journal,
			props: [
				{
					name: "attach",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "attendee",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "categories",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "class",
					min: 0,
					max: 1
				},
				{
					name: "comment",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "contact",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "created",
					min: 0,
					max: 1
				},
				{
					name: "description",
					min: 0,
					max: 1
				},
				{
					name: "dtstamp",
					min: 0,
					max: 1
				},
				{
					name: "dtstart",
					min: 0,
					max: 1
				},
				{
					name: "exdate",
					min: 0,
					max: 1
				},
				{
					name: "exrule",
					min: 0,
					max: 1
				},
				{
					name: "last-mod",
					min: 0,
					max: 1
				},
				{
					name: "organizer",
					min: 0,
					max: 1
				},
				{
					name: "rdate",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "recurId",
					min: 0,
					max: 1
				},
				{
					name: "related",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "rrule",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "rstatus",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "seq",
					min: 0,
					max: 1
				},
				{
					name: "status",
					min: 0,
					max: 1
				},
				{
					name: "summary",
					min: 0,
					max: 1
				},
				{
					name: "uid",
					min: 0,
					max: 1
				},
				{
					name: "url",
					min: 0,
					max: 1
				},
				{
					name: "x-prop",
					min: 0,
					max: Number.MAX_VALUE
				}
			]
		});
		
		if(!(file[idx] == 'END:VJOURNAL')){
			throw "Syntax error: No END:VJOURNAL found.";
		}
		
		// add the event to the calendar
		parent.push(journal);
		
		return ++idx;
	}
	
	/**
	* Parse the free/busy object.
	* @param file The ics file object
	* @param parent The parent calendar object to which the entries will be added
	* @param line The current line index to process
	* @return The next line index to process
	* @throws An error if the ics does not correspond to rfc 5545
	*/
	function parseFreebusy(file, parent, idx){
		if(!(file[idx] == 'BEGIN:VFREEBUSY')){
			throw "Syntax error: No BEGIN:VFREEBUSY found.";
		}
		idx++;
		
		var freebusy = {};
		freebusy.type = "VFREEBUSY";
		
		while(idx < file.length){		
			var lineObj = splitLine(file[idx]);
			
			if((lineObj.name != "END" && lineObj.name != "BEGIN")){
				if(!freebusy[lineObj.name.toLowerCase()]){
					freebusy[lineObj.name.toLowerCase()] = new Array();
				}
				
				// set the value to the property
				freebusy[lineObj.name.toLowerCase()].push(lineObj);
				idx++;
			} else {
				break;
			}
		}
		
		checkOccurence({
			obj: freebusy,
			props: [
				{
					name: "attendee",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "comment",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "contact",
					min: 0,
					max: 1
				},
				{
					name: "dtend",
					min: 0,
					max: 1
				},
				{
					name: "dtstamp",
					min: 0,
					max: 1
				},
				{
					name: "dtstart",
					min: 0,
					max: 1
				},
				{
					name: "duration",
					min: 0,
					max: 1
				},
				{
					name: "freebusy",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "organizer",
					min: 0,
					max: 1
				},
				{
					name: "rstatus",
					min: 0,
					max: NUMBER.MAX_VALUE
				},
				{
					name: "uid",
					min: 0,
					max: 1
				},
				{
					name: "url",
					min: 0,
					max: 1
				},
				{
					name: "x-prop",
					min: 0,
					max: NUMBER.MAX_VALUE
				}
			]
		});
		
		if(!(file[idx] == 'END:VFREEBUSY')){
			throw "Syntax error: No END:VFREEBUSY found.";
		}
		
		parent.push(freebusy);	
		return ++idx;
	}
	
	/**
	* Parse the timezone object.
	* @param file The ics file object
	* @param parent The parent calendar object to which the entries will be added
	* @param line The current line index to process
	* @return The next line index to process
	* @throws An error if the ics does not correspond to rfc 5545
	*/
	function parseTimezone(file, parent, idx){
		if(!(file[idx] == 'BEGIN:VTIMEZONE')){
			throw "Syntax error: No BEGIN:VTIMEZONE found.";
		}
		idx++;
		
		var timezone = {};
		timezone.type = "VTIMEZONE";
		timezone.standard = new Array();
		timezone.daylight = new Array();
		
		while(idx < file.length){		
			var lineObj = splitLine(file[idx]);
			
			if((lineObj.name != "END" && lineObj.name != "BEGIN")){
				if(!timezone[lineObj.name.toLowerCase()]){
					timezone[lineObj.name.toLowerCase()] = new Array();
				}
				
				// set the value to the property
				timezone[lineObj.name.toLowerCase()].push(lineObj);
				idx++;
			} else if (lineObj.name == "BEGIN" && lineObj.value == "STANDARD") {
				idx = parseStandard(file, timezone.standard, idx);
			} else if (lineObj.name == "BEGIN" && lineObj.value == "DAYLIGHT") {
				idx = parseDaylight(file, timezone.daylight, idx);
			} else {
				break;
			}
		}
		
		checkOccurence({
			obj: timezone,
			props: [
				{
					name: "last-mod",
					min: 0,
					max: 1,
				},
				{
					name: "tzid",
					min: 1,
					max: 1
				},
				{
					name: "tzurl",
					min: 0,
					max: 1
				}
			]
		});
		
		// check if at least one object is set
		if(!(timezone.standard.length > 0 || timezone.daylight.length > 0)){
			throw "VTIMEZONE needs at least one of STANDARD or DAYLIGHT to be set";
		}
		
		if(!(file[idx] == 'END:VTIMEZONE')){
			throw "Syntax error: No END:VTIMEZONE found.";
		}
		
		// add the event to the calendar
		parent.push(timezone);
		
		return ++idx;
	}
	
	/**
	* Parse the alarm object.
	* @param file The ics file object
	* @param parent The parent calendar object to which the entries will be added
	* @param line The current line index to process
	* @return The next line index to process
	* @throws An error if the ics does not correspond to rfc 5545
	*/
	function parseAlarm(file, parent, idx){
		if(!(file[idx] == 'BEGIN:VALARM')){
			throw "Syntax error: No BEGIN:VALARM found.";
		}
		idx++;
		
		var alarm = {};
		alarm.type = "VALARM";
		
		while(idx < file.length){		
			var lineObj = splitLine(file[idx]);
			
			if((lineObj.name != "END" && lineObj.name != "BEGIN")){
				if(!alarm[lineObj.name.toLowerCase()]){
					alarm[lineObj.name.toLowerCase()] = new Array();
				}
				
				// set the value to the property
				alarm[lineObj.name.toLowerCase()].push(lineObj);
				idx++;
			} else {
				break;
			}
		}
		
		switch(alarm.action[0].value){
			case "AUDIO":
				checkOccurence({
					obj: alarm,
					props: [
						{
							name: "action",
							min: 1,
							max: 1
						},
						{
							name: "attach",
							min: 0,
							max: 1,
						},
						{
							name: "duration",
							min: 0,
							max: 1,
							in: "repeat"
						},
						{
							name: "repeat",
							min: 0,
							max: 1,
							in: "duration"
						},
						{
							name: "trigger",
							min: 1,
							max: 1,
						},
						{
							name: "tzurl",
							min: 0,
							max: 1,
						}
					]
				});
				break;
			case "DISPLAY":
				checkOccurence({
					obj: alarm,
					props: [
						{
							name: "action",
							min: 1,
							max: 1
						},
						{
							name: "description",
							min: 1,
							max: 1
						},
						{
							name: "duration",
							min: 0,
							max: 1,
							in: "repeat"
						},
						{
							name: "repeat",
							min: 0,
							max: 1,
							in: "duration"
						},
						{
							name: "trigger",
							min: 1,
							max: 1,
						},
						{
							name: "tzurl",
							min: 0,
							max: 1,
						}
					]
				});
				break;
			case "EMAIL":
				checkOccurence({
					obj: alarm,
					props: [
						{
							name: "action",
							min: 1,
							max: 1
						},
						{
							name: "attach",
							min: 0,
							max: Number.MAX_VALUE
						},
						{
							name: "attendee",
							min: 1,
							max: Number.MAX_VALUE
						},
						{
							name: "description",
							min: 1,
							max: 1
						},
						{
							name: "duration",
							min: 0,
							max: 1,
							in: "repeat"
						},
						{
							name: "repeat",
							min: 0,
							max: 1,
							in: "duration"
						},
						{
							name: "summary",
							min: 1,
							max: 1
						},
						{
							name: "trigger",
							min: 1,
							max: 1,
						},
						{
							name: "tzurl",
							min: 0,
							max: 1,
						}
					]
				});
				break;
			case "PROCEDURE":
				checkOccurence({
					obj: alarm,
					props: [
						{
							name: "action",
							min: 1,
							max: 1
						},
						{
							name: "attach",
							min: 1,
							max: 1
						},
						{
							name: "description",
							min: 0,
							max: 1
						},
						{
							name: "duration",
							min: 0,
							max: 1,
							in: "repeat"
						},
						{
							name: "repeat",
							min: 0,
							max: 1,
							in: "duration"
						},
						{
							name: "trigger",
							min: 1,
							max: 1,
						},
						{
							name: "tzurl",
							min: 0,
							max: 1,
						}
					]
				});
				break;
			default:
				throw "Unkown action '" + alarm.action[0].name + "' for VALARM";
				break;
		}
		
		if(!(file[idx] == 'END:VALARM')){
			throw "Syntax error: No END:VALARM found.";
		}
		
		// add the event to the calendar
		parent.push(alarm);
		
		return ++idx;
	}
	
	/**
	* Parse the standard object.
	* @param file The ics file object
	* @param parent The parent calendar object to which the entries will be added
	* @param line The current line index to process
	* @return The next line index to process
	* @throws An error if the ics does not correspond to rfc 5545
	*/
	function parseStandard(file, parent, idx){
		if(!(file[idx] == 'BEGIN:STANDARD')){
			throw "Syntax error: No BEGIN:STANDARD found.";
		}
		idx++;
		
		var standard = {};
		standard.type = "STANDARD";
		
		while(idx < file.length){		
			var lineObj = splitLine(file[idx]);
			
			if((lineObj.name != "END" && lineObj.name != "BEGIN")){
				if(!standard[lineObj.name.toLowerCase()]){
					standard[lineObj.name.toLowerCase()] = new Array();
				}
				
				// set the value to the property
				standard[lineObj.name.toLowerCase()].push(lineObj);
				idx++;
			} else {
				break;
			}
		}
		
		checkOccurence({
			obj: standard,
			props: [
				{
					name: "dtstart",
					min: 1,
					max: 1
				},
				{
					name: "tzid",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "tzname",
					min: 1,
					max: 1
				},
				{
					name: "tzoffsetto",
					min: 1,
					max: 1
				}
			]
		});
		
		if(!(file[idx] == 'END:STANDARD')){
			throw "Syntax error: No END:STANDARD found.";
		}
		
		parent.push(standard);	
		return ++idx;
	}
	
	/**
	* Parse the daylight object.
	* @param file The ics file object
	* @param parent The parent calendar object to which the entries will be added
	* @param line The current line index to process
	* @return The next line index to process
	* @throws An error if the ics does not correspond to rfc 5545
	*/
	function parseDaylight(file, parent, idx){
		if(!(file[idx] == 'BEGIN:DAYLIGHT')){
			throw "Syntax error: No BEGIN:DAYLIGHT found.";
		}
		idx++;
		
		var daylight = {};
		daylight.type = "DAYLIGHT";
		
		while(idx < file.length){		
			var lineObj = splitLine(file[idx]);
			
			if((lineObj.name != "END" && lineObj.name != "BEGIN")){
				if(!daylight[lineObj.name.toLowerCase()]){
					daylight[lineObj.name.toLowerCase()] = new Array();
				}
				
				// set the value to the property
				daylight[lineObj.name.toLowerCase()].push(lineObj);
				idx++;
			} else {
				break;
			}
		}
		
		checkOccurence({
			obj: daylight,
			props: [
				{
					name: "dtstart",
					min: 1,
					max: 1
				},
				{
					name: "tzid",
					min: 0,
					max: Number.MAX_VALUE
				},
				{
					name: "tzname",
					min: 1,
					max: 1
				},
				{
					name: "tzoffsetto",
					min: 1,
					max: 1
				}
			]
		});
		
		if(!(file[idx] == 'END:DAYLIGHT')){
			throw "Syntax error: No END:DAYLIGHT found.";
		}
		
		parent.push(daylight);	
		return ++idx;
	}
	
	/**
	* Check the correct occurence of properties in a given object.
	* @param opt The option object check
	*				{
	*					obj: object, // the object on which the properties will be checked
	*					props: [
	*								{
	*									name: string, // the property name to check
	*									min: number, // the minimum occurence for this property
	*									max: number, // the maximum occurence for this property
	*									en: string, // Optional: the name of a property for excluding clarification (wheater, or)
	*									in: string, // Optional: the name of a property for including clarification (and)
	*								}
	*							]
	*				}
	* @throws An error if an occurence was violated
	*/
	function checkOccurence(opt){
		$.each(opt.props, function(index, value){
			var prop = opt.obj[value.name];
			
			// simple case: no dependecies to other properties
			if(!value.en && !value.in){
			
				// check for mandatory properties
				if(!prop && value.min > 0){
					throw "Property '" + value.name + "' is mandatory for " + opt.obj.type;
				}
				
				if(prop){
					// check occurence constraints
					if(!(value.min <= prop.length && prop.length <= value.max)){
						throw "Property '" + value.name + "' occures too much/less on " + opt.obj.type;
				}
				}
			} else {
				if(value.en){ // excluding clarification
					// throw an error if the other property exists
					if(prop && opt.obj[value.en] && opt.obj[value.en][0]){
						throw "Property '" + value.en + "' is not allowed if property '" + value.name + "' is set on " + opt.obj.type;
					}
				} else if(value.in){ // including clarification
					// throw an error if the other property does not exist
					console.log(opt.obj);
					if(!prop && !opt.obj[value.in] && !opt.obj[value.in][0]){
						throw "Property '" + value.name + "' needs the property '" + value.in + "' to be set on" + opt.obj.type;
					}
				}
			}
		});
	}
	
	/**
	* Split a line into the property name, property parameters and the value.
	* @param line The line to split
	* @return The object containing the property name, the property parameters and the value
	*			{
	*				name: string,
	*				value: string,
	*				params: [
	*							{
	*								key: string,
	*								value: string
	*							}
	*						]
	*			}
	*/
	function splitLine(line){
		var result = {};
		result.params = new Array();
		var seperatorIdx = line.indexOf(":");
		
		// get the value
		result.value = line.slice(seperatorIdx + 1, line.length);
		
		// get the parameters
		var props = line.slice(0, seperatorIdx).split(";");
		
		// first item is the property name
		result.name = props[0];
		
		for(var i = 1; i < props.length; i++){
			var param = {};
			var splittedParam = props[i].split("=");
			param.key = splittedParam[0];
			param.value = splittedParam[1];
			result.params.push(param);
		}
		
		return result;
	}
}(jQuery));