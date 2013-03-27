var News = {
  newsMinLimit: 1,
  newsMaxLimit: 15,
  msgNewsLimit: 'Nyhetsantall må være et tall mellom '+this.newsMinLimit+' og '+this.newsMaxLimit,
  msgConnectionError: 'Frakoblet fra feed: ',
  msgUnsupportedFeed: 'Feeden støttes ikke',
  msgCallbackRequired: 'Callback er påkrevd, legg resultatene inn i DOMen',

  debug: 1,

  // IMPORTANT: Keep the same order here as in options.html and in manifest.json
  feeds: {
    // Linjeforeninger Gløshaugen
    'berg': {
      'feed': 'http://bergstud.no/feed/',
      'logo': 'img/logos/berg.png',
      'image': 'img/placeholders/berg.png',
    },
    'delta': {
      'feed': 'http://org.ntnu.no/delta/wp/?feed=rss2',
      'logo': 'img/logos/delta.png',
      'image': 'img/placeholders/delta.png',
    },
    'emil': {
      'feed': 'http://emilweb.no/feed/',
      'logo': 'img/logos/emil.png',
      'image': 'img/placeholders/emil.png',
    },
    'leonardo': {
      'feed': 'http://industrielldesign.com/feed',
      'logo': 'img/logos/leonardo.png',
      'image': 'img/placeholders/leonardo.png',
    },
    'online': {
      'feed': 'https://online.ntnu.no/feeds/news/',
      'logo': 'img/logos/online.png',
      'image': 'img/placeholders/online.png',
    },
    'nabla': {
      'feed': 'http://nabla.no/feed/',
      'logo': 'img/logos/nabla.png',
      'image': 'img/placeholders/nabla.png',
    },
    'spanskrøret': {
      'feed': 'http://spanskroret.no/feed/',
      'logo': 'img/logos/spanskrøret.png',
      'image': 'img/placeholders/spanskrøret.png',
    },
    'volvox': {
      'feed': 'http://org.ntnu.no/volvox/feed/',
      'logo': 'img/logos/volvox.png',
      'image': 'img/placeholders/volvox.png',
    },

    // Linjeforeninger Dragvoll
    'dionysos': {
      'feed': 'http://dionysosntnu.wordpress.com/feed/',
      'logo': 'img/logos/dionysos.png',
      'image': 'img/placeholders/dionysos.png',
    },
    'erudio': {
      'feed': 'http://www.erudiontnu.org/?feed=rss2',
      'logo': 'img/logos/erudio.png',
      'image': 'img/placeholders/erudio.png',
    },
    'geolf': {
      'feed': 'http://geolf.org/feed/',
      'logo': 'img/logos/geolf.png',
      'image': 'img/placeholders/geolf.png',
    },
    'gengangere': {
      'feed': 'http://www.gengangere.no/feed/',
      'logo': 'img/logos/gengangere.png',
      'image': 'img/placeholders/gengangere.png',
    },
    'jump cut': {
      'feed': 'http://jumpcutdragvoll.wordpress.com/feed/',
      'logo': 'img/logos/jump cut.png',
      'image': 'img/placeholders/jump cut.png',
    },
    'ludimus': {
      'feed': 'http://ludimus.org/feed/',
      'logo': 'img/logos/ludimus.png',
      'image': 'img/placeholders/ludimus.png',
    },
    'primetime': {
      'feed': 'http://www.primetime.trondheim.no/feed/',
      'logo': 'img/logos/primetime.png',
      'image': 'img/placeholders/primetime.png',
    },
    'sturm und drang': {
      'feed': 'http://www.sturm.ntnu.no/wordpress/?feed=rss2',
      'logo': 'img/logos/sturm und drang.png',
      'image': 'img/placeholders/sturm und drang.png',
    },

    // Linjeforeninger HiST/DMMH/TJSF/BI
    'fraktur': {
      'feed': 'http://www.fraktur.no/feed/',
      'logo': 'img/logos/fraktur.png',
      'image': 'img/placeholders/fraktur.png',
    },
    'kom': {
      'feed': 'http://kjemiogmaterial.wordpress.com/feed/',
      'logo': 'img/logos/kom.png',
      'image': 'img/placeholders/kom.png',
    },
    'logistikkstudentene': {
      'feed': 'http://www.logistikkstudentene.no/',
      'logo': 'img/logos/logistikkstudentene.png',
      'image': 'img/placeholders/logistikkstudentene.png',
    },
    'tihlde': {
      'feed': 'http://tihlde.org/feed/',
      'logo': 'img/logos/tihlde.png',
      'image': 'img/placeholders/tihlde.png',
    },
    'tim og shænko': {
      'feed': 'http://bygging.no/feed/',
      'logo': 'img/logos/tim og shænko.png',
      'image': 'img/placeholders/tim og shænko.png',
    },
    'tjsf': {
      'feed': 'http://tjsf.no/feed/',
      'logo': 'img/logos/tjsf.png',
      'image': 'img/placeholders/tjsf.png',
    },

    // Studentmedier
    'dusken': {
      'feed': 'http://dusken.no/feed/',
      'logo': 'img/logos/dusken.png',
      'image': 'img/placeholders/dusken.png',
    },
    'universitetsavisa': {
      'feed': 'http://www.universitetsavisa.no/?service=rss',
      'logo': 'img/logos/universitetsavisa.png',
      'image': 'img/placeholders/universitetsavisa.png',
    },

    // Store studentorganisasjoner
    'samfundet': {
      'feed': 'http://www.samfundet.no/arrangement/rss',
      'logo': 'img/logos/samfundet.png',
      'image': 'img/placeholders/samfundet.png',
    },

    // Studentdemokrati
    'velferdstinget': {
      'feed': 'http://www.velferdstinget.no/feed/rss/',
      'logo': 'img/logos/velferdstinget.png',
      'image': 'img/placeholders/velferdstinget.png',
    },
    'studenttinget ntnu': {
      'feed': 'http://www.studenttinget.no/feed/',
      'logo': 'img/logos/studenttinget ntnu.png',
      'image': 'img/placeholders/studenttinget ntnu.png',
    },
    'studentparlamentet hist': {
      'feed': 'http://studentparlamentet.com/?feed=rss2',
      'logo': 'img/logos/studentparlamentet hist.png',
      'image': 'img/placeholders/studentparlamentet hist.png',
    },
    
    // Institusjoner
    'ntnu': {
      'feed': 'https://www.retriever-info.com/feed/2002900/generell_arkiv166/index.xml',
      'logo': 'img/logos/ntnu.png',
      'image': 'img/placeholders/ntnu.png',
    },
    'rektoratet ntnu': {
      'feed': 'http://www.ntnu.no/blogger/rektoratet/feed/',
      'logo': 'img/logos/rektoratet ntnu.png',
      'image': 'img/placeholders/rektoratet ntnu.png',
    },
    'hist': {
      'feed': 'http://hist.no/rss.ap?thisId=1393',
      'logo': 'img/logos/hist.png',
      'image': 'img/placeholders/hist.png',
    },
    'dmmh': {
      'feed': 'http://www.dmmh.no/rss.php?type=site&id=10&location=393',
      'logo': 'img/logos/dmmh.png',
      'image': 'img/placeholders/dmmh.png',
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
    // The popular fields
    post.title = $(item).find("title").text();
    post.link = $(item).find("link").text();
    post.description = $(item).find("description").text();
    // Less used fields
    post.creator = $(item).find("dc:creator").text();
    post.date = $(item).find("pubDate").text().substr(5, 11);
    // Locally stored
    post.image = this.feeds[feedName]['image'];
    post.feedName = feedName;
    
    // Check for alternative links in description
    post.altLink = this.checkForAltLink(post.description);

    // Shorten 'bedriftspresentasjon' to 'bedpres'
    post.title = post.title.replace(/edrift(s)?presentasjon/gi, 'edpres');
    post.description = post.description.replace(/edrift(s)?presentasjon/gi, 'edpres');

    // Remove HTML and excessive whitespace
    if (post.description.match(/<\w+>/g) !== null) { // Check if string contains markup
      post.description = post.description.replace(/<[^>]+>/g, '$1');
      post.description = post.description.trim();
    }
    else {
      post.description = post.description.trim();
    }
    
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
    var maxNewsAmount = items.length-1;
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
        else if (unreadCount >= maxNewsAmount) {
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
      
      // Stop counting if unread number is greater than 9
      if (index > (maxNewsAmount - 1)) { // Remember index is counting 0
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
    var altLink = description.match(/href="(http.*)"/);
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
