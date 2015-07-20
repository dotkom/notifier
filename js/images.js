"use strict";

// Don't panic.
// We're either parsing one page with several images (a frontpage),
// or several pages with one image on each (article pages).

// The whole process explained simply:
// 1. Find a worthy CSS selector
// 2. Use selector to find worthy container
// 3. Use container to find worthy image
// 4. Scrutinise image, try to kill it
// 5. Good image? Add domain URL, add HTTP, ++

var Images = {
  debug: 1,

  // Possible values in options:
  // options = {
  //   directHit: 'img#header',       // the exact image tag that needs to be matched
  //   domainUrl: 'hybrida.no',       // if website uses relative links, split by this url and search for last part of the link
  //   imageIndex: 2,                 // if the first picture in each post is a bad fit, use the one at specified index, note that this is zero-indexed
  //   linkDelimiter: '?',            // if the link contains parameter data which isn't used in the on-site link, trash the parameter data after this specified delimiter
  //   newsSelector: 'div.news_item', // if website uses uncommon selectors for news containers it must be defined here
  //   noscriptMatching: /src="(http:\/\/gfx.nrk.no\/\/[a-zA-Z0-9]+)"/    // If a noscript tag is used we'll just search the contents of the noscript tag for the image src with regex
  // };

  // TODO: Point of improvement: A few sites have differing selectors for
  // news articles across different news pages. Like e.g. if one of their
  // news pages have a regular header image and another has a slideshow.
  // Make sure this function can check for multiple different selectors.

  get: function(posts, affiliation, callback) {
    if (posts === undefined || affiliation === undefined || callback === undefined) {
      console.error('Required argument is missing');
      return;
    }

    // TODO: Point of improvement: A few sites have differing selectors for
    // news articles across different news pages. Like e.g. if one of their
    // news pages have a regular header image and another has a slideshow.
    // Make sure this function can check for multiple different selectors.
    // TODO: Refactor, think of an awesome new way to organize this function.

    // Fetching from articles or frontpage?
    var options = affiliation.news.imageFetching;

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

    // When all articles have returned as promised, scrape each one for a nice image
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

  parseForImages: function(html, post, affiliation) {
  // parseForImages: function(html, posts, affiliation) {

    // Create empty object to avoid crashes when looking up undefined props of undefined object
    var options = affiliation.news.imageFetching || {};

    // IMPORTANT:
    // jQuery tries to preload images found in the string, that is why
    // Ajaxer.getCleanHtml has replaced all <img> tags with <pic> tags
    var doc = $(html);

    // Decide which selector to use for identifying news containers
    var newsSelector = this.findNewsSelector(doc, options);

    // for (var i in posts) {

      var link = post.link;

      //
      // Simplify link
      //

      // If posts are using relative links, split by domainUrl, like 'hist.no'
      if (options.domainUrl) {
        if (this.debug) console.log('Images: Splitting link by domain url "'+options.domainUrl+'"');
        link = link.split(options.domainUrl)[1];
      }
      // Trash link suffix data (found after delimiter) which is included in some news feeds for the sake of statistics and such
      if (options.linkDelimiter) {
        if (this.debug) console.log('Images: Splitting link by delimiter "'+options.linkDelimiter+'"');
        link = link.split(options.linkDelimiter)[0];
      }

      //
      // Find the news container which contains the news image, using our selector
      //

      var container = null;

      if (this.debug) console.log('Images: Checking for news post with link', link);

      // Look up the first post with the link inside it...
      container = doc.find(newsSelector + ' a[href="' + link + '"]');

      // ...then find parent 'article' or 'div.post' or the like...
      if (container.length != 0) {
        if (this.debug) console.log('Images: Found something with the link, locating parent tag (likely the news box)');
        container = container.parents(newsSelector);
      }
      // ...unless we didn't find anything with the link, in which case we just look for the news selector
      else {
      // else if (isSingleLink) {
        if (this.debug) console.log('Images: Found nothing with a[href=url], instead trying news selector "'+newsSelector+'"');
        // On a specific news page (not a frontpage) we can allow ourselves to search
        // more broadly if we didn't find anything while searching for the link. We'll
        // search for the newsSelector instead and assume that the first news container
        // we find contains the image we're looking for (which is highly likely based
        // on experience).
        container = doc.find(newsSelector);
      }

      //
      // Presumably we've found the news container here, now we need to find the image within it
      //

      var image = null;

      if (options.directHit) {
        options.directHit = options.directHit.replace(/(^|\s)img/g, '$1pic');
        image = doc.find(options.directHit).attr('src');
        if (this.debug) console.log('Images: Direct hit');
      }
      else if (options.noscriptMatching) {
        // If a <noscript> tag is used, we'll just find the image URL by matching
        // NOTE: This is for very special cases only! Like NRK.no, lulz @ nrk
        image = container.html().match(options.noscriptMatching)[1];
        if (this.debug) console.log('Images: Ran noscript matching');
      }
      else {
        // First find all images within container
        image = container.find('pic');
        // Exclude all unacceptable images
        image = this.exclude(image);
        // Use image at specified index if requested
        if (options.imageIndex) image = image.eq(options.imageIndex);
        // Get the src for the first image left in the array
        image = image.attr('src');
      }

      //
      // Lastly we determine whether we have found an image or not, and then store the image or null
      //

      // If image is undefined
      if (typeof image == 'undefined') {
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
      // posts[i].image = image;
      post.image = image;
    // }
    console.log('');

    return post;
    // return posts;
    // callback(posts);
  },

  findNewsSelector: function(doc, options) {
    // Array of possible news containers sorted by estimated probabilty
    var containers = [
      'div.entry',
      'div.post', // some blogs have div.entry inside a div.post, therefore we check div.entry first
      'article', // leave <article> at the bottom of the preferred list, it's a bit misused out there in the wild
    ];
    if (options.newsSelector) {
      if (this.debug) console.log('Images: Using _specified_ selector "' + options.newsSelector + '" for news at "'+options.url+'"');
      return options.newsSelector;
    }
    else {
      for (var i = 0; i < containers.length; i++) {
        var newsSelector = containers[i];
        if (doc.find(newsSelector).length != 0) {
          if (this.debug) console.log('Images: Using typical selector "' + newsSelector + '" for news at "' + options.url + '"');
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
