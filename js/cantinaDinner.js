
// Public functions

function cantinaDinner_update() {
	if (localStorage.showCantinaDinner == 'true')
		fetchDinners();
	else if (DEBUG) console.log('user doesn\'t want dinner');
}

function cantinaDinner_reset(msg) {
	if (DEBUG) console.log('reset dinner data');
	localStorage.hangarenTitle = 'Hangaren';
	localStorage.hangarenDinner = msg;
	localStorage.realfagTitle = 'Realfag';
	localStorage.realfagDinner = msg;
}

function cantinaDinner_disable() {
	cantinaDinner_reset();
}

function cantinaDinner_error(msg) {
	if (DEBUG) console.log('Error: '+msg)
	cantinaDinner_reset(msg);
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
		cantinaDinner_error(CANTINA_CONNECTION_ERROR);
	});
	
	// Fetch Realfag
	$.ajax({
		url: REALFAG_DINNER_URL, // permission to use url granted in manifest.json
		dataType: 'xml',
		success: parseDinnerData
	})
	.fail(function() {
		cantinaDinner_error(CANTINA_CONNECTION_ERROR);
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
	localStorage.today = today;
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
			localStorage.realfagDinner = JSON.stringify(CANTINA_NOT_OPEN);
		}
		else if (cantinaTitle.indexOf('Hangaren') != -1) {
			localStorage.hangarenTitle = cantinaTitle;
			localStorage.hangarenDinner = JSON.stringify(CANTINA_NOT_OPEN);
		}
		return;
	}
	
	// Separate todays dinners
	var dinnerList = todaysDinners.split('<br>');
	
	// Remove empty or irrelevant information (items: first, last, second last)
	dinnerList = dinnerList.splice(1,dinnerList.length-3);
	
	if (DEBUG)
		var DINNERDEBUG = 0; // General debugging, see further down for deep debugging
	
	// Separate dinner and price
	var dinnerObjects = [];
	var indexCount = 0;
	dinnerList.forEach( function(dinner) {
		if (dinner.indexOf(':') != -1) {
			var description = dinner.split(':')[0];
			var price = dinner.split(':')[1];
			
			// if both dinner and price contains a '/' there might be two dinners
			// lodged into one cell, try to separate the siamese dinners!
			if ((description.indexOf('/') != -1) && (price.indexOf('/') != -1)) {
				var firstDescription = description.split('/')[0];
				var secondDescription = description.split('/')[1];
				var firstPrice = price.split('/')[0];
				var secondPrice = price.split('/')[1];
				var firstDinnerObject = new dinnerConstructor(firstDescription, firstPrice, indexCount);
				var secondDinnerObject = new dinnerConstructor(secondDescription, secondPrice, indexCount);
				if (DINNERDEBUG) console.log('===== Dual dinners, make objects:');
				if (DINNERDEBUG) console.log(firstDinnerObject.price + ', ' + firstDinnerObject.text  + ', ' + firstDinnerObject.index);
				if (DINNERDEBUG) console.log(secondDinnerObject.price + ', ' + secondDinnerObject.text  + ', ' + secondDinnerObject.index);
				dinnerObjects.push(firstDinnerObject);
				dinnerObjects.push(secondDinnerObject);
			}
			else {
				var dinnerObject = new dinnerConstructor(description, price, indexCount);
				if (DINNERDEBUG) console.log('===== Just one dinner, make object:');
				if (DINNERDEBUG) console.log(dinnerObject.price + ', ' + dinnerObject.text  + ', ' + dinnerObject.index);
				dinnerObjects.push(dinnerObject);
			}
			// The dinner.index represents the current dinners index in SiT's dinner lists.
			indexCount++;
		}
		else {
			cantinaDinner_error(CANTINA_MALFORMED_MENU);
			return;
		}
	});
	
	// Shorten dinner prices to the bare numbers
	dinnerObjects.forEach( function(dinner) {
		var price = dinner.price;
		// Two prices? Choose the cheapest
		if (price.indexOf('/') != -1) {
			var price1 = price.split('/')[0].match(/\d+/g);
			var price2 = price.split('/')[1].match(/\d+/g);
			price = ( Number(price1) < Number(price2) ? price1 : price2 );
			if (DINNERDEBUG) console.log('Price from "'+dinner.price+'" to "'+price+'" (DUAL price)');
		}
		else {
			price = price.match(/\d+/g); // Find the number, toss the rest
			if (DINNERDEBUG) console.log('Price from "'+dinner.price+'" to "'+price+'"');
		}
		dinner.price = price;
	});
	
	if (DEBUG)
		var TEXTDEBUG = 0; // Deep debugging of the dinner.text value
	
	// Shorten dinner descriptions to the bare necessities
	dinnerObjects.forEach( function(dinner) {
		var text = dinner.text;
		
		// Everything after indexOf(?) should be removed...
		if (TEXTDEBUG) console.log('. :: '+text);
		if (text.indexOf('.') != -1)
			text = text.split('.')[0];
		if (TEXTDEBUG) console.log(', :: '+text);
		if (text.indexOf(',') != -1)
			text = text.split(',')[0];
		if (TEXTDEBUG) console.log('( :: '+text);
		if (text.indexOf('(') != -1)
			text = text.split('(')[0];
		if (TEXTDEBUG) console.log('s :: '+text);
		if (text.indexOf('serveres') != -1)
			text = text.split('serveres')[0];
		if (TEXTDEBUG) console.log('S :: '+text);
		if (text.indexOf('Serveres') != -1)
			text = text.split('Serveres')[0];
		
		// Trim away extra whitespace...
		if (TEXTDEBUG) console.log('_ :: '+text);
		text = text.trim();
		
		// If current item is NOT about the buffet, continue with:
		if (text.toLowerCase().indexOf('buffet') == -1) {
			
			// Each description should have max 4 words...
			if (TEXTDEBUG) console.log('4 :: '+text);
			if (text.split(' ').length > 4)
				text = text.split(' ').splice(0,4).join(' ');
		
			// Description should not end with 'og', 'med' or '&'
			if (TEXTDEBUG) console.log('& :: '+text);
			if (endsWith(text, '&')) {
				var pieces = text.split(' ');
				text = pieces.splice(0,pieces.length-1).join(' ');
			}
			if (TEXTDEBUG) console.log('og:: '+text);
			if (endsWith(text, 'og')) {
				var pieces = text.split(' ');
				text = pieces.splice(0,pieces.length-1).join(' ');
			}
			if (TEXTDEBUG) console.log('med: '+text);
			if (endsWith(text, 'med')) {
				var pieces = text.split(' ');
				text = pieces.splice(0,pieces.length-1).join(' ');
			}
		
			// If current item is info about veggie food, shorten...
			if (TEXTDEBUG) console.log('V :: '+text);
			if (text.indexOf('INGEN VEGETAR') != -1)
				text = text.split(' ').splice(0,2).join(' ');
		}
		
		// Save cleaned text back to the object
		if (DINNERDEBUG) console.log('Text from: "'+dinner.text+'"\nText to: "'+text+'"');
		dinner.text = text;
	});
	
	// Sort dinnerobjects by price
	dinnerObjects.sort(function(a,b){return(a.price>b.price)?1:((b.price>a.price)?-1:0);});
	
	// Save respective cantina info to localstorage
	if (cantinaTitle.indexOf('Realfag') != -1) {
		localStorage.realfagTitle = cantinaTitle;
		localStorage.realfagDinner = JSON.stringify(dinnerObjects);
	}
	else if (cantinaTitle.indexOf('Hangaren') != -1) {
		localStorage.hangarenTitle = cantinaTitle;
		localStorage.hangarenDinner = JSON.stringify(dinnerObjects);
	}
	else
		cantinaDinner_error(CANTINA_UNSUPPORTED);
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function dinnerConstructor(text, price, index)
{
	this.text = text;
	this.price = price;
	this.index = index;
}








