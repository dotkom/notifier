var News = {
  newsMinLimit: 1,
  newsMaxLimit: 15,
  unreadMaxCount: 3, // 0-indexed like the list it its counting, actually +1
  msgNewsLimit: 'Nyhetsantall må være et tall mellom '+this.newsMinLimit+' og '+this.newsMaxLimit,
  msgConnectionError: 'Frakoblet fra feed: ',
  msgUnsupportedFeed: 'Feeden støttes ikke',
  msgCallbackRequired: 'Callback er påkrevd, legg resultatene inn i DOMen',

  debug: 0,

  // IMPORTANT: Keep the same order here as in options.html and in manifest.json
  feeds: {
    // Linjeforeninger Gløshaugen
    'berg': {
      'feed': 'http://bergstud.no/feed/',
      'logo': 'org/berg/logo.png',
      'square': 'org/berg/square.png',
      'placeholder': 'org/berg/placeholder.png',
      'color': 'grey',
    },
    'delta': {
      'feed': 'http://org.ntnu.no/delta/wp/?feed=rss2',
      'logo': 'org/delta/logo.png',
      'square': 'org/delta/square.png',
      'placeholder': 'org/delta/placeholder.png',
      'color': 'green',
    },
    'emil': {
      'feed': 'http://emilweb.no/feed/',
      'logo': 'org/emil/logo.png',
      'square': 'org/emil/square.png',
      'placeholder': 'org/emil/placeholder.png',
      'color': 'green',
    },
    'leonardo': {
      'feed': 'http://industrielldesign.com/feed',
      'logo': 'org/leonardo/logo.png',
      'square': 'org/leonardo/square.png',
      'placeholder': 'org/leonardo/placeholder.png',
      'color': 'cyan',
    },
    'online': {
      'feed': 'https://online.ntnu.no/feeds/news/',
      'logo': 'org/online/logo.png',
      'square': 'org/online/square.png',
      'placeholder': 'org/online/placeholder.png',
      'color': 'blue',
    },
    'nabla': {
      'feed': 'http://nabla.no/feed/',
      'logo': 'org/nabla/logo.png',
      'square': 'org/nabla/square.png',
      'placeholder': 'org/nabla/placeholder.png',
      'color': 'red',
    },
    'spanskrøret': {
      'feed': 'http://spanskroret.no/feed/',
      'logo': 'org/spanskrøret/logo.png',
      'square': 'org/spanskrøret/square.png',
      'placeholder': 'org/spanskrøret/placeholder.png',
      'color': 'grey',
    },
    'volvox': {
      'feed': 'http://org.ntnu.no/volvox/feed/',
      'logo': 'org/volvox/logo.png',
      'square': 'org/volvox/square.png',
      'placeholder': 'org/volvox/placeholder.png',
      'color': 'green',
    },

    // Linjeforeninger Dragvoll
    'dionysos': {
      'feed': 'http://dionysosntnu.wordpress.com/feed/',
      'logo': 'org/dionysos/logo.png',
      'square': 'org/dionysos/square.png',
      'placeholder': 'org/dionysos/placeholder.png',
      'color': 'grey',
    },
    'erudio': {
      'feed': 'http://www.erudiontnu.org/?feed=rss2',
      'logo': 'org/erudio/logo.png',
      'square': 'org/erudio/square.png',
      'placeholder': 'org/erudio/placeholder.png',
      'color': 'red',
    },
    'geolf': {
      'feed': 'http://geolf.org/feed/',
      'logo': 'org/geolf/logo.png',
      'square': 'org/geolf/square.png',
      'placeholder': 'org/geolf/placeholder.png',
      'color': 'blue',
    },
    'gengangere': {
      'feed': 'http://www.gengangere.no/feed/',
      'logo': 'org/gengangere/logo.png',
      'square': 'org/gengangere/square.png',
      'placeholder': 'org/gengangere/placeholder.png',
      'color': 'grey',
    },
    'jump cut': {
      'feed': 'http://jumpcutdragvoll.wordpress.com/feed/',
      'logo': 'org/jump cut/logo.png',
      'square': 'org/jump cut/square.png',
      'placeholder': 'org/jump cut/placeholder.png',
      'color': 'grey',
    },
    'ludimus': {
      'feed': 'http://ludimus.org/feed/',
      'logo': 'org/ludimus/logo.png',
      'square': 'org/ludimus/square.png',
      'placeholder': 'org/ludimus/placeholder.png',
      'color': 'red',
    },
    'primetime': {
      'feed': 'http://www.primetime.trondheim.no/feed/',
      'logo': 'org/primetime/logo.png',
      'square': 'org/primetime/square.png',
      'placeholder': 'org/primetime/placeholder.png',
      'color': 'cyan',
    },
    'sturm und drang': {
      'feed': 'http://www.sturm.ntnu.no/wordpress/?feed=rss2',
      'logo': 'org/sturm und drang/logo.png',
      'square': 'org/sturm und drang/square.png',
      'placeholder': 'org/sturm und drang/placeholder.png',
      'color': 'red',
    },

    // Linjeforeninger HiST/DMMH/TJSF/BI
    'fraktur': {
      'feed': 'http://www.fraktur.no/feed/',
      'logo': 'org/fraktur/logo.png',
      'square': 'org/fraktur/square.png',
      'placeholder': 'org/fraktur/placeholder.png',
      'color': 'cyan',
    },
    'kom': {
      'feed': 'http://kjemiogmaterial.wordpress.com/feed/',
      'logo': 'org/kom/logo.png',
      'square': 'org/kom/square.png',
      'placeholder': 'org/kom/placeholder.png',
      'color': 'cyan',
    },
    'logistikkstudentene': {
      'feed': 'http://www.logistikkstudentene.no/?feed=rss2',
      'logo': 'org/logistikkstudentene/logo.png',
      'square': 'org/logistikkstudentene/square.png',
      'placeholder': 'org/logistikkstudentene/placeholder.png',
      'color': 'cyan',
    },
    'tihlde': {
      'feed': 'http://tihlde.org/feed/',
      'logo': 'org/tihlde/logo.png',
      'square': 'org/tihlde/square.png',
      'placeholder': 'org/tihlde/placeholder.png',
      'color': 'blue',
    },
    'tim og shænko': {
      'feed': 'http://bygging.no/feed/',
      'logo': 'org/tim og shænko/logo.png',
      'square': 'org/tim og shænko/square.png',
      'placeholder': 'org/tim og shænko/placeholder.png',
      'color': 'blue',
    },
    'tjsf': {
      'feed': 'http://tjsf.no/feed/',
      'logo': 'org/tjsf/logo.png',
      'square': 'org/tjsf/square.png',
      'placeholder': 'org/tjsf/placeholder.png',
      'color': 'grey',
    },

    // Studentmedier
    'dusken': {
      'feed': 'http://dusken.no/feed/',
      'logo': 'org/dusken/logo.png',
      'square': 'org/dusken/square.png',
      'placeholder': 'org/dusken/placeholder.png',
      'color': 'grå',
    },
    'universitetsavisa': {
      'feed': 'http://www.universitetsavisa.no/?service=rss',
      'logo': 'org/universitetsavisa/logo.png',
      'square': 'org/universitetsavisa/square.png',
      'placeholder': 'org/universitetsavisa/placeholder.png',
      'color': 'cyan',
    },

    // Store studentorganisasjoner
    'samfundet': {
      'feed': 'http://www.samfundet.no/arrangement/rss',
      'logo': 'org/samfundet/logo.png',
      'square': 'org/samfundet/square.png',
      'placeholder': 'org/samfundet/placeholder.png',
      'color': 'red',
    },

    // Studentdemokrati
    'velferdstinget': {
      'feed': 'http://www.velferdstinget.no/feed/rss/',
      'logo': 'org/velferdstinget/logo.png',
      'square': 'org/velferdstinget/square.png',
      'placeholder': 'org/velferdstinget/placeholder.png',
      'color': 'cyan',
    },
    'studenttinget ntnu': {
      'feed': 'http://www.studenttinget.no/feed/',
      'logo': 'org/studenttinget ntnu/logo.png',
      'square': 'org/studenttinget ntnu/square.png',
      'placeholder': 'org/studenttinget ntnu/placeholder.png',
      'color': 'red',
    },
    'studentparlamentet hist': {
      'feed': 'http://studentparlamentet.com/?feed=rss2',
      'logo': 'org/studentparlamentet hist/logo.png',
      'square': 'org/studentparlamentet hist/square.png',
      'placeholder': 'org/studentparlamentet hist/placeholder.png',
      'color': 'blue',
    },
    
    // Institusjoner
    'ntnu': {
      'feed': 'https://www.retriever-info.com/feed/2002900/generell_arkiv166/index.xml',
      'logo': 'org/ntnu/logo.png',
      'square': 'org/ntnu/square.png',
      'placeholder': 'org/ntnu/placeholder.png',
      'color': 'blue',
    },
    'rektoratet ntnu': {
      'feed': 'http://www.ntnu.no/blogger/rektoratet/feed/',
      'logo': 'org/rektoratet ntnu/logo.png',
      'square': 'org/rektoratet ntnu/square.png',
      'placeholder': 'org/rektoratet ntnu/placeholder.png',
      'color': 'blue',
    },
    'hist': {
      'feed': 'http://hist.no/rss.ap?thisId=1393',
      'logo': 'org/hist/logo.png',
      'square': 'org/hist/square.png',
      'placeholder': 'org/hist/placeholder.png',
      'color': 'blue',
    },
    'dmmh': {
      'feed': 'http://www.dmmh.no/rss.php?type=site&id=10&location=393',
      'logo': 'org/dmmh/logo.png',
      'square': 'org/dmmh/square.png',
      'placeholder': 'org/dmmh/placeholder.png',
      'color': 'red',
    },
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

    feedName = feedName.toLowerCase();
    var rssUrl = this.feeds[feedName].feed;

    var self = this;
    $.ajax({
      url: rssUrl, // permission to use url granted in manifest.json
      dataType: 'xml',
      success: function(xml) {
        // ls.lastResponseData = xmlstring;
        self.parseFeed(xml, feedName, limit, callback);
      },
      error: function(jqXHR, text, err) {
        if (self.debug) console.log('ERROR:', self.msgConnectionError, feedName);
        callback(self.msgConnectionError);
      },
    });
  },

  parseFeed: function(xml, feedName, limit, callback) {
    var items = [];
    var self = this;
    var count = 0;
    $(xml).find('item').each( function() {
      if (count++ < limit) {
        var item = self.parseItem(this, feedName);
        items.push(item);
      }
    });
    callback(items);
  },

  parseItem: function(item, feedName) {
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
    post.image = this.feeds[feedName]['image'];
    post.feedName = feedName;
    
    // Check for alternative links in description
    post.altLink = this.checkForAltLink(post.description);

    // Shorten 'bedriftspresentasjon' to 'bedpres'
    post.title = post.title.replace(/edrift(s)?presentasjon/gi, 'edpres');
    post.description = post.description.replace(/edrift(s)?presentasjon/gi, 'edpres');

    // Remove HTML
    post.description = post.description.replace(/<[^>]*>/g, ''); // Tags
    // post.description = post.description.replace(/&(#\d+|\w+);/g, ''); // Entities

    // Trimming
    post.title = post.title.trim();
    post.description = post.description.trim();
    
    // In case browser does not grok tags with colons, stupid browser
    if (post.creator == '') {
      var tag = ("dc\\:creator").replace( /.*(\:)(.*)/, "$2" );
      $(item).find(tag).each(function(){
        post.creator = $(this).text().trim();
      });
    }
    // Didn't find a creator, set the feedname as creator
    if (post.creator.length == 0) {
      post.creator = feedName;
    }
    // Capitalize creator name either way
    post.creator = post.creator.capitalize();
    // Abbreviate long creator names
    post.creator = this.abbreviateName(post.creator);

    // In case pubDate didn't exist, set to null
    if (post.date == '') {
      post.date = null;
    }
    
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

  unreadCount: function(items) {
    var unreadCount = 0;
    var maxNewsAmount = this.unreadMaxCount;
    if (items.length-1 < maxNewsAmount)
      maxNewsAmount = items.length-1;
    var linkList = []; // New || Updated

    // Count feed items
    var self = this;
    items.forEach(function(item, index) {

      var link = item.link;
      
      // Counting...

      if (link != localStorage.mostRecentRead) {
        unreadCount++;

        linkList.push(link); // New || Updated
        // Send a desktop notification about the first unread item
        if (unreadCount == 1) {
          if (localStorage.lastNotified != link) {
            self.showNotification(item);
          }
          localStorage.mostRecentUnread = link;
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
        localStorage.mostRecentLinkList = JSON.stringify(linkList); // New || Updated
        return false;
      }
      
      // Stop counting if unread number is greater than maxNewsAmount
      if ((maxNewsAmount - 1) < index) { // Remember index is counting 0
        if (self.debug) console.log(maxNewsAmount + '+ unread posts (stopped counting)');
        Browser.setBadgeText(maxNewsAmount + '+');
        localStorage.unreadCount = maxNewsAmount;
        // New or updated?
        localStorage.mostRecentLinkList = JSON.stringify(linkList); // New || Updated
        return false;
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

  // Organization specific functions

  online_getImage: function(link, callback) {
    var id = link.split('/')[4]; // id is stored in the link
    var image = 'undefined';
    var api = 'https://online.ntnu.no/api/f5be90e5ec1d2d454ae9/news_image_by_id/';
    var self = this;
    $.getJSON(api + id, function(json) {
      if (json['online_news_image']) {
        image = json['online_news_image']['0']['image'];
        callback(link, image);
      }
      else {
        image = this.images['online'].image;
        if (self.debug) console.log('ERROR: no image exists for id: ' + id);
        callback(link, image);
      }
    })
    .error(function() {
      image = self.images['online'].image;
      if (self.debug) console.log('ERROR: couldn\'t connect API to get image links, returning default image');
      callback(link, image);
    });
  },

}
