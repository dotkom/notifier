
// Public functions

function officeStatus_update() {
	if (localStorage.showOfficeStatus == 'true')
		// Go down the rabbit hole
		fetchEvent();
	else if (DEBUG) console.log('user doesn\'t want office status');
}

function officeStatus_reset(lights, events) {
	if (lights) {
		if (DEBUG) console.log('reset light data');
		localStorage.officeLightsOn = 'undefined';
		localStorage.officeLightsOnPrevious = 'undefined';
	}
	if (events) {
		if (DEBUG) console.log('reset event data');
		localStorage.eventStatus = 'undefined';
		localStorage.eventStatusPrevious = 'undefined';
		localStorage.eventTitle = 'undefined';
		localStorage.eventTitlePrevious = 'undefined';
	}
	if (lights == undefined || events == undefined) {
		if (DEBUG) console.log('ERROR: office status was not reset, missing parameters');
	}
}

function officeStatus_disconnected(wasConnected) {
	if (localStorage.showOfficeStatus == 'true') {
		if (wasConnected == 'false') {
			if (DEBUG) console.log('still disconnected');
		}
		else {
			if (DEBUG) console.log('now disconnected!');
			setIconAndTitle(ICON_DISCONNECTED, DISCONNECTED);
			officeStatus_reset(true, true);
		}
	}
	else if (DEBUG) console.log('user doesn\'t want office status');
}

function officeStatus_disable() {
	setIconAndTitle(ICON_DEFAULT, EXTENSION_NAME);
	officeStatus_reset(true, true);
}

function officeStatus_error(msg) {
	if (DEBUG) console.log('ERROR: '+msg);
	setIconAndTitle(ICON_DISCONNECTED, CONNECTION_ERROR);
	officeStatus_reset(true, true);
}

// Private functions

function fetchEvent() {
	// Receives info on current event from Onlines servers (without comments)
	// 1								// 0=closed, 1=meeting, 2=waffles, 3=error
	// Event title			// event title or 'No title'-meeting or nothing
	if (localStorage.eventAjax != 'true') { // Already in progress?
		localStorage.eventAjax = 'true'; // Lock
		$.ajax({
			url: CALENDAR_URL
		})
		.success(function(data) {
			if (localStorage.eventStatus != 'undefined')
				localStorage.eventStatusPrevious = localStorage.eventStatus;
			if (localStorage.eventTitle != 'undefined')
				localStorage.eventTitlePrevious = localStorage.eventTitle;
			localStorage.eventStatus = data.split('\n',2)[0];
			localStorage.eventTitle = data.split('\n',2)[1];
			if (localStorage.eventTitle == '') // empty title?
				localStorage.eventTitle = 'undefined';
			fetchLights(); // proceed
		})
		.error(function() {
			officeStatus_error('failed to fetch event');
		})
		.complete(function() {
			localStorage.eventAjax = 'false'; // Unlock
		});
	}
	else
		if (DEBUG) console.log('event ajax already in progress');
}

function fetchLights() {
	// Receives current light intensity from the office: OFF 0-800-1023 ON
	if (localStorage.lightAjax != 'true') { // Already in progress?
		localStorage.lightAjax = 'true'; // Lock
		$.ajax({
			url: OFFICE_LIGHTS_URL
		})
		.success(function(data) {
			if (localStorage.officeLightsOn != 'undefined')
				localStorage.officeLightsOnPrevious = localStorage.officeLightsOn;
			localStorage.officeLightsOn = data < OFFICE_LIGHTS_BORDER_VALUE;
			determineLightStatus();
		})
		.fail(function() {
			officeStatus_error('failed to fetch lights');
		})
		.complete(function() {
			localStorage.lightAjax = 'false'; // Unlock
		});
	}
	else
		if (DEBUG) console.log('light ajax already in progress');
}

function determineLightStatus() {
	if (localStorage.officeLightsOn == 'false')
		officeClosed(localStorage.officeLightsOnPrevious == 'false');
	else if (localStorage.officeLightsOn == 'true')
		determineEventStatus();
	else
		officeStatus_error('determineLightStatus ran even though officeLightsOn was '+localStorage.officeLightsOn);
	localStorage.officeLightsOnPrevious = localStorage.officeLightsOn;
}

function determineEventStatus() {
	if (localStorage.eventStatus == 'undefined') {
		officeStatus_error('determineEventStatus ran even though eventStatus was '+localStorage.eventStatus);
		return;
	}
	var previous = Number(localStorage.eventStatusPrevious);
	switch(Number(localStorage.eventStatus)) {
		case 0: officeOpen(previous == 0); break; // open
		case 1: officeMeeting(previous == 1); break; // meeting
		case 2: officeWaffles(previous == 2); break; // waffles
		case 3: officeOpen(false); break; // error. false means it'll retry. assuming open office.
		default: {
			officeStatus_error('switched on '+localStorage.eventStatus);
		}
	}
}

// Statuses

function officeOpen(wasOpen) {
	if (wasOpen) {
		if (DEBUG) console.log('still open');
	}
	else {
		if (DEBUG) console.log('now open!');
		setIconAndTitle(ICON_OPEN, OFFICE_OPEN);
	}
}

function officeClosed(wasClosed) {
	if (wasClosed) {
		if (DEBUG) console.log('still closed');
	}
	else {
		if (DEBUG) console.log('now closed!');
		setIconAndTitle(ICON_CLOSED, OFFICE_CLOSED);
		officeStatus_reset(false, true);
	}
}

function officeMeeting(wasMeeting) {
	if (wasMeeting && (localStorage.eventTitle == localStorage.eventTitlePrevious)) {
		if (DEBUG) console.log('still meeting');
	}
	else {
		if (DEBUG) console.log('now meeting!');
		setIconAndTitle(ICON_MEETING, localStorage.eventTitle);
		localStorage.eventTitlePrevious = localStorage.eventTitle;
	}
}

function officeWaffles(wasWaffles) {
	if (wasWaffles) {
		if (DEBUG) console.log('still waffles');
	}
	else {
		if (DEBUG) console.log('now waffles!');
		setIconAndTitle(ICON_WAFFLE, localStorage.eventTitle);
		localStorage.eventTitlePrevious = localStorage.eventTitle;
	}
}

function setIconAndTitle(icon, title) {
	chrome.browserAction.setIcon({path:icon});
	chrome.browserAction.setTitle({title:title});
}








