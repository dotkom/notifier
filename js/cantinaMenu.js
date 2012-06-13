
if (DEBUG) {
	var DINNERDEBUG = 1; // General debugging
	var DINNERTEXTDEBUG = 1; // Deep debugging of dinner texts
}

// Public functions

function cantinaMenu_update() {
	if (localStorage.showCantinaDinner == 'true')
		fetchDinners();
	else if (DEBUG) console.log('user doesn\'t want dinner');
}

function cantinaMenu_reset(msg) {
	if (DEBUG) console.log('reset dinner data');
	localStorage.hangarenTitle = 'Hangaren';
	localStorage.hangarenMenu = msg;
	localStorage.realfagTitle = 'Realfag';
	localStorage.realfagMenu = msg;
}

function cantinaMenu_disable() {
	cantinaMenu_reset();
}

function cantinaMenu_error(msg) {
	if (DEBUG) console.log('ERROR: '+msg)
	cantinaMenu_reset(msg);
}

// Private functions

function fetchDinners() {
	
	// Fetch Hangaren
	$.ajax({
		url: HANGAREN_RSS, // permission to use url granted in manifest.json
		dataType: 'xml',
		success: parseDinnerData
	})
	.fail(function() {
		cantinaMenu_error(CANTINA_CONNECTION_ERROR);
	});
	
	// Fetch Realfag
	$.ajax({
		url: REALFAG_RSS, // permission to use url granted in manifest.json
		dataType: 'xml',
		success: parseDinnerData
	})
	.fail(function() {
		cantinaMenu_error(CANTINA_CONNECTION_ERROR);
	});
}

function parseDinnerData(xml) {
	try {
		// Find description tags (cantina title and dinner menus)
		var descriptions = $(xml).find("description");
		
		// Name current cantina
		var cantinaTitle = descriptions[0]['textContent'];
		cantinaTitle = (
			cantinaTitle.toLowerCase().indexOf('realfag') != -1 ? 'Realfag' :
			cantinaTitle.toLowerCase().indexOf('hangaren') != -1 ? 'Hangaren' :
			'Unnamed'
		);
		
		// IF menu is missing: stop
		if (descriptions[1] == undefined) {
			saveCantinaMenu(cantinaTitle, CANTINA_NOT_OPEN);
			return;
		}
		
		var fullWeekDinnerInfo = descriptions[1]['textContent'];
		
		// Throw away SiT's very excessive whitespace
		fullWeekDinnerInfo = $.trim(fullWeekDinnerInfo.replace(/[\s\n\r]+/g,' '));
		
		var today = whichDayIsIt();
		var dinnerForEachDay = fullWeekDinnerInfo.split('<b>');
		var todaysDinnerMenu = CANTINA_NOT_OPEN;
		var mondaysDinnerMenu = '';
		for (dinnerDay in dinnerForEachDay) {
			// Find todays dinner menu
			if (dinnerForEachDay[dinnerDay].lastIndexOf(today, 0) === 0)
				todaysDinnerMenu = dinnerForEachDay[dinnerDay];
			// Mondays menu is kept in case it contains a message
			if (dinnerForEachDay[dinnerDay].lastIndexOf('Mandag', 0) === 0)
				mondaysDinnerMenu = dinnerForEachDay[dinnerDay];
		}
		// If no dinners for today were found (saturday / sunday)
		if (todaysDinnerMenu == CANTINA_NOT_OPEN) {
			saveCantinaMenu(cantinaTitle, CANTINA_NOT_OPEN);
			return;
		}
		
		parseTodaysDinnerMenu(cantinaTitle, todaysDinnerMenu, mondaysDinnerMenu);
	}
	catch (err) {
		cantinaMenu_error(CANTINA_MALFORMED_MENU);
	}
}

