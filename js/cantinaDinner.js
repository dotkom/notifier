
// Public functions

function cantinaDinner_update() {
	if (localStorage.showCantinaDinners == 'true')
		// Bring forth the woman
		fetchDinners();
	else if (DEBUG) console.log('user doesn\'t want dinner');
}

function cantinaDinner_reset() {
	if (DEBUG) console.log('reset dinner data');
	localStorage.hangarenDinner = 'undefined';
	localStorage.hangarenTitle = 'undefined';
	localStorage.realfagDinner = 'undefined';
	localStorage.realfagTitle = 'undefined';
}

/*
function cantinaDinner_disable() {
	setIconAndTitle(ICON_DEFAULT, EXTENSION_NAME);
	officeStatus_reset();
}
*/

function cantinaDinner_error() {
	localStorage.dinnerInfo = CANTINA_DINNER_ERROR;
	cantinaDinner_reset();
}

// Private functions

function fetchDinners() {
	
	// Fetch Hangaren
	$.ajax({
		url: HANGAREN_DINNER_URL, // permission to use url granted in manifest.json
		dataType: 'xml',
		success: parseDinnerData
	})
	.fail(function() {
		if (DEBUG) console.log('ERROR: failed to fetch dinner from hangaren');
		cantinaDinner_error();
	});
	
	// Fetch Realfag
	$.ajax({
		url: REALFAG_DINNER_URL, // permission to use url granted in manifest.json
		dataType: 'xml',
		success: parseDinnerData
	})
	.fail(function() {
		if (DEBUG) console.log('ERROR: failed to fetch dinner from realfag');
		cantinaDinner_error();
	});
}

function parseDinnerData(xml) {
	
	// Find cantina title and dinner description
	var descriptions = $(xml).find("description");
	var cantinaTitle = descriptions[0]['textContent'];
	var dinnerDescription = descriptions[1]['textContent'];
	
	// Throw away SiT's very excessive whitespace
	dinnerDescription = $.trim(dinnerDescription.replace(/[\s\n\r]+/g,' '));
	
	// Find today
	var d = new Date();
	var dayNames=new Array(7);
	dayNames[0]="Søndag";
	dayNames[1]="Mandag";
	dayNames[2]="Tirsdag";
	dayNames[3]="Onsdag";
	dayNames[4]="Torsdag";
	dayNames[5]="Fredag";
	dayNames[6]="Lørdag";
	
	// Find todays dinners
	var today = dayNames[d.getDay()];
	var dinnerForEachDay = dinnerDescription.split('<b>');
	var todaysDinners = CANTINA_DINNER_NOT_OPEN;
	for (dinnerDay in dinnerForEachDay) {
		if (dinnerForEachDay[dinnerDay].lastIndexOf(today, 0) === 0) {
			todaysDinners = dinnerForEachDay[dinnerDay];
		}
	}
	if (todaysDinners == CANTINA_DINNER_NOT_OPEN) {
		localStorage.dinnerInfo = CANTINA_DINNER_NOT_OPEN;
		cantinaDinner_reset();
	}
	
	// Separate todays dinners
	var dinnerList = todaysDinners.split('<br>');
	
	// Remove empty or irrelevant information (items: first, last, second last)
	dinnerList = dinnerList.splice(1,dinnerList.length-3);
	
	var B = 50;
	
	// Shorten relevant information to the bare necessities
	for (dinner in dinnerList) {
		
		// Everything after X should be removed...
		if (dinner==B) console.log('. :: '+dinnerList[dinner]);
		if (dinnerList[dinner].indexOf('.') != -1)
			dinnerList[dinner] = dinnerList[dinner].split('.')[0];
		
		if (dinner==B) console.log(', :: '+dinnerList[dinner]);
		if (dinnerList[dinner].indexOf(',') != -1)
			dinnerList[dinner] = dinnerList[dinner].split(',')[0];
		
		if (dinner==B) console.log(': :: '+dinnerList[dinner]);
		if (dinnerList[dinner].indexOf(':') != -1)
			dinnerList[dinner] = dinnerList[dinner].split(':')[0];
		
		if (dinner==B) console.log('( :: '+dinnerList[dinner]);
		if (dinnerList[dinner].indexOf('(') != -1)
			dinnerList[dinner] = dinnerList[dinner].split('(')[0];
		
		if (dinner==B) console.log('s :: '+dinnerList[dinner]);
		if (dinnerList[dinner].indexOf('serveres') != -1)
			dinnerList[dinner] = dinnerList[dinner].split('serveres')[0];
		
		if (dinner==B) console.log('S :: '+dinnerList[dinner]);
		if (dinnerList[dinner].indexOf('Serveres') != -1)
			dinnerList[dinner] = dinnerList[dinner].split('Serveres')[0];
		
		// Trim away extra whitespace...
		
		if (dinner==B) console.log('_ :: '+dinnerList[dinner]);
		dinnerList[dinner] = dinnerList[dinner].trim();
		
		// Each description should have max 3 words...
		
		if (dinner==B) console.log('3 :: '+dinnerList[dinner]);
		if (dinnerList[dinner].split(' ').length > 3)
			dinnerList[dinner] = dinnerList[dinner].split(' ').splice(0,3).join(' ');
		
		// If current item is info about veggie food, shorten...
		
		if (dinner==B) console.log('V :: '+dinnerList[dinner]);
		if (dinnerList[dinner].indexOf('INGEN VEGETAR') != -1)
			dinnerList[dinner] = dinnerList[dinner].split(' ').splice(0,2).join(' ');
		
	}
	
	// Save respective cantina info to localstorage
	if (cantinaTitle.indexOf('Realfag') != -1) {
		localStorage.realfagTitle = cantinaTitle;
		localStorage.realfagDinner = dinnerList.join(', ');
	}
	else if (cantinaTitle.indexOf('Hangaren') != -1) {
		localStorage.hangarenTitle = cantinaTitle;
		localStorage.hangarenDinner = dinnerList.join(', ');
	}
	else
		cantinaDinner_error();
}








