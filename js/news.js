var News = {
  newsMinLimit: 1,
  newsMaxLimit: 15,
  unreadMaxCount: 3, // 0-indexed like the list it its counting, actually +1
  msgNewsLimit: 'Nyhetsantall må være et tall mellom '+this.newsMinLimit+' og '+this.newsMaxLimit,
  msgConnectionError: 'Frakoblet fra feeden til ',
  msgUnsupportedFeed: 'Feeden støttes ikke',
  msgCallbackRequired: 'Callback er påkrevd, legg resultatene inn i DOMen',

  debug: 0,

  // Get is called by background.html periodically, with News.unreadCount as
  // callback. Fetchfeed is also called by popup.html when requested, but
  // without the callback as we already know the amount of unread posts.
  get: function(affiliationObject, limit, callback) {
    if (affiliationObject === undefined) {
      if (this.debug) console.log('ERROR:', this.msgUnsupportedFeed);
      callback(this.msgUnsupportedFeed);
      return;
    }
    if (!isNumber(limit) || (limit < 1 && 20 < limit)) {
      if (this.debug) console.log('ERROR:', this.msgNewsLimit);
      callback(this.msgNewsLimit);
      return;
    }
    if (callback == undefined) {
      console.log('ERROR:', this.msgCallbackRequired);
      callback(this.msgCallbackRequired);
      return;
    }

    var rssUrl = affiliationObject.feed;

    var self = this;
    Ajaxer.getXml({
      url: rssUrl,
      success: function(xml) {
        self.parseFeed(xml, affiliationObject, limit, callback);
      },
      error: function(jqXHR, text, err) {
        if (self.debug) console.log('ERROR:', self.msgConnectionError);
        callback(self.msgConnectionError, affiliationObject.name);
      },
    });
  },

  parseFeed: function(xml, affiliationObject, limit, callback) {
    var items = [];
    var self = this;
    var count = 0;
    // Add each item from the feed
    $(xml).find('item').each( function() {
      if (count++ < limit) {
        var item = self.parseItem(this, affiliationObject);
        items.push(item);
      }
    });
    callback(items);
  },

  parseItem: function(item, affiliationObject) {
    var post = {};

    // - "If I've seen RSS feeds with multiple title fields in one item? Why, yes, yes I have."

    // The popular fields
    post.title = $(item).find("title").filter(':first').text();
    post.link = $(item).find("link").filter(':first').text();
    post.description = $(item).find("description").filter(':first').text();
    // Less used fields
    post.creator = $(item).find("dc:creator").filter(':first').text();
    post.date = $(item).find("pubDate").filter(':first').text().substr(5, 11);
    // Locally stored
    post.image = affiliationObject.placeholder;
    // Tag the posts with the key and name of the feed they came from
    post.feedKey = affiliationObject.key;
    post.feedName = affiliationObject.name;

    // Check for image in rarely used <enclosure>-tag
    var enclosure = $(item).find('enclosure');
    if (enclosure != '') {
      try {
        // Universitetsavisa does this little trick to get images in their feed
        post.image = enclosure['0'].attributes.url.textContent;
      }
      catch (err) {
        // Do nothing, we we're just checking, move along quitely
      }
    }
    
    // Check for alternative links in description
    post.altLink = this.checkForAltLink(post.description);

    // Remove HTML
    post.description = post.description.replace(/<[^>]*>/g, ''); // Tags
    // post.description = post.description.replace(/&(#\d+|\w+);/g, ''); // Entities
    
    // In case browser does not grok tags with colons, stupid browser
    if (post.creator == '') {
      var tag = ("dc\\:creator").replace( /.*(\:)(.*)/, "$2" );
      $(item).find(tag).each(function(){
        post.creator = $(this).text().trim();
      });
    }
    // Didn't find a creator, set the feedname as creator
    if (post.creator.length == 0) {
      post.creator = post.feedName;
    }
    // Capitalize creator name either way
    post.creator = post.creator.capitalize();
    // Abbreviate long creator names
    post.creator = this.abbreviateName(post.creator);

    // In case pubDate didn't exist, set to null
    if (post.date == '') {
      post.date = null;
    }

    // Trimming
    post.title = post.title.trim();
    post.description = post.description.trim();

    // Shorten 'bedriftspresentasjon' to 'bedpres'
    post.title = post.title.replace(/edrift(s)?presentasjon/gi, 'edpres');
    post.description = post.description.replace(/edrift(s)?presentasjon/gi, 'edpres');
    
    // title + description must not exceed 5 lines
    var line = 50; // conservative estimation
    var desclength = line * 3;
    // double line titles will shorten the description by 1 line
    if (line <= post.title.length)
      desclength -= line;
    // shorten description according to desclength
    if (desclength < post.description.length)
      post.description = post.description.substr(0, desclength) + '...';

    return post;
  },

  refreshNewsIdList: function(items) {
    var freshNewsList = [];
    items.forEach(function(item, index) {
      freshNewsList.push(item.link);
    });
    localStorage.newsList = JSON.stringify(freshNewsList);
  },

  unreadCountAndNotify: function(items) {
    var unreadCount = 0;
    var maxNewsAmount = this.unreadMaxCount;
    if (items.length-1 < maxNewsAmount)
      maxNewsAmount = items.length-1;

    var newsList = JSON.parse(localStorage.newsList);

    // Count feed items
    var self = this;
    items.forEach(function(item, index) {

      var link = item.link;
      
      // Counting...
      if (newsList.indexOf(link) === -1) {
        unreadCount++;

        // Send a desktop notification about the first new item
        if (unreadCount == 1) {
          if (localStorage.lastNotified != link) {
            self.showNotification(item);
          }
        }
      }
      // All counted :)
      else {
        if (unreadCount == 0) {
          if (self.debug) console.log('no new posts');
          Browser.setBadgeText('');
        }
        else if (maxNewsAmount <= unreadCount) {
          if (self.debug) console.log(maxNewsAmount + '+ unread posts');
          Browser.setBadgeText(maxNewsAmount + '+');
        }
        else {
          if (self.debug) console.log('1-' + (maxNewsAmount - 1) + ' unread posts');
          Browser.setBadgeText(String(unreadCount));
        }
        localStorage.unreadCount = unreadCount;
        return;
      }
      
      // Stop counting if unread number is greater than maxNewsAmount
      if ((maxNewsAmount - 1) < index) { // Remember index is counting 0
        if (self.debug) console.log((maxNewsAmount + 1) + ' unread posts (stopped counting)');
        Browser.setBadgeText(String(maxNewsAmount + 1));
        localStorage.unreadCount = maxNewsAmount + 1;
        return;
      }
    });
  },

  showNotification: function(item) {
    if (localStorage.showNotifications == 'true') {
      // Remember this
      localStorage.lastNotified = item.link;
      // Get content
      localStorage.notificationTitle = item.title;
      localStorage.notificationLink = item.link;
      localStorage.notificationDescription = item.description;
      localStorage.notificationCreator = item.creator;
      localStorage.notificationImage = item.image;
      localStorage.notificationFeedKey = item.feedKey;
      localStorage.notificationFeedName = item.feedName;
      // Show desktop notification
      Browser.createNotification('notification.html');
    }
  },

  checkForAltLink: function(description) {
    // Looking for alternative link, find the first and best full link
    var altLink = description.match(/href="(http[^"]*)"/);
    if (altLink != null) {
      if (typeof altLink[1] == 'string') {
        return altLink[1];
      }
    }
    return null;
  },

  abbreviateName: function(oldName) {
    if (oldName != undefined) {
      // Abbreviate middle names if name is long
      if (18 < oldName.length) {
        var pieces = oldName.split(' ');
        if (2 < pieces.length) {
          // Add first name
          var newName = pieces[0];
          // Add one letter per middle name
          for (var i = 1; i < pieces.length - 1; i++)
            newName += ' ' + pieces[i].charAt(0).toUpperCase() + '.';
          // Add last name
          newName += ' ' + pieces[pieces.length-1];
          return newName;
        }
      }
    }
    else {
      if (this.debug) console.log('ERROR: cannot abbreviate an undefined name');
    }
    return oldName;
  },

}
