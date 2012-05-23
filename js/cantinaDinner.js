
// Public functions

function cantinaDinner_update() {
	if (localStorage.showCantinaDinner == 'true')
		fetchDinners();
	else if (DEBUG) console.log('user doesn\'t want dinner');
}

function cantinaDinner_reset() {
	if (DEBUG) console.log('reset dinner data');
	localStorage.hangarenTitle = 'Hangaren';
	localStorage.hangarenDinner = CANTINA_CONNECTION_ERROR;
	localStorage.realfagTitle = 'Realfag';
	localStorage.realfagDinner = CANTINA_CONNECTION_ERROR;
}

function cantinaDinner_disable() {
	cantinaDinner_reset();
}

function cantinaDinner_error(msg) {
	if (DEBUG) console.log('Error: '+msg)
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
		cantinaDinner_error('failed to fetch dinner from hangaren');
	});
	
	// Fetch Realfag
	$.ajax({
		url: REALFAG_DINNER_URL, // permission to use url granted in manifest.json
		dataType: 'xml',
		success: parseDinnerData
	})
	.fail(function() {
		cantinaDinner_error('failed to fetch dinner from realfag');
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
	var todaysDinners = CANTINA_NOT_OPEN;
	// Separate todays dinners
	for (dinnerDay in dinnerForEachDay) {
		if (dinnerForEachDay[dinnerDay].lastIndexOf(today, 0) === 0) {
			todaysDinners = dinnerForEachDay[dinnerDay];
		}
	}
	// If no dinners for today were found
	if (todaysDinners == CANTINA_NOT_OPEN) {
		if (cantinaTitle.indexOf('Realfag') != -1) {
			localStorage.realfagTitle = cantinaTitle;
			localStorage.realfagDinner = CANTINA_NOT_OPEN;
		}
		else if (cantinaTitle.indexOf('Hangaren') != -1) {
			localStorage.hangarenTitle = cantinaTitle;
			localStorage.hangarenDinner = CANTINA_NOT_OPEN;
		}
		return;
	}
	
	// Separate todays dinners
	var dinnerList = todaysDinners.split('<br>');
	
	// Remove empty or irrelevant information (items: first, last, second last)
	dinnerList = dinnerList.splice(1,dinnerList.length-3);
	
	var DINNERDEBUG = 0;
	
	// Shorten relevant information to the bare necessities
	for (dinner in dinnerList) {
		
		if (DINNERDEBUG) dinnerList[dinner] = 'Fredagsbuffet -forsyn deg en gang!:';
		
		// Everything after X should be removed...
		if (DINNERDEBUG) console.log('. :: '+dinnerList[dinner]);
		if (dinnerList[dinner].indexOf('.') != -1)
			dinnerList[dinner] = dinnerList[dinner].split('.')[0];
		
		if (DINNERDEBUG) console.log(', :: '+dinnerList[dinner]);
		if (dinnerList[dinner].indexOf(',') != -1)
			dinnerList[dinner] = dinnerList[dinner].split(',')[0];
		
		if (DINNERDEBUG) console.log(': :: '+dinnerList[dinner]);
		if (dinnerList[dinner].indexOf(':') != -1)
			dinnerList[dinner] = dinnerList[dinner].split(':')[0];
		
		if (DINNERDEBUG) console.log('( :: '+dinnerList[dinner]);
		if (dinnerList[dinner].indexOf('(') != -1)
			dinnerList[dinner] = dinnerList[dinner].split('(')[0];
		
		if (DINNERDEBUG) console.log('s :: '+dinnerList[dinner]);
		if (dinnerList[dinner].indexOf('serveres') != -1)
			dinnerList[dinner] = dinnerList[dinner].split('serveres')[0];
		
		if (DINNERDEBUG) console.log('S :: '+dinnerList[dinner]);
		if (dinnerList[dinner].indexOf('Serveres') != -1)
			dinnerList[dinner] = dinnerList[dinner].split('Serveres')[0];
		
		// Trim away extra whitespace...
		
		if (DINNERDEBUG) console.log('_ :: '+dinnerList[dinner]);
		dinnerList[dinner] = dinnerList[dinner].trim();
		
		// If current item is about the buffet, keep the rest intact.
		// Otherwise:
		if (dinnerList[dinner].toLowerCase().indexOf('buffet') == -1) {
			
			// Each description should have max 4 words...
		
			if (DINNERDEBUG) console.log('4 :: '+dinnerList[dinner]);
			if (dinnerList[dinner].split(' ').length > 4)
				dinnerList[dinner] = dinnerList[dinner].split(' ').splice(0,4).join(' ');
		
			// Description should not end with 'og', 'med' or '&'
			// Q: Why not just cut any word with 3 chars or less?
			// A: Because 'ris' is three chars. Kjøttboller med grovkornet ris anyone?
		
			if (DINNERDEBUG) console.log('& :: '+dinnerList[dinner]);
			if (endsWith(dinnerList[dinner], '&')) {
				var pieces = dinnerList[dinner].split(' ');
				dinnerList[dinner] = pieces.splice(0,pieces.length-1).join(' ');
			}
		
			if (DINNERDEBUG) console.log('og:: '+dinnerList[dinner]);
			if (endsWith(dinnerList[dinner], 'og')) {
				var pieces = dinnerList[dinner].split(' ');
				dinnerList[dinner] = pieces.splice(0,pieces.length-1).join(' ');
			}
			
			if (DINNERDEBUG) console.log('med: '+dinnerList[dinner]);
			if (endsWith(dinnerList[dinner], 'med')) {
				var pieces = dinnerList[dinner].split(' ');
				dinnerList[dinner] = pieces.splice(0,pieces.length-1).join(' ');
			}
		
			// If current item is info about veggie food, shorten...
		
			if (DINNERDEBUG) console.log('V :: '+dinnerList[dinner]);
			if (dinnerList[dinner].indexOf('INGEN VEGETAR') != -1)
				dinnerList[dinner] = dinnerList[dinner].split(' ').splice(0,2).join(' ');
				
		}
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

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}








