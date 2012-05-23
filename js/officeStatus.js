
// Public functions

function officeStatus_update() {
	if (localStorage.showOfficeStatus == 'true')
		fetchLights();
	else if (DEBUG) console.log('user doesn\'t want office status');
}

function officeStatus_disconnected(wasConnected) {
	if (localStorage.showOfficeStatus == 'true')
		setStatus('disconnected', ICON_DISCONNECTED, OFFICE_DISCONNECTED);
	else if (DEBUG) console.log('user doesn\'t want office status');
}

function officeStatus_reset() {
	if (DEBUG) console.log('reset office status');
	setIconAndTitle(ICON_DEFAULT, EXTENSION_NAME);
}

function officeStatus_disable() {
	setIconAndTitle(ICON_DEFAULT, EXTENSION_NAME);
}

function officeStatus_error(msg) {
	if (DEBUG) console.log('ERROR: '+msg);
	setIconAndTitle(ICON_DISCONNECTED, OFFICE_ERROR);
}

// Private functions

function fetchLights() {
	// Receives current light intensity from the office: OFF 0-800-1023 ON
	$.ajax({
		url: OFFICE_LIGHTS_URL
	})
	.success(function(data) {
		if (data > OFFICE_LIGHTS_BORDER_VALUE)
			setStatus('closed', ICON_CLOSED, OFFICE_CLOSED);
		else
			fetchEvent();
	})
	.fail(function() {
		officeStatus_error('failed to fetch lights');
	});
}

function fetchEvent() {
	// Receives info on current event from Onlines servers (without comments)
	// 1								// 0=closed, 1=meeting, 2=waffles, 3=error
	// Event title			// event title or 'No title'-meeting or nothing
	$.ajax({
		url: CALENDAR_URL
	})
	.success(function(data) {
		var status = data.split('\n',2)[0];
		var title = data.split('\n',2)[1];
		// empty meeting title?
		if (title == '' && status == 1)
			title = OFFICE_UNTITLED_MEETING;
		// set the status from fetched data
		switch(Number(status)) {
			case 0: setStatus('open', ICON_OPEN, OFFICE_OPEN); break; // open
			case 1: setStatus('meeting', ICON_MEETING, title); break; // meeting
			case 2: setStatus('waffles', ICON_WAFFLE, title); break; // waffles
			case 3: officeStatus_error('eventStatus was 3 (error)'); break;
			default: officeStatus_error('determineEventStatus switched on '+localStorage.eventStatus);
		}
	})
	.error(function() {
		officeStatus_error('failed to fetch event');
	});
}

// Statuses

function setStatus(msg, icon, title) {
	if (localStorage.currentIcon == icon && localStorage.currentTitle == title) {
		if (DEBUG) console.log('still '+msg);
	}
	else {
		if (DEBUG) console.log('now '+msg+'!');
		setIconAndTitle(icon, title);
	}
}

function setIconAndTitle(icon, title) {
	chrome.browserAction.setIcon({path:icon});
	chrome.browserAction.setTitle({title:title});
	localStorage.currentIcon = icon;
	localStorage.currentTitle = title;
}








