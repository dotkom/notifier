"use strict";

// Don't panic.
// We're either parsing one page with several images (a frontpage),
// or several pages with one image on each (article pages).

// The whole process explained simply:
// 1. Find a worthy CSS selector
// 2. Use selector to find worthy DOM container
// 3. Use DOM container to find worthy image
// 4. Scrutinise image, try to kill it
// 5. Good image? Add domain URL, add HTTP, ++

var Images = {

  debug: 0,
  // Images whose URL contains these keys will be excluded automatically
  excludeKeys: [
    'avatar',           // Exclude any avatars
    '.gif',             // Exclude gifs since they're most likely smilies and the likes
    'data:image/gif',   // Exclude gifs in this form as well
    '/comments/',       // Exclude comments, most likely text as image like "Add comment here"
    '/buttons/',        // Exclude button images
    'share',            // Exclude any presumed share buttons
    '/smilies/',        // Exclude smiley images
    '/sociable/',       // Exclude social image icons (only applies for some blogs)
    '/static/',         // Exclude static content, most likely icons
  ],

  get: function(posts, affiliation, callback) {
    if (posts === undefined || affiliation === undefined || callback === undefined) {
      console.error('Required argument is missing');
      return;
    }

    var self = this;

    // Fetch all articles asynchronously
    var promises = [];
    for (var i in posts) {
      var promise = Ajaxer.getCleanHtml({
        url: posts[i].link,
        success: function() {}, // Using promises, see below
        error: function(e) {
          console.error('Images: Could not fetch "' + affiliation.name + '" link because of "' + e.statusText + '":', posts[i].link);
        },
      });
      promises.push(promise);
    }

    // When all articles are fetched, as promised, scrape each one for a nice image
    $.when.apply($, promises).then(function() {
      var html = null;
      // Worst case: No arguments :(
      if (isEmpty(arguments) || typeof arguments !== 'object' || arguments.length === 0) {
        if (self.debug) console.warn('Images: No links received, I bet News.js was unable to find any news posts for this affiliation:', affiliation.name);
      }
      // Better case: Single article
      else if (typeof arguments['0'] === 'string' && arguments['0'].indexOf('<html') !== -1) {
        html = arguments['0'];
        posts[0].image = self.scrapeForImage(html, posts[0], affiliation);
      }
      // Best case: Multiple articles
      else if (typeof arguments['0']['0'] === 'string' && arguments['0']['0'].indexOf('<html') !== -1) {
        for (var i in arguments) {
          html = arguments[i]['0'];
          posts[i].image = self.scrapeForImage(html, posts[i], affiliation);
        }
      }
      // Unknown arguments
      else {
        if (self.debug) console.error('Images: Unidentified pattern for arguments', arguments);
      }
      callback(posts);
    }, function(e) {
      console.error('Fetching of articles for image parsing has failed');
      callback(posts);
    });
  },

  // Possible options for image scraping:
  // options = {
  //   directHit: 'img#header',       // if we have an exact image tag to use
  //   domainUrl: 'hybrida.no',       // if website uses relative links, split by this url and search for last part of the link
  //   imageIndex: 2,                 // if the first picture in each news post is a bad fit, use the one at specified index, note that this is zero-indexed
  //   newsSelector: 'div.news_item', // if website uses uncommon selectors for news containers it must be defined here
  //   noscriptMatching: /src="(http:\/\/gfx.nrk.no\/\/[a-zA-Z0-9]+)"/
  //                                  // If a noscript tag is used we'll just search the contents of the noscript tag for the image src with regex
  // };
  scrapeForImage: function(html, post, affiliation) {
    // Get those options for image scraping
    var options = affiliation.news.imageScraping || {};
    
    // Give us some space, there will be lots of logging
    if (this.debug) console.log('');

    // If someone is using this function, but already have a good image, we'll just tell them
    if (!isEmpty(post.image) && this.control(post.image)) {
      console.log('Images: You already have a good image', post.image);
      return post.image;
    }

    //
    // Wrap HTML to traverse with jQuery.
    // All <img> tags are replaced with <pic> to avoid jQuery's automatic preloading of all the images.
    //

    var doc = $(html);

    //
    // Now, to start looking for the image
    //

    var image = null;

    // Try direct hit first, usually the fastest and best option
    if (options.directHit) {
      options.directHit = options.directHit.replace(/(^|\s)img/g, '$1pic');
      image = doc.find(options.directHit).attr('src');
      if (this.debug) console.log('Images: Direct hit resulted in', image);
    }

    // Try noscriptmatching
    if (!this.control(image)) {
      if (options.noscriptMatching) {
        // If a <noscript> tag is used, we'll just find the image URL by matching
        // NOTE: This is for very special cases only! Like NRK.no, lulz @ nrk
        image = html.match(options.noscriptMatching)[1];
        if (this.debug) console.log('Images: Noscript matching resulted in', image);
      }
    }

    // Try finding the container that has the news article, and search through it
    if (!this.control(image)) {
      var newsSelector = this.findBestNewsSelector(doc, affiliation);
      if (newsSelector !== null) {
        if (this.debug) console.log('Images: Trying news selector "'+newsSelector+'"');
        var container = doc.find(newsSelector);
        var imgArray = container.find('pic'); // First find all images within container
        imgArray = this.excludeBadImages(imgArray); // Exclude all unacceptable images
        if (options.imageIndex) imgArray = imgArray.eq(options.imageIndex); // Use image at specified index if requested
        image = imgArray.attr('src'); // Get the src for the first image left in the array
        if (this.debug) console.log('Images: Container searching resulted in', image, (image ? '- hope that helps' : '- useless'));
      }
      else {
        if (this.debug) console.log('Images: Found no good news selectors');
      }
    }

    //
    // Now we have probably found something that resembles an image URL, but if we did, is the URL good enough?
    //
    
    // Did we find anything at all?
    if (isEmpty(image)) {
      if (this.debug) console.log('Images: No image exists for link "' + post.link + '"');
      return affiliation.placeholder;
    }

    // We found something, does it need to be prefixed with the domain name?
    if (options.domainUrl) {
      if (image.indexOf('//') === -1) {
        image = 'http://' + options.domainUrl + image;
        if (this.debug) console.log('Images: Added domain URL');
      }
      else {
        if (this.debug) console.warn('Images: Domain URL was specified as an option, but the image link already had a domain name. Either we overkilled it, or they used an image from another domain.');
      }
    }

    // If image URL contains the optional protocol operator "//", specify "http://"
    if (image.match(/^\/\//) !== null) {
      image = image.replace(/^\/\//, 'http://');
      if (this.debug) console.log('Images: Optional protocol operator "//" replaced by "http://"');
    }

    // If the image URL does not start with a protocol at this point, it's no good for us
    if (image.match(/^(http)?s?:?\/\//) === null) {
      if (this.debug) console.log('Images: Did not find a good image at "' + post.link + '", all we have is "' + image + '"');
      return affiliation.placeholder;
    }

    if (this.debug) console.log('Images: All done, pushing', image);

    // Store it
    return image;
  },

  findBestNewsSelector: function(doc, affiliation) {
    // Get those options for image scraping
    var options = affiliation.news.imageScraping || {};
    // Array of possible news containers sorted by experience based probabilty
    var containers = [
      'div.entry',
      'div.post', // some blogs have div.entry inside a div.post, therefore we check div.entry first
      'article', // leave <article> at the bottom of the preferred list, it's a bit misused out there in the wild
    ];
    if (options.newsSelector) {
      if (this.debug) console.log('Images: Using _specified_ selector "' + options.newsSelector + '" for news at "' + affiliation.web + '"');
      return options.newsSelector;
    }
    else {
      for (var i = 0; i < containers.length; i++) {
        var newsSelector = containers[i];
        if (doc.find(newsSelector).length !== 0) {
          if (this.debug) console.log('Images: Using typical selector "' + newsSelector + '" for news at "' + affiliation.web + '"');
          return newsSelector;
        }
      }
    }
    return null;
  },

  excludeBadImages: function(images) {
    for (var i in this.excludeKeys) {
      var prevLength = images.length;
      images = images.not('pic[src*="' + this.excludeKeys[i] + '"]');
      if (images.length !== prevLength) {
        if (self.debug) console.log('Images: Some images were excluded while searching for bad key', this.excludeKeys[i]);
      }
    }
    return images;
  },

  control: function(imageUrl) {
    // This function is used both internally here in images.js, and in by news.js

    // Is it empty?
    if (isEmpty(imageUrl)) {
      return false;
    }

    // Before checking keys, go lowercase (remember that we are not returning this URL anyway)
    imageUrl = imageUrl.toLowerCase();

    // Look for a valid protocol, and return false if none are used
    if (imageUrl.match(/^https?:\/\//) === null) {
      return false;
    }

    // Look for bad keys and return false if any are found
    for (var i in this.excludeKeys) {
      var str = this.excludeKeys[i];
      if (imageUrl.indexOf(str) !== -1) {
        if (this.debug) console.warn('Images: Control found bad URL, contained "' + str + '"');
        return false;
      }
    }

    // Look for proper image formats and return false if none are used
    var formats = /(png|jpe?g|bmp|svg)(\?.*)?$/gi;
    if (imageUrl.match(formats) === null) {
      if (this.debug) console.warn('Images: Control found bad URL, was not a proper image format', imageUrl);
      return false;
    }

    // Control out
    return true;
  },

};
