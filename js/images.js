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
  debug: 1,

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
          console.error('Images: Could not fetch "' + affiliation.name + '" website:');
        },
      });
      promises.push(promise);
    }

    // When all articles are fetched, as promised, scrape each one for a nice image
    $.when.apply($, promises).then(function() {
      for (var i in arguments) {
        var html = arguments[i][0];
        posts[i] = self.parseForImages(html, posts[i], affiliation);
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

  // TODO: Purge linkDelimiter
  //   linkDelimiter: '?',            // if the link contains parameter data which isn't used in the on-site link, trash the parameter data after this specified delimiter

  //   newsSelector: 'div.news_item', // if website uses uncommon selectors for news containers it must be defined here
  //   noscriptMatching: /src="(http:\/\/gfx.nrk.no\/\/[a-zA-Z0-9]+)"/
  //                                  // If a noscript tag is used we'll just search the contents of the noscript tag for the image src with regex
  // };
  parseForImages: function(html, post, affiliation) {
    // Get those options for image scraping
    var options = affiliation.news.imageScraping || {};

    //
    // Wrap HTML to traverse with jQuery.
    // All <img> tags are replaced with <pic> to avoid jQuery's automatic preloading of all the images.
    //

    var doc = $(html);

    //
    // Find the news container which contains the news image, using our selector.
    // We'll search for the newsSelector and assume that the first news container
    // we find contains the image we're looking for, which is highly likely based
    // on experience.
    //

    var newsSelector = this.findBestNewsSelector(doc, affiliation);
    if (this.debug) console.log('Images: Trying news selector "'+newsSelector+'"');
    var container = doc.find(newsSelector);

    //
    // Presumably we've found the news container here, now we need to find the image within it
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
        image = container.html().match(options.noscriptMatching)[1];
        if (this.debug) console.log('Images: Noscript matching resulted in', image);
      }
    }

    // Try searching the container
    if (!this.control(image)) {
      image = container.find('pic'); // First find all images within container
      image = this.exclude(image); // Exclude all unacceptable images      
      if (options.imageIndex) image = image.eq(options.imageIndex); // Use image at specified index if requested
      image = image.attr('src'); // Get the src for the first image left in the array
    }

    //
    // Lastly we determine whether we have found an image or not, and then store the image or null
    //

    // If image is undefined
    if (!this.control(image)) {
      if (this.debug) console.log('Images: No image exists for link "'+link+'"');
      image = null;
    }
    // If image needs to be prefixed with the domain name
    else if (options.domainUrl) {
      if (image.indexOf('//') == -1) {
        image = 'http://' + options.domainUrl + image;
        if (this.debug) console.log('Images: Found image (domain url added) "'+image+'"');
      }
      else {
        if (this.debug) console.log('Images: Found a good image at "'+image+'"');
      }
    }

    // If image URL contains the optional protocol operator "//", specify "http://"
    if (image !== null && image.match(/^\/\//) !== null) {
      image = image.replace(/^\/\//, 'http://');
    }
    // If image does not start with http://, https:// or at least //
    // NOTE: Must be checked after adding "http" and domainUrl
    else if (image !== null && image.match(/^(http)?s?:?\/\//) == null) {
      if (this.debug) console.log('Images: Did not find a good image at "'+link+'", all we have is "'+image+'"');
      image = null;
    }
    // If null
    else if (image === null) {
      if (this.debug) console.log('Images: Did not find a good image');
    }
    // If all is good
    else {
      if (this.debug) console.log('Images: Found a good image at "'+image+'"');
    }

    if (this.debug) console.log('Images: All done, pushing', image);

    // // Store it
    post.image = image;

    console.log('');

    return post;
  },

  findBestNewsSelector: function(doc, options, affiliation) {
    // Get those options for image scraping
    var options = affiliation.news.imageScraping || {};
    // Array of possible news containers sorted by experience based probabilty
    var containers = [
      'div.entry',
      'div.post', // some blogs have div.entry inside a div.post, therefore we check div.entry first
      'article', // leave <article> at the bottom of the preferred list, it's a bit misused out there in the wild
    ];
    if (options.newsSelector) {
      if (this.debug) console.log('Images: Using _specified_ selector "' + options.newsSelector + '" for news at "' + affiliation.url + '"');
      return options.newsSelector;
    }
    else {
      for (var i = 0; i < containers.length; i++) {
        var newsSelector = containers[i];
        if (doc.find(newsSelector).length !== 0) {
          if (this.debug) console.log('Images: Using typical selector "' + newsSelector + '" for news at "' + affiliation.url + '"');
          return newsSelector;
        }
      }
    }
  },

  exclude: function(images) {
    // Exclude gifs since they're most likely smilies and the likes
    images = images.not('pic[src*=".gif"]');
    images = images.not('pic[src*="data:image/gif"]');
    // Exclude social image icons on some blogs
    images = images.not('pic[src*="/sociable/"]');
    // Exclude static content, most likely icons
    images = images.not('pic[src*="/static/"]');
    // Exclude comments, most likely text in images like "Add comment here"
    images = images.not('pic[src*="/comments/"]');
    return images;
  },

  control: function(imageUrl) {
    if (this.debug) console.log('Images: Controlling image URL "'+imageUrl+'"');

    // This function is primarily used by news.js for controlling the goodness of
    // image URLs found in items that contain HTML descriptions (in RSS/Atom feeds)

    if (isEmpty(imageUrl)) {
      if (this.debug) console.error('Images.control() received empty imageUrl');
      return false;
    }

    // Before checking keys, go lowercase (remember that we are not returning this URL anyway)
    imageUrl = imageUrl.toLowerCase();

    // Look for bad keys and return false if any are found
    var keys = [
      'avatar',           // Exclude any avatars
      '.gif',             // Exclude gifs since they're most likely smilies and the likes
      'data:image/gif',   // Exclude gifs in this form as well
      '/sociable/',       // Exclude social image icons (only applies for some blogs)
      '/static/',         // Exclude static content, most likely icons
      '/comments/',       // Exclude comments, most likely text in image as "Add comment here"
    ];
    for (var i in keys) {
      var str = keys[i];
      if (imageUrl.indexOf(str) !== -1) {
        if (this.debug) console.warn('Images: Image URL was bad, contained "' + str + '"');
        return false;
      }
    }

    // Look for proper formats and return false if none are used
    var formats = new RegExp('(png|jpe?g|bmp|svg)$', 'gi');
    if (imageUrl.match(formats) === null) {
      if (this.debug) console.warn('Images: Image URL was bad, was not a proper format');
      return false;
    }

    if (this.debug) console.info('Images: Image URL deemed OK');
    // Control out
    return true;
  },

};
