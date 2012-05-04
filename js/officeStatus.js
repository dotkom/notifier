
// public functions

function updateOfficeStatus() {
	if (localStorage.showOfficeStatus == 'true')
		// Go down the rabbit hole
		fetchEvent();
	else if (DEBUG) console.log('office status not fetched, by choice of the user');
}

function disconnected(wasConnected) {
	if (wasConnected == 'false') {
		if (DEBUG) console.log('still disconnected');
	}
	else {
		if (DEBUG) console.log('now disconnected!');
		chrome.browserAction.setTitle({title:DISCONNECTED});
		chrome.browserAction.setIcon({path:ICON_DISCONNECTED});
		resetLightData();
		resetMeetingData();
	}
}

function defaultIcon() {
	chrome.browserAction.setTitle({title:EXTENSION_NAME});
	chrome.browserAction.setIcon({path:ICON_DEFAULT});
}

function errorIcon() {
	chrome.browserAction.setTitle({title:CONNECTION_ERROR});
	chrome.browserAction.setIcon({path:ICON_DISCONNECTED});
}

function resetLightData() {
	localStorage.officeLightsOn = undefined;
	localStorage.officeLightsOnPrevious = undefined;
}

function resetMeetingData() {
	localStorage.meetingStatus = undefined;
	localStorage.meetingStatusPrevious = undefined;
	localStorage.meetingTitle = undefined;
	localStorage.meetingTitlePrevious = undefined;
}

// private functions

/* Receives info on current google calendar event from Onlines servers.
Receives the following without comments:
1								// 0=closed, 1=meeting, 2=waffles, 3=error
Meeting title		// meeting title or 'No title'-meeting or nothing
*/
function fetchEvent() {
	$.ajax({
		url: CALENDAR_URL,
		success: function(data) {
			if (localStorage.meetingStatus != undefined)
				localStorage.meetingStatusPrevious = localStorage.meetingStatus;
			if (localStorage.meetingTitle != undefined)
				localStorage.meetingTitlePrevious = localStorage.meetingTitle;
			localStorage.meetingStatus = data.split('\n',2)[0];
			localStorage.meetingTitle = data.split('\n',2)[1];
			fetchLights();
		}
	})
	.fail(function() {
		if (DEBUG) console.log('ERROR: failed to fetch event -> reset event/light data');
		resetLightData();
		resetMeetingData();
		errorIcon();
	});
}

/* Receives a number corresponding to the current intensity of light at
the office. If the number is below a threshold of 800 the lights are on.
on	<->	limit	<->	off
0		<->	800		<->	1023
*/
function fetchLights() {
	$.ajax({
		url: OFFICE_LIGHTS_URL,
		success: function(data) {
			if (localStorage.officeLightsOn != undefined)
				localStorage.officeLightsOnPrevious = localStorage.officeLightsOn;
			localStorage.officeLightsOn = data < OFFICE_LIGHTS_BORDER_VALUE;
			determineLightStatus();
		}
	})
	.fail(function() {
		if (DEBUG) console.log('ERROR: failed to fetch lights -> reset event/light data');
		resetLightData();
		resetMeetingData();
		errorIcon();
	});
}

function determineLightStatus() {
	// lights off
	if (localStorage.officeLightsOn == 'false')
		officeClosed(localStorage.officeLightsOnPrevious == 'false');
	// lights on, proceed
	else
		determineEventStatus();
	localStorage.officeLightsOnPrevious = localStorage.officeLightsOn;
}

// lights off

function officeClosed(wasClosed) {
	if (wasClosed) {
		if (DEBUG) console.log('still closed');
	}
	else {
		if (DEBUG) console.log('now closed!');
		chrome.browserAction.setTitle({title:OFFICE_CLOSED});
		chrome.browserAction.setIcon({path:ICON_CLOSED});
		resetMeetingData();
	}
}

// lights on, what's up

function determineEventStatus() {
	var previous = localStorage.meetingStatusPrevious;
	switch(Number(localStorage.meetingStatus)) {
		case 0: officeOpen(previous == 0); break; // open
		case 1: officeMeeting(previous == 1); break; // meeting
		case 2: officeWaffles(previous == 2); break; // waffles
		case 3: officeOpen(previous == 3); break; // error
		default: {
			if (DEBUG) console.log('ERROR: switched on '+localStorage.meetingStatus);
			resetLightData();
			resetMeetingData();
			errorIcon();
		}
	}
}

function officeOpen(wasOpen) {
	if (wasOpen) {
		if (DEBUG) console.log('still open');
	}
	else {
		if (DEBUG) console.log('now open!');
		chrome.browserAction.setTitle({title:OFFICE_OPEN});
		chrome.browserAction.setIcon({path:ICON_OPEN});
	}
}

function officeMeeting(wasMeeting) {
	if (wasMeeting && (localStorage.meetingTitle == localStorage.meetingTitlePrevious)) {
		if (DEBUG) console.log('still meeting');
	}
	else {
		if (DEBUG) console.log('now meeting!');
		chrome.browserAction.setTitle({title:localStorage.meetingTitle});
		chrome.browserAction.setIcon({path:ICON_MEETING});
		localStorage.meetingPrevious = localStorage.meetingTitle;
	}
}

function officeWaffles(wasWaffles) {
	if (wasWaffles) {
		if (DEBUG) console.log('still waffles');
	}
	else {
		if (DEBUG) console.log('now waffles!');
		chrome.browserAction.setTitle({title:localStorage.meetingTitle});
		chrome.browserAction.setIcon({path:ICON_WAFFLE});
		localStorage.meetingPrevious = localStorage.meetingTitle;
	}
}