function parseTodaysDinnerMenu(cantinaTitle, todaysDinnerMenu, mondaysDinnerMenu) {
	try {
		var dinnerList = todaysDinnerMenu.split('<br>');
		
		// Remove empty or irrelevant information (items: first, last, second last)
		dinnerList = dinnerList.splice(1,dinnerList.length-3);
		
		// Separate dinner and price
		var dinnerObjects = [];
		var indexCount = 0;
		dinnerList.forEach( function(dinner) {
			// Smiley-time, most likely no price information
			if (dinner.indexOf(':-)') != -1 || dinner.indexOf(':)') != -1) {
				var descriptions = dinner.split(': ');
				var dinner = descriptions[0];
				var price = (descriptions[1] == '' ? null : descriptions[1]);
				var dinnerObject = new dinnerConstructor(dinner, price, indexCount);
				if (DINNERTEXTDEBUG) console.log('WARNING: smileytime: ' + dinnerObject.text  + ' @ index ' + dinnerObject.index);
				dinnerObjects.push(dinnerObject);
			}
			// Find price information
			else if (dinner.indexOf(':') != -1) {
				var description = dinner.split(':')[0];
				var price = dinner.split(':')[1];
				// if both dinner and price contains a '/' there might be two dinners
				// lodged into one cell, try to separate the siamese dinners!
				if ((description.indexOf('/') != -1) && (price.indexOf('/') != -1)) {
					var descriptions = description.split('/');
					var prices = price.split('/');
					if (DINNERTEXTDEBUG) console.log('WARNING: multiple dinners in one cell: ' + descriptions + ', ' + prices + ', index: ' + index);
					dinnerObjects.push(new dinnerConstructor(descriptions[0], prices[0], indexCount));
					dinnerObjects.push(new dinnerConstructor(descriptions[1], prices[1], indexCount));
				}
				else {
					var dinnerObject = new dinnerConstructor(description, price, indexCount);
					if (DINNERTEXTDEBUG) console.log(dinnerObject.price + ', ' + dinnerObject.text  + ', ' + dinnerObject.index);
					dinnerObjects.push(dinnerObject);
				}
				// The dinner.index represents the current dinners index in SiT's dinner lists.
			}
			else {
				cantinaMenu_error(CANTINA_MALFORMED_MENU);
				return;
			}
			indexCount++;
		});
		
		// Shorten dinner prices
		dinnerObjects.forEach( function(dinner) {
			if (dinner.price != null) {
				var price = dinner.price;
				// Two price classes? Choose the cheapest
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
			}
		});
		
		// IF no dinner info is found at all, check for unique message at monday
		// WARNING: recursion going on!
		if (dinnerObjects.length == 0 && mondaysDinnerMenu != null) {
			if (DINNERDEBUG) console.log('WARNING: no dinner menu found today, checking monday');
			parseTodaysDinnerMenu(cantinaTitle, mondaysDinnerMenu, null);
			return;
		}
		// IF only one or two dinner object are found, keep them entirely
		else if (dinnerObjects.length == 1 || dinnerObjects.length == 2) {
			// in other words: do nothing!
			if (DINNERDEBUG) console.log('only one or two dinner menus found, let\'s keep them');
		}
		// Shorten dinner descriptions
		else {
			dinnerObjects.forEach( function(dinner) {
				var text = dinner.text;
				text = removePartsAfter(['.',',','(','/','serveres','Serveres'], text);
				text = text.trim();
			
				// If current item is NOT about the buffet, continue with:
				if (text.toLowerCase().indexOf('buffet') == -1) {
					text = limitNumberOfWords(4, text);
					text = removeLastWords(['&','og','med'], text);
					text = shortenVeggieWarning(text);
					text = text.trim();
				}
				if (DINNERDEBUG) console.log('Text from: "'+dinner.text+'"\nText to: "'+text+'"');
				dinner.text = text;
			});
		}
		
		// Sort dinnerobjects by price
		if (dinnerObjects[0].price != null)
			dinnerObjects.sort(function(a,b){return(a.price>b.price)?1:((b.price>a.price)?-1:0);});
		
		saveCantinaMenu(cantinaTitle, dinnerObjects);
	}
	catch (err) {
		cantinaMenu_error(CANTINA_MALFORMED_MENU);
	}
}

function dinnerConstructor(text, price, index) {
	this.text = text;
	this.price = price;
	this.index = index;
}

function endsWith(suffix, str) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function limitNumberOfWords(limit, text) {
	if (DINNERTEXTDEBUG) console.log(limit + ' :: ' + text);
	if (text.split(' ').length > limit)
		text = text.split(' ').splice(0,limit).join(' ');
	return text;
}

function removeLastWords(keys, text) {
	$.each(keys, function(key) {
		if (DINNERTEXTDEBUG) console.log(key + ' :: ' + text);
		if (endsWith(key, text)) {
			var pieces = text.split(' ');
			text = pieces.splice(0,pieces.length-1).join(' ');
		}
	});
	return text;
}

function removePartAfter(keys, text) {
	$.each(keys, function(key) {
		if (DINNERTEXTDEBUG) console.log(key + ' :: ' + text);
		if (text.indexOf(key) != -1)
			text = text.split(key)[0];
	});
	return text;
}

function saveCantinaMenu(cantinaTitle, cantinaMenu) {
	cantinaMenu = JSON.stringify(cantinaMenu);
	if (cantinaTitle == 'Hangaren')
		localStorage.hangarenMenu = cantinaMenu;
	else if (cantinaTitle == 'Realfag')
		localStorage.realfagMenu = cantinaMenu;
	else
		cantinaMenu_error(CANTINA_UNSUPPORTED);
}

function shortenVeggieWarning(text) {
	if (DINNERTEXTDEBUG) console.log('V :: ' + text);
	if (text.toLowerCase().indexOf('ingen vegetar') != -1 || text.toLowerCase().indexOf('ikke vegetar') != -1)
		text = text.split(' ').splice(0,2).join(' ');
	return text;
}

function whichDayIsIt() {
	var dayNames=["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"];
	var today = dayNames[new Date().getDay()];
	localStorage.today = today;
	return today;
}









