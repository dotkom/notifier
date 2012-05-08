
// Fetchfeed is called by background.html periodically, with unreadCount as
// callback. Fetchfeed is also called by popup.html when requested, but
// without the callback as we already know the amount of unread posts.
function fetchFeed(callback) {
	$.ajax({
		url: FEED_URL,
		dataType: 'text',
		success: function(xmlstring) {
			localStorage.lastResponseData = xmlstring;
			if (callback != undefined)
				callback(xmlstring);
		}
	})
	.fail(function() {
		if (DEBUG) console.log('ERROR: failed to fetch news feed');
	});
}

function unreadCount(xmlstring) {

	var unread_count = 0;
	
	// Parse the feed
	var xmldoc = $.parseXML(xmlstring);
	$xml = $(xmldoc);
	var items = $xml.find("item");
	var idList = []; // New || Updated
	
	// Count feed items
	items.each( function(index, element) {
		
		var id = $(element).find("guid").text().split('/')[4];
		
		// Counting...
		if (id != localStorage.mostRecentRead) {
			unread_count++;
			idList.push(id); // New || Updated
			// Send a desktop notification about the first unread element
			if (unread_count == 1) {
				if (localStorage.lastNotified != id) {
					showNotification(element);
				}
				localStorage.mostRecentUnread = id;
			}
		}
		// All counted :)
		else {
			if (unread_count == 0) {
				if (DEBUG) console.log('no new posts');
				chrome.browserAction.setBadgeText({text:''});
			}
			else if (unread_count >= 9) {
				if (DEBUG) console.log('9+ unread posts');
				chrome.browserAction.setBadgeText({text:'9+'});
			}
			else {
				if (DEBUG) console.log('1-8 unread posts');
				chrome.browserAction.setBadgeText({text:String(unread_count)});
			}
			localStorage.unreadCount = unread_count;
			storeMostRecentIds(idList); // New || Updated
			return false;
		}
		
		// Stop counting if unread number is greater than 9
		if (index > 8) { // Remember index is counting 0
			if (DEBUG) console.log('9+ unread posts (stopped counting)');
			chrome.browserAction.setBadgeText({text:'9+'});
			localStorage.unreadCount = 9;
			// New or updated?
			storeMostRecentIds(idList); // New || Updated
			return false;
		}
	});
}

function storeMostRecentIds(idList) {
	localStorage.mostRecentIdList = JSON.stringify(idList);
}

function showNotification(element) {
	if (localStorage.showNotifications == 'true') {
		var post = parsePost(element);
		// remember this
		localStorage.lastNotified = post.id;
		// get content
		localStorage.notificationTitle = post.title;
		localStorage.notificationLink = post.link;
		localStorage.notificationDescription = post.description;
		localStorage.notificationCreator = post.creator;
		localStorage.notificationDate = post.date;
		localStorage.notificationId = post.id;
		localStorage.notificationImage = BACKUP_IMAGE;
		var notification = webkitNotifications.createHTMLNotification('notification.html');
		notification.show(); // HTML5-style
	}
}

function parsePost(item) {
	var post = new Object();
	post.title = $(item).find("title").text();
	post.link = $(item).find("link").text();
	post.description = $(item).find("description").text();
	post.creator = $(item).find("dc:creator").text();
	post.date = $(item).find("pubDate").text().substr(5, 11);
	post.id = $(item).find("guid").text().split('/')[4];
	post.image = BACKUP_IMAGE;
	
	// remove excessive whitespace and ludicrous formatting from description
	post.description = $.trim($(post.description).text());
	
	// in case browser does not grok tags with colons, stupid browser
	if (post.creator == '') {
		var tag = ("dc\\:creator").replace( /.*(\:)(.*)/, "$2" );
		$(item).find(tag).each(function(){
			post.creator = $(this).text();
		});
	}
	
	// title + description must not exceed 5 lines
	var line = 38; // conservative estimation
	var desclength = line * 4;
	// double line titles will shorten the description by 1 line
	if (line <= post.title.length)
		desclength -= line;
	// triple line titles will be shortened to double line
	if (line*2 <= post.title.length)
		post.title = post.title.substr(0, line*2) + '...';
	// shorten description according to desclength
	if (desclength < post.description.length)
		post.description = post.description.substr(0, desclength) + '...';
	
	return post;
}

function getImageUrlForId(id, callback) {
	var image = 'undefined';
	$.getJSON(API_ADDRESS + id, function(json) {
		if (json['online_news_image']) {
			image = json['online_news_image']['0']['image'];
			callback(id, image);
		}
		else {
			image = BACKUP_IMAGE;
			if (DEBUG) console.log('ERROR: no image exists for id: ' + id);
			callback(id, image);
		}
	})
	.error(function() {
		image = BACKUP_IMAGE;
		if (DEBUG) console.log('ERROR: couldn\'t connect API to get image links, returning default image');
		callback(id, image);
	});
}

function openUrl(url) {
	chrome.tabs.create({url: url});
}







