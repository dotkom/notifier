var News = {
  debug: 0,
  newsMinLimit: 1,
  newsMaxLimit: 15,
  unreadMaxCount: 3, // 0-indexed like the list it its counting, actually +1
  msgNewsLimit: 'Nyhetsantall må være et tall mellom '+this.newsMinLimit+' og '+this.newsMaxLimit,
  msgConnectionError: 'Frakoblet fra feeden til ',
  msgUnsupportedFeed: 'Feeden støttes ikke',
  msgCallbackRequired: 'Callback er påkrevd, legg resultatene inn i DOMen',
  msgNoNewsSource: 'Ingen nyhetskilde funnet for valgt tilhørightet',
  msgNoTitle: 'Uten tittel',
  msgNoDescription: 'Uten tekst',

  // Get is called by background.html periodically, with News.unreadCount as
  // callback. Fetchfeed is also called by popup.html when requested, but
  // without the callback as we already know the amount of unread posts.
  get: function(affiliationObject, limit, callback) {
    if (typeof affiliationObject == 'undefined') {
      if (this.debug) console.log('ERROR:', this.msgUnsupportedFeed);
      return;
    }
    if (!isNumber(limit) || (limit < 1 && 20 < limit)) {
      if (this.debug) console.log('ERROR:', this.msgNewsLimit);
      return;
    }
    if (typeof callback == 'undefined') {
      if (this.debug) console.log('ERROR:', this.msgCallbackRequired);
      return;
    }

    var self = this;
    // Get news the regular way (RSS or Atom feeds)
    if (typeof affiliationObject.feed != 'undefined') {
      Ajaxer.getXml({
        url: affiliationObject.feed,
        success: function(xml) {
          self.parseFeed(xml, affiliationObject, limit, callback);
        },
        error: function(jqXHR, text, err) {
          // Check for XML sent with HTML headers
          if (jqXHR.status == 200 && jqXHR.responseText.match(/^\<\?xml/) != null) {
            xml = jqXHR.responseText;
            self.parseFeed(xml, affiliationObject, limit, callback);
          }
          else {
            if (self.debug) console.log('ERROR:', self.msgConnectionError, affiliationObject.name);
            callback(self.msgConnectionError + affiliationObject.name);
          }
        },
      });
    }
    // Get news the irregular way, through a getNews function defined in the affiliation object
    else if (typeof affiliationObject.getNews != 'undefined') {
      affiliationObject.getNews(limit, function(posts) {
        for (i in posts) {
          posts[i] = self.postProcess(posts[i]);
        }
        callback(posts);
      });
    }
    else {
      console.log('ERROR:', self.msgNoNewsSource);
    }
  },

  // Need to know about the news feeds used in Online Notifier:
  // These RSS fields are always used:
  // - title
  // - link
  // - desc - often wrapped in <![CDATA[content here]]>
  // These RSS fields are sometimes used:
  // - guid - usually the same as link
  // - pubDate
  // - category
  // - dc:creator - author name or username
  // - enclosure - may contain an image as an XML attribute: url="news_post_image.jpg"
  // - source
  // In Atom feeds, these are the usual fields:
  // - id - a useless ID
  // - published - the publishing date, must be parsed
  // - updated - the updated date, must be parsed
  // - title
  // - content - is the full entry as HTML
  // - link[rel="self"] - is this entry in XML format, useless
  // - link[rel="alternate"] - is the entry as text/html, good!
  // - author -> name
  parseFeed: function(xml, affiliationObject, limit, callback) {
    var posts = [];
    var self = this;
    var count = 0;
    // Add each item from RSS feed
    if ($(xml).find('item').length != 0) {
      $(xml).find('item').each( function() {
        if (count++ < limit) {
          var item = self.parseRssItem(this, affiliationObject);
          posts.push(item);
        }
      });
    }
    // Add each item from Atom feed
    else if ($(xml).find('entry').length != 0) {
      $(xml).find('entry').each( function() {
        if (count++ < limit) {
          var entry = self.parseAtomEntry(this, affiliationObject);
          posts.push(entry);
        }
      });
    }
    else {
      if (this.debug) console.log('ERROR: Unknown feed type, neither RSS nor Atom');
    }
    callback(posts);
  },

  parseRssItem: function(item, affiliationObject) {
    var post = {};
    post = this.preProcess(post, affiliationObject);

    // - "If I've seen RSS feeds with multiple title fields in one item? Why, yes, yes I have."

    // Title field

    post.title = $(item).find("title").filter(':first').text();
    post.title = this.stripCdata(item, 'title', post.title);

    // Link field

    post.link = $(item).find("link").filter(':first').text();
    if (post.link.trim() == '') {
      // If link field is broken by jQuery (dammit moon moon)
      // then check GUID field for a link instead (e.g. Adressa)
      var guid = $(item).find('guid').filter(':first').text();
      if (guid.indexOf('http') != -1) {
        post.link = guid;
      }
    }

    // Description field

    post.description = $(item).find("description").filter(':first').html();
    if (typeof post.description == 'undefined')
      post.description = $(item).find("description").filter(':first').text();
    post.description = this.stripCdata(item, 'description', post.description);

    // Creator field

    post.creator = $(item).find("dc\\:creator").filter(':first').text();
    if (post.creator == '') {
      // In case browser does not grok tags with colons, stupid browser
      post.creator = $(item).find("creator").filter(':first').text();
    }
    if (post.creator == '') {
      // Check for author in rarely used <author> field
      // - Universitetsavisa and Adressa uses this
      var author = $(item).find("author").filter(':first').text();
      if (author != '') {
        author = author.trim();
        var pieces = author.match(/[a-zA-Z0-9æøåÆØÅ\.\- ]+/g);
        if (pieces != null) {
          post.creator = pieces[pieces.length-1];
        }
      }
    }
    
    // Date field

    post.date = $(item).find("pubDate").filter(':first').text().substr(5, 11);
    
    // Image field

    // Check for image in rarely used tags <enclosure> and <bilde>
    try {
      // Universitetsavisa/Adressa does this little trick to get images in their feed
      var enclosure = $(item).find('enclosure').filter(':first');
      if (enclosure.length != 0) {
        post.image = enclosure['0'].attributes.url.textContent;
      }
      // Gemini uses this rather blunt hack to put images in their feed
      var bilde = $(item).find('bilde');
      if (bilde.length != 0) {
        post.image = bilde['0'].textContent;
      }
    }
    catch (err) {
      // Do nothing, we were just checking, move along quitely
    }

    // All done! Next please.

    post = this.postProcess(post, affiliationObject);
    return post;
  },

  parseAtomEntry: function(entry, affiliationObject) {
    var post = {};
    post = this.preProcess(post, affiliationObject);

    post.title = $(entry).find("title").filter(':first').text();
    post.link = $(entry).find("link[rel='alternate'][type='text/html']").filter(':first').attr('href');
    post.description = $(entry).find("content").filter(':first').text();
    post.creator = $(entry).find("author name").filter(':first').text();
    post.date = $(entry).find("published").filter(':first').text().substr(5, 11);

    // Parse date field
    post.date = new Date(post.date);
    if (post.date != "Invalid Date")
      post.date = post.date.toDateString();
    else
      post.date = null;

    post = this.postProcess(post, affiliationObject);
    return post;
  },

  // Applies for both RSS and ATOM feeds
  preProcess: function(post, affiliationObject) {
    // Tag the posts with the key, name and placeholder image of the feed they came from
    post.feedKey = affiliationObject.key;
    post.feedName = affiliationObject.name;
    post.image = affiliationObject.placeholder;
    return post;
  },

  // Applies for both RSS and ATOM feeds
  postProcess: function(post, affiliationObject) {

    // Title field

    post.title = this.treatTextField(post.title, this.msgNoTitle);

    // Link field

    // Sometimes we would like to link directly to a link in the news description,
    // this can help users avoid one step while navigating to links via Notifier
    post.altLink = this.checkDescriptionForAltLink(post.description);

    // Description field

    post.description = this.treatTextField(post.description, this.msgNoDescription);

    // Remove HTML from description (must be done AFTER checking for CDATA tags)
    post.description = post.description.replace(/<[^>]*>/g, ''); // Tags
    // post.description = post.description.replace(/&(#\d+|\w+);/g, ''); // Entities, this works, but ppl should be allowed to use entitites

    // Creator field

    // Didn't find a creator, set the feedname as creator
    if (post.creator.length == 0)
      post.creator = post.feedName;
    // Capitalize creator name either way
    post.creator = post.creator.capitalize();
    // Abbreviate long creator names
    if (post.creator != affiliationObject.name)
      post.creator = this.abbreviateName(post.creator);

    // Date field

    // In case pubDate didn't exist, set to null
    if (post.date == '')
      post.date = null;

    // Image field

    // If we haven't found a good image, scour the description for an alternative
    if (post.image == affiliationObject.placeholder)
      post.image = this.checkDescriptionForImageLink(post.image, post.description);

    return post;
  },

  refreshNewsList: function(items) {
    var freshList = [];
    items.forEach(function(item, index) {
      freshList.push(item.link);
    });
    return JSON.stringify(freshList);
  },

  countNewsAndNotify: function(items, newsList, lastNotifiedName) {
    var unreadCount = 0;
    var maxNewsAmount = this.unreadMaxCount;
    if (items.length-1 < maxNewsAmount)
      maxNewsAmount = items.length-1;

    // Count feed items
    var self = this;
    for (var i=0; i<items.length; i++) {
      
      var item = items[i];
      var link = item.link;
      
      // Counting...
      if (newsList.indexOf(link) === -1) {
        unreadCount++;
        // Send a desktop notification about the first new item
        if (unreadCount == 1) {
          if (localStorage[lastNotifiedName] != link) {
            localStorage[lastNotifiedName] = item.link;
            self.showNotification(item);
          }
        }
      }
      // All counted :)
      else {
        if (unreadCount == 0) {
          if (self.debug) console.log('no new posts');
          return 0;
        }
        else if (maxNewsAmount <= unreadCount) {
          if (self.debug) console.log(maxNewsAmount + '+ unread posts');
          return maxNewsAmount + 1;
        }
        else {
          if (self.debug) console.log('1-' + (maxNewsAmount - 1) + ' unread posts');
          return unreadCount;
        }
      }

      // Stop counting if unread number is greater than maxNewsAmount
      if ((maxNewsAmount - 1) < i) { // Remember i is counting 0
        if (self.debug) console.log((maxNewsAmount + 1) + ' unread posts (stopped counting)');
        return maxNewsAmount + 1;
      }
    };

    // We'll usually not end up here
    if (items.length == 0) {
      if (this.debug) console.log('no items to count!');
    }
    else {
      if (this.debug) console.log('ERROR: something went wrong trying to count these items:', items);
    }
    return 0;
  },

  showNotification: function(item) {
    // Demo mode
    if (typeof item == 'undefined') {
      var key = localStorage.affiliationKey1;
      item = {
        title: Affiliation.org[key].name + ' Notifier',
        description: 'Slik ser et nyhetsvarsel ut.\n"Testing.. 1.. 2.. 3.. *BLASTOFF!*"',
        link: Affiliation.org[key].web,
        feedKey: key,
      }
      // Need to run it by the background process because the event listeners are there
      Browser.getBackgroundProcess().Browser.createNotification(item);
    }
    // Normal mode
    else {
      var showIt = function() {
        if (typeof item != 'undefined') {
          if (localStorage.showNotifications == 'true') {

            // Save timestamp
            localStorage.lastNotifiedTime = new Date().getTime();

            // If the organization has an image API, use it
            if (typeof Affiliation.org[item.feedKey].getImage != 'undefined') {
              Affiliation.org[item.feedKey].getImage(item.link, function(link, image) {
                item.image = image[0];
                // Show desktop notification
                Browser.createNotification(item);
              });
            }
            else if (typeof Affiliation.org[item.feedKey].getImages != 'undefined') {
              var links = [];
              links.push(item.link);
              Affiliation.org[item.feedKey].getImages(links, function(links, images) {
                item.image = images[0];
                // Show desktop notification
                Browser.createNotification(item);
              });
            }
            else {
              // Show desktop notification
              Browser.createNotification(item);
            }
          }
        }
        else {
          if (this.debug) console.log('ERROR: notification item was undefined');
        }
      }
      // Make sure notifications are sent with at least 10 seconds inbetween
      var showTime = 0;
      if (!DEBUG) {
        var lastTime = localStorage.lastNotifiedTime;
        if (isNumber(lastTime)) {
          var diff = new Date().getTime() - lastTime;
          if (diff < 10000) { // less than 10 seconds?
            showTime = 10000;
          }
        }
      }
      setTimeout(showIt, showTime);
    }
  },

  stripCdata: function(item, tagName, postField) {
    // If feed uses CDATA-tags in title and description we need to be more clever
    // to get the information we want outta there (e.g. Adressa)
    if (postField.trim() == '' || postField.match('CDATA') != null) {
      var string = $(item).find(tagName).filter(':first')['0']['innerHTML'];
      if (typeof string != 'undefined') {
        string = string.replace(/(\<|&lt;)?!(\-\-)?\[CDATA\[/g, '');
        string = string.replace(/\]\](\-\-)?(\>|&gt;)?/g, '');
        return string;
      }
    }
    return postField;
  },

  treatTextField: function(postField, onEmptyText) {
    // Remove meta information from description, within curly brackets {}
    postField = postField.replace(/\{.*\}/gi,'');
    // Shorten 'bedriftspresentasjon' to 'bedpres'
    postField = postField.replace(/edrift(s)?presentasjon/gi, 'edpres');
    // Trimming
    postField = postField.trim();
    // Empty field?
    if (postField == '')
      postField = ifEmptyText;
    return postField;
  },

  checkDescriptionForImageLink: function(oldImage, description) {
    var regex = new RegExp('src="(http[^"]*(png|jpe?g|bmp))"');
    var pieces = description.match(regex);
    if (pieces != null)
      return pieces[1];
    else
      return oldImage;
  },

  checkDescriptionForAltLink: function(description) {
    // Looking for alternative link, find the first and best full link
    if (typeof description != 'undefined') {
      var altLink = description.match(/href="(http[^"]*)"/);
      if (altLink != null) {
        if (typeof altLink[1] == 'string') {
          return altLink[1];
        }
      }
    }
    else {
      if (this.debug) console.log('ERROR: checking for alternative link in undefined var post.description');
    }
    return null;
  },

  abbreviateName: function(oldName) {
    if (typeof oldName != 'undefined') {
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
