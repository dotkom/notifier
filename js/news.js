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
      'name': 'Bergstuderendes Forening',
      'feed': 'http://bergstud.no/feed/',
      'logo': '/org/berg/logo.png',
      'symbol': '/org/berg/symbol.png',
      'placeholder': '/org/berg/placeholder.png',
      'color': 'grey',
    },
    'delta': {
      'name': 'Delta',
      'feed': 'http://org.ntnu.no/delta/wp/?feed=rss2',
      'logo': '/org/delta/logo.png',
      'symbol': '/org/delta/symbol.png',
      'placeholder': '/org/delta/placeholder.png',
      'color': 'green',
    },
    'emil': {
      'name': 'Emil',
      'feed': 'http://emilweb.no/feed/',
      'logo': '/org/emil/logo.png',
      'symbol': '/org/emil/symbol.png',
      'placeholder': '/org/emil/placeholder.png',
      'color': 'green',
    },
    'leonardo': {
      'name': 'Leonardo',
      'feed': 'http://industrielldesign.com/feed',
      'logo': '/org/leonardo/logo.png',
      'symbol': '/org/leonardo/symbol.png',
      'placeholder': '/org/leonardo/placeholder.png',
      'color': 'cyan',
    },
    'online': {
      'name': 'Online',
      'feed': 'https://online.ntnu.no/feeds/news/',
      'logo': '/org/online/logo.png',
      'symbol': '/org/online/symbol.png',
      'placeholder': '/org/online/placeholder.png',
      'color': 'blue',
    },
    'nabla': {
      'name': 'Nabla',
      'feed': 'http://nabla.no/feed/',
      'logo': '/org/nabla/logo.png',
      'symbol': '/org/nabla/symbol.png',
      'placeholder': '/org/nabla/placeholder.png',
      'color': 'red',
    },
    'spanskrøret': {
      'name': 'Spanskrøret',
      'feed': 'http://spanskroret.no/feed/',
      'logo': '/org/spanskrøret/logo.png',
      'symbol': '/org/spanskrøret/symbol.png',
      'placeholder': '/org/spanskrøret/placeholder.png',
      'color': 'grey',
    },
    'volvox': {
      'name': 'Volvox & Alkymisten',
      'feed': 'http://org.ntnu.no/volvox/feed/',
      'logo': '/org/volvox/logo.png',
      'symbol': '/org/volvox/symbol.png',
      'placeholder': '/org/volvox/placeholder.png',
      'color': 'green',
    },

    // Linjeforeninger Dragvoll
    'dionysos': {
      'name': 'Dionysos',
      'feed': 'http://dionysosntnu.wordpress.com/feed/',
      'logo': '/org/dionysos/logo.png',
      'symbol': '/org/dionysos/symbol.png',
      'placeholder': '/org/dionysos/placeholder.png',
      'color': 'grey',
    },
    'erudio': {
      'name': 'Erudio',
      'feed': 'http://www.erudiontnu.org/?feed=rss2',
      'logo': '/org/erudio/logo.png',
      'symbol': '/org/erudio/symbol.png',
      'placeholder': '/org/erudio/placeholder.png',
      'color': 'red',
    },
    'geolf': {
      'name': 'Geolf',
      'feed': 'http://geolf.org/feed/',
      'logo': '/org/geolf/logo.png',
      'symbol': '/org/geolf/symbol.png',
      'placeholder': '/org/geolf/placeholder.png',
      'color': 'blue',
    },
    'gengangere': {
      'name': 'Gengangere',
      'feed': 'http://www.gengangere.no/feed/',
      'logo': '/org/gengangere/logo.png',
      'symbol': '/org/gengangere/symbol.png',
      'placeholder': '/org/gengangere/placeholder.png',
      'color': 'grey',
    },
    'jump cut': {
      'name': 'Jump Cut',
      'feed': 'http://jumpcutdragvoll.wordpress.com/feed/',
      'logo': '/org/jump cut/logo.png',
      'symbol': '/org/jump cut/symbol.png',
      'placeholder': '/org/jump cut/placeholder.png',
      'color': 'grey',
    },
    'ludimus': {
      'name': 'Ludimus',
      'feed': 'http://ludimus.org/feed/',
      'logo': '/org/ludimus/logo.png',
      'symbol': '/org/ludimus/symbol.png',
      'placeholder': '/org/ludimus/placeholder.png',
      'color': 'red',
    },
    'primetime': {
      'name': 'Primetime',
      'feed': 'http://www.primetime.trondheim.no/feed/',
      'logo': '/org/primetime/logo.png',
      'symbol': '/org/primetime/symbol.png',
      'placeholder': '/org/primetime/placeholder.png',
      'color': 'cyan',
    },
    'sturm und drang': {
      'name': 'Sturm Und Drang',
      'feed': 'http://www.sturm.ntnu.no/wordpress/?feed=rss2',
      'logo': '/org/sturm und drang/logo.png',
      'symbol': '/org/sturm und drang/symbol.png',
      'placeholder': '/org/sturm und drang/placeholder.png',
      'color': 'red',
    },

    // Linjeforeninger HiST/DMMH/TJSF/BI
    'fraktur': {
      'name': 'Fraktur',
      'feed': 'http://www.fraktur.no/feed/',
      'logo': '/org/fraktur/logo.png',
      'symbol': '/org/fraktur/symbol.png',
      'placeholder': '/org/fraktur/placeholder.png',
      'color': 'cyan',
    },
    'kom': {
      'name': 'KOM',
      'feed': 'http://kjemiogmaterial.wordpress.com/feed/',
      'logo': '/org/kom/logo.png',
      'symbol': '/org/kom/symbol.png',
      'placeholder': '/org/kom/placeholder.png',
      'color': 'cyan',
    },
    'logistikkstudentene': {
      'name': 'Logistikkstudentene',
      'feed': 'http://www.logistikkstudentene.no/?feed=rss2',
      'logo': '/org/logistikkstudentene/logo.png',
      'symbol': '/org/logistikkstudentene/symbol.png',
      'placeholder': '/org/logistikkstudentene/placeholder.png',
      'color': 'cyan',
    },
    'tihlde': {
      'name': 'TIHLDE',
      'feed': 'http://tihlde.org/feed/',
      'logo': '/org/tihlde/logo.png',
      'symbol': '/org/tihlde/symbol.png',
      'placeholder': '/org/tihlde/placeholder.png',
      'color': 'blue',
    },
    'tim og shænko': {
      'name': 'Tim & Shænko',
      'feed': 'http://bygging.no/feed/',
      'logo': '/org/tim og shænko/logo.png',
      'symbol': '/org/tim og shænko/symbol.png',
      'placeholder': '/org/tim og shænko/placeholder.png',
      'color': 'blue',
    },
    'tjsf': {
      'name': 'TJSF',
      'feed': 'http://tjsf.no/feed/',
      'logo': '/org/tjsf/logo.png',
      'symbol': '/org/tjsf/symbol.png',
      'placeholder': '/org/tjsf/placeholder.png',
      'color': 'grey',
    },

    // Studentmedier
    'dusken': {
      'name': 'Dusken.no',
      'feed': 'http://dusken.no/feed/',
      'logo': '/org/dusken/logo.png',
      'symbol': '/org/dusken/symbol.png',
      'placeholder': '/org/dusken/placeholder.png',
      'color': 'grå',
    },
    'universitetsavisa': {
      'name': 'Universitetsavisa',
      'feed': 'http://www.universitetsavisa.no/?service=rss',
      'logo': '/org/universitetsavisa/logo.png',
      'symbol': '/org/universitetsavisa/symbol.png',
      'placeholder': '/org/universitetsavisa/placeholder.png',
      'color': 'cyan',
    },

    // Store studentorganisasjoner
    'samfundet': {
      'name': 'Studentersamfundet',
      'feed': 'http://www.samfundet.no/arrangement/rss',
      'logo': '/org/samfundet/logo.png',
      'symbol': '/org/samfundet/symbol.png',
      'placeholder': '/org/samfundet/placeholder.png',
      'color': 'red',
    },

    // Studentdemokrati
    'velferdstinget': {
      'name': 'Velferdstinget',
      'feed': 'http://www.velferdstinget.no/feed/rss/',
      'logo': '/org/velferdstinget/logo.png',
      'symbol': '/org/velferdstinget/symbol.png',
      'placeholder': '/org/velferdstinget/placeholder.png',
      'color': 'cyan',
    },
    'studenttinget ntnu': {
      'name': 'Studenttinget NTNU',
      'feed': 'http://www.studenttinget.no/feed/',
      'logo': '/org/studenttinget ntnu/logo.png',
      'symbol': '/org/studenttinget ntnu/symbol.png',
      'placeholder': '/org/studenttinget ntnu/placeholder.png',
      'color': 'red',
    },
    'studentparlamentet hist': {
      'name': 'Studentparlamentet HiST',
      'feed': 'http://studentparlamentet.com/?feed=rss2',
      'logo': '/org/studentparlamentet hist/logo.png',
      'symbol': '/org/studentparlamentet hist/symbol.png',
      'placeholder': '/org/studentparlamentet hist/placeholder.png',
      'color': 'blue',
    },
    
    // Institusjoner
    'ntnu': {
      'name': 'NTNU',
      'feed': 'https://www.retriever-info.com/feed/2002900/generell_arkiv166/index.xml',
      'logo': '/org/ntnu/logo.png',
      'symbol': '/org/ntnu/symbol.png',
      'placeholder': '/org/ntnu/placeholder.png',
      'color': 'blue',
    },
    'rektoratet ntnu': {
      'name': 'Rektoratet NTNU',
      'feed': 'http://www.ntnu.no/blogger/rektoratet/feed/',
      'logo': '/org/rektoratet ntnu/logo.png',
      'symbol': '/org/rektoratet ntnu/symbol.png',
      'placeholder': '/org/rektoratet ntnu/placeholder.png',
      'color': 'blue',
    },
    'hist': {
      'name': 'HiST',
      'feed': 'http://hist.no/rss.ap?thisId=1393',
      'logo': '/org/hist/logo.png',
      'symbol': '/org/hist/symbol.png',
      'placeholder': '/org/hist/placeholder.png',
      'color': 'blue',
    },
    'dmmh': {
      'name': 'DMMH',
      'feed': 'http://www.dmmh.no/rss.php?type=site&id=10&location=393',
      'logo': '/org/dmmh/logo.png',
      'symbol': '/org/dmmh/symbol.png',
      'placeholder': '/org/dmmh/placeholder.png',
      'color': 'red',
    },
  },

  // How much hue must be rotated to achieve a specific color
  colors: {
    'blue':     {'-webkit-filter': 'hue-rotate(0deg)'},
    'cyan':     {'-webkit-filter': 'hue-rotate(-31deg)'},
    'pink':     {'-webkit-filter': 'hue-rotate(92deg)'},
    'red':      {'-webkit-filter': 'hue-rotate(144deg)'},
    'purple':   {'-webkit-filter': 'hue-rotate(66deg)'},
    'green':    {'-webkit-filter': 'hue-rotate(-85deg)'},
    'grey':     {'-webkit-filter': 'grayscale(1) hue-rotate(0deg)'},
    'yellow':   {'-webkit-filter': 'hue-rotate(-151deg) saturate(1.6) brightness(2.3)'},
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
    // Add each item from the feed
    $(xml).find('item').each( function() {
      if (count++ < limit) {
        var item = self.parseItem(this, feedName);
        items.push(item);
      }
    });
    // Finally add the feedName and call it back
    items.feedName = feedName;
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

  unreadCountAndNotify: function(items) {
    var unreadCount = 0;
    var maxNewsAmount = this.unreadMaxCount;
    if (items.length-1 < maxNewsAmount)
      maxNewsAmount = items.length-1;

    var linkList = []; // Helps separate new and updated

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

  getColoringStyle: function(color) {
    if (this.colors[color] != undefined) {
      return this.colors[color];
    }
    else {
      if (this.debug) console.log('ERROR: unsupported color', color);
      return colors['blue'];
    }
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
