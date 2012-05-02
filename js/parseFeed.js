
function fetchFeed(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(data) {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				var data = xhr.responseText;
				localStorage.lastResponseData = data;
				callback(data);
			} else {
				callback(null);
			}
		}
	}
	// Note: Permissions to use the URL must be granted in manifest.json
	xhr.open('GET', url, true);
	xhr.send();
}

function unreadCount(response) {

	var unread_count = 0;
	
	// Parse the feed
	var xml_doc = $.parseXML(response);
	$xml = $(xml_doc);
	var items = $xml.find("item");
	
	// Count feed items
	items.each( function(index, element) {
		
		var id = $(element).find("guid").text();
		
		// Counting...
		if (id != localStorage.mostRecentRead) {
			unread_count++;
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
				if (DEBUG) console.log('feedparser: zero new posts');
				chrome.browserAction.setBadgeText({text:''});
			}
			else if (unread_count >= 9) {
				if (DEBUG) console.log('feedparser: 9+ unread posts');
				chrome.browserAction.setBadgeText({text:'9+'});
			}
			else {
				if (DEBUG) console.log('feedparser: 1-8 unread posts');
				chrome.browserAction.setBadgeText({text:String(unread_count)});
			}
			localStorage.unreadCount = unread_count;
			return false;
		}
		
		// Stop counting if unread number is greater than 9
		if (index > 8) { // Remember index is counting 0
			if (DEBUG) console.log('feedparser: 9+ unread posts (stopped counting)');
			chrome.browserAction.setBadgeText({text:'9+'});
			localStorage.unreadCount = 9;
			return false;
		}
	});
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
		// image isn't fetched yet
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
	post.id = $(item).find("guid").text();
	
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

function openUrl(url) {
	chrome.tabs.create({url: url});
}







