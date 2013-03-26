var News = {
  newsMinLimit: 1,
  newsMaxLimit: 15,
  backupImage: 'img/logo-sponsor-placeholder.png',
  msgNewsLimit: 'Nyhetsantall må være et tall mellom '+this.newsMinLimit+' og '+this.newsMaxLimit,
  msgConnectionError: 'Frakoblet fra feed: ',
  msgUnsupportedFeed: 'Feeden støttes ikke',
  msgCallbackRequired: 'Callback er påkrevd, legg resultatene inn i DOMen',

  debug: 1,

  feeds: {
    // Linjeforeninger
    'berg': 'http://bergstud.no/feed/',
    'delta': 'http://org.ntnu.no/delta/wp/?feed=rss2',
    'emil': 'http://emilweb.no/feed/',
    'online': 'https://online.ntnu.no/feeds/news/',
    'nabla': 'http://nabla.no/feed/',
    'spanskrøret': 'http://spanskroret.no/feed/',
    // Medier
    'dusken': 'http://dusken.no/feed/',
    'universitetsavisa': 'http://www.universitetsavisa.no/?service=rss',
    // Store studentorganisasjoner
    'samfundet': 'http://www.samfundet.no/arrangement/rss',
    // Studentdemokrati
    'studenttinget': 'http://www.studenttinget.no/feed/',
    'velferdstinget': 'http://www.velferdstinget.no/feed/rss/',
    // NTNU
    'ntnu': 'https://www.retriever-info.com/feed/2002900/generell_arkiv166/index.xml',
    'rektoratet': 'http://www.ntnu.no/blogger/rektoratet/feed/',
  },

  // Get is called by background.html periodically, with News.unreadCount as
  // callback. Fetchfeed is also called by popup.html when requested, but
  // without the callback as we already know the amount of unread posts.
  get: function(feedName, limit, callback) {
    if (this.feeds[feedName] === undefined) {
      if (this.debug) console.log('ERROR:', this.msgUnsupportedFeed);
      callback(this.msgUnsupportedFeed);
      return;
    }
    if (isNaN(limit) || (limit < 1 && 20 < limit)) {
      if (this.debug) console.log('ERROR:', this.msgNewsLimit);
      callback(this.msgNewsLimit);
      return;
    }
    if (callback == undefined) {
      console.log('ERROR:', this.msgCallbackRequired);
      callback(this.msgCallbackRequired);
      return;
    }

    feedName = feedName.toLowerCase();
    var rssUrl = this.feeds[feedName];

    var self = this;
    $.ajax({
      url: rssUrl, // permission to use url granted in manifest.json
      dataType: 'xml',
      success: function(xml) {
        // ls.lastResponseData = xmlstring;
        self.parseFeed(xml, feedName, callback);
      },
      error: function(jqXHR, text, err) {
        if (self.debug) console.log('ERROR:', self.msgConnectionError, feedName);
        callback(self.msgConnectionError);
      },
    });
  },

  parseFeed: function(xml, feedName, callback) {
    var items = [];
    var self = this;
    $(xml).find('item').each( function() {
      var item = self.parseItem(this);
      items.push(item);
    });
    callback(items);
  },

  // NOT DONE YET ///////////////////////////////////////////////////////////////////
  // todo: this function only handles the online-feed, make sure it handles all feeds
  parseItem: function(item, feedName) {
    var post = {};
    post.title = $(item).find("title").text();
    post.link = $(item).find("link").text();
    post.description = $(item).find("description").text();
    post.creator = $(item).find("dc:creator").text();
    post.date = $(item).find("pubDate").text().substr(5, 11);
    
    post.id = $(item).find("guid").text().split('/')[4];
    post.image = this.backupImage;

    // Shorten 'bedriftspresentasjon' to 'bedpres'
    post.title = post.title.replace(/edrift(s)?presentasjon/gi, 'edpres');
    post.description = post.description.replace(/edrift(s)?presentasjon/gi, 'edpres');

    // Check for more direct link in the description
    var directLink = post.description.match(/(http.:\/\/)?online.ntnu.no\/event\/\d+(\/)?/g)
    if (directLink != null) {
      directLink = directLink[0];
      if (directLink != undefined) {
        post.link = directLink;
      }
    }
    post.description = post.description.trim();
    
    // In case browser does not grok tags with colons, stupid browser
    if (post.creator == '') {
      var tag = ("dc\\:creator").replace( /.*(\:)(.*)/, "$2" );
      $(item).find(tag).each(function(){
        post.creator = $(this).text().trim();
      });
    }
    // Didn't find a creator, set the feedname as creator
    console.log('HEEEEEEEEER creator "'+post.creator+'"', typeof post.creator); ////////////////////////////////////
    if (post.creator === '') {
      post.creator = feedName;
    }
    // Abbreviate creators with long names
    post.creator = this.abbreviateName(post.creator);
    
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

  // NOT DONE YET ///////////////////////////////////////////////////////////////////
  // todo: this function only handles the online-feed, make sure it handles all feeds
  unreadCount: function(xmlstring) {
    

    return; //


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
            this.showNotification(element);
          }
          localStorage.mostRecentUnread = id;
        }
      }
      // All counted :)
      else {
        if (unread_count == 0) {
          if (this.debug) console.log('no new posts');
          Browser.setBadgeText('');
        }
        else if (unread_count >= this.maxNewsAmount) {
          if (this.debug) console.log(this.maxNewsAmount + '+ unread posts');
          Browser.setBadgeText(this.maxNewsAmount + '+');
        }
        else {
          if (this.debug) console.log('1-' + (this.maxNewsAmount - 1) + ' unread posts');
          Browser.setBadgeText(String(unread_count));
        }
        localStorage.unreadCount = unread_count;
        localStorage.mostRecentIdList = JSON.stringify(idList); // New || Updated
        return false;
      }
      
      // Stop counting if unread number is greater than 9
      if (index > (this.maxNewsAmount - 1)) { // Remember index is counting 0
        if (this.debug) console.log(this.maxNewsAmount + '+ unread posts (stopped counting)');
        Browser.setBadgeText(this.maxNewsAmount + '+');
        localStorage.unreadCount = this.maxNewsAmount;
        // New or updated?
        localStorage.mostRecentIdList = JSON.stringify(idList); // New || Updated
        return false;
      }
    });
  },

  showNotification: function(item) {
    if (localStorage.showNotifications == 'true') {
      var post = this.parseItem(item);
      // Remember this
      localStorage.lastNotified = post.id;
      // Get content
      localStorage.notificationTitle = post.title;
      localStorage.notificationLink = post.link;
      localStorage.notificationDescription = post.description;
      localStorage.notificationCreator = post.creator;
      // Show desktop notification
      Browser.createNotification('notification.html');
    }
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

  // Organization specific functions

  online_getImage: function(link, callback) {
    var id = link.split('/')[4]; // id is stored in the link
    var image = 'undefined';
    var api = 'https://online.ntnu.no/api/f5be90e5ec1d2d454ae9/news_image_by_id/';
    $.getJSON(api + id, function(json) {
      if (json['online_news_image']) {
        image = json['online_news_image']['0']['image'];
        callback(id, image);
      }
      else {
        image = this.backupImage;
        if (this.debug) console.log('ERROR: no image exists for id: ' + id);
        callback(id, image);
      }
    })
    .error(function() {
      image = this.backupImage;
      if (this.debug) console.log('ERROR: couldn\'t connect API to get image links, returning default image');
      callback(id, image);
    });
  },

}


/*
felles:
    feeds
    get
    parseFeed
    parseItem
    showNotification
    unreadCount
    fletting

hver for seg:
    // last read
    keep list of recent posts
    get post image
*/





