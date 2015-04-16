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
  debug: 0,

  // Possible values in options:
  // options = {
  //   directHit: 'img#header', // the exact image tag that needs to be matched
  //   domainUrl: 'hybrida.no', // if website uses relative links, split by this url and search for last part of the link
  //   imageIndex: 2, // if the first picture in each post is a bad fit, use the one at specified index, note that this is zero-indexed
  //   linkDelimiter: '?', // if the link contains parameter data which isn't used in the on-site link, trash the parameter data after this specified delimiter
  //   newsSelector: 'div.news_item', // if website uses uncommon selectors for news containers it must be defined here
  //   noscriptMatching: /src="(http:\/\/gfx.nrk.no\/\/[a-zA-Z0-9]+)"/ // If a noscript tag is used we'll just search the contents of the noscript tag for the image src with regex
  // };
  // get: function(affiliation, links, callback, options) {

  //   // TEMP FIX BEFORE REWRITING AFFILIATION.JS
  //   options = options || {};
  //   options.affiliation = affiliation || null;
  //   options.links = links || null;
  //   options.callback = callback || null;
  //   // END TEMPLOL

  //   var err = null;
  //   if (!options)
  //     err = 'Images: Needs parameter "options"';
  //   if (!options.affiliation)
  //     err = 'Images: Needs the affiliation parameter';
  //   if (!options.links)
  //     err = 'Images: Needs the links parameter';
  //   if (!options.callback)
  //     err = 'Images: Callback is required';
  //   if (err) {
  //     console.error('Images:', err);
  //     return;
  //   }

  //   // Figure out whether it's singular or plural
  //   if (typeof options.links === 'string') {
  //     return this._getImage(options);
  //   }
  //   else if (Array.isArray(options.links)) {
  //     return this._getImages(options);
  //   }
  //   else {
  //     console.error('Images: Must be fed one specific URL or an array or URLs, but not both');
  //     return null;
  //   }
  // },

  // _getImages: function(options) {
  //   Ajaxer.getCleanHtml({
  //     url: options.urls,
  //     success: function(html) {
  //       var results = [];
  //       for (var i = 0; i < options.urls.length; i++) {
  //         options.url = options.urls[i];
  //         _parseResult(options, html)
  //         results.push();
  //       }
  //       callback(options.urls, results);
  //     },
  //     error: function(e) {
  //       if (this.debug) console.error('Images: Could not fetch "'+affiliation.name+'" website: ' + e);
  //       callback(options.url, []);
  //     },
  //   }).bind(this);
  // },

  // _getImage: function(options) {
  //   Ajaxer.getCleanHtml({
  //     url: options.url,
  //     success: function(html) {
  //       var image = _parseResult(html);
  //       callback(options.url, image);
  //     },
  //     error: function(e) {
  //       if (this.debug) console.error('Images: Could not fetch "'+affiliation.name+'" website: ' + e);
  //       callback(options.url, []);
  //     },
  //   }).bind(this);
  // },

  // // TODO: Point of improvement: A few sites have differing selectors for
  // // news articles across different news pages. Like e.g. if one of their
  // // news pages have a regular header image and another has a slideshow.
  // // Make sure this function can check for multiple different selectors.
  // // TODO: Refactor, think of an awesome new way to organize this function.
  // _parseResult: function() {




  get: function(affiliation, links, callback, options) {
    if (affiliation == undefined) {
      console.error('Images.get needs the affiliation parameter');
      return;
    }
    if (links == undefined) {
      console.error('Images.get needs the links parameter');
      return;
    }
    if (callback == undefined) {
      console.error('Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    // TODO: Point of improvement: A few sites have differing selectors for
    // news articles across different news pages. Like e.g. if one of their
    // news pages have a regular header image and another has a slideshow.
    // Make sure this function can check for multiple different selectors.
    // TODO: Refactor, think of an awesome new way to organize this function.

    // Possible values in options:
    // options = {
    //   directHit: 'img#header', // the exact image tag that needs to be matched
    //   domainUrl: 'hybrida.no', // if website uses relative links, split by this url and search for last part of the link
    //   imageIndex: 2, // if the first picture in each post is a bad fit, use the one at specified index, note that this is zero-indexed
    //   linkDelimiter: '?', // if the link contains parameter data which isn't used in the on-site link, trash the parameter data after this specified delimiter
    //   newsSelector: 'div.news_item', // if website uses uncommon selectors for news containers it must be defined here
    //   noscriptMatching: /src="(http:\/\/gfx.nrk.no\/\/[a-zA-Z0-9]+)"/ // If a noscript tag is used we'll just search the contents of the noscript tag for the image src with regex
    // };

    // Create empty object to avoid crashes when looking up undefined props of undefined object
    if (options == undefined) {
      options = {};
    }

    // Single link?
    var url = affiliation.web;
    var isSingleLink = false;
    if (typeof links == 'string') {
      url = links;
      // If links is just a single link, convert to single item array
      links = [links];
      isSingleLink = true;
    }

    var self = this;
    Ajaxer.getCleanHtml({
      url: url,
      success: function(html) {
        try {

          // IMPORTANT:
          // jQuery tries to preload images found in the string, that is why the
          // html has had all <img> replaced by <pic> by Ajaxer.getCleanHTML
          var doc = $(html);

          // Decide which selector to use for identifying news containers
          var newsSelector = self.findNewsSelector(doc, options);

          // A place to store all the image links
          var images = [];

          for (var i in links) {

            var link = links[i];

            //
            // Find the news container which contains the news image, using our selector
            //

            var container = null;

            if (self.debug) console.log('Images: Checking for '+(isSingleLink? 'single image at' : 'news post with link'), link);

            // If posts are using relative links, split by domainUrl, like 'hist.no'
            if (options.domainUrl) {
              if (self.debug) console.log('Images: Splitting link by domain url "'+options.domainUrl+'"');
              link = links[i].split(options.domainUrl)[1];
            }

            // Trash link suffix data (found after delimiter) which is included in some news feeds for the sake of statistics and such
            if (options.linkDelimiter) {
              if (self.debug) console.log('Images: Splitting link by delimiter "'+options.linkDelimiter+'"');
              link = links[i].split(options.linkDelimiter)[0];
            }

            // Look up the first post with the link inside it...
            container = doc.find(newsSelector + ' a[href="' + link + '"]');

            // ...then find parent 'article' or 'div.post' or the like...
            if (container.length != 0) {
              if (self.debug) console.log('Images: Found something with the link, locating parent tag (the news box)');
              container = container.parents(newsSelector);
            }
            // ...unless we didn't find anything with the link, in which case we just look for the news selector
            else if (isSingleLink) {
              if (self.debug) console.log('Images: Found nothing with a[href=url], instead trying news selector "'+newsSelector+'"');
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
              options.directHit = options.directHit.replace(/^img/, 'pic');
              image = doc.find(options.directHit).attr('src');
              if (self.debug) console.log('Images: Direct hit');
            }
            else if (options.noscriptMatching) {
              // If a <noscript> tag is used, we'll just find the image URL by matching
              // NOTE: This is for very special cases only! Like NRK.no, lulz @ nrk
              image = container.html().match(options.noscriptMatching)[1];
              if (self.debug) console.log('Images: Ran noscript matching');
            }
            else {
              // First find all images within container
              image = container.find('pic');

              // Exclude all unacceptable images
              image = self.exclude(image);

              // Use image at specified index if requested
              if (options.imageIndex)
              image = image.eq(options.imageIndex);

              // Get the src for the first image left in the array
              image = image.attr('src');
            }

            //
            // Lastly we determine whether we have found an image or not, and then store the image or null
            //

            // If image is undefined
            if (typeof image == 'undefined') {
              if (self.debug) console.log('Images: No image exists for link "'+link+'"');
              image = null;
            }
            // If image needs to be prefixed with the domain name
            else if (options.domainUrl) {
              if (image.indexOf('//') == -1) {
                image = 'http://' + options.domainUrl + image;
                if (self.debug) console.log('Images: Found image (domain url added) "'+image+'"');
              }
              else {
                if (self.debug) console.log('Images: Found a good image at "'+image+'"');
              }
            }

            // If image URL contains the optional protocol operator "//", specify "http://"
            if (image !== null && image.match(/^\/\//) !== null) {
              image = image.replace(/^\/\//, 'http://');
            }
            // If image does not start with http://, https:// or at least //
            // NOTE: Must be checked after adding "http" and domainUrl
            else if (image !== null && image.match(/^(http)?s?:?\/\//) == null) {
              if (self.debug) console.log('Images: Did not find a good image at "'+link+'", all we have is "'+image+'"');
              image = null;
            }
            // If null
            else if (image === null) {
              if (self.debug) console.log('Images: Did not find a good image');
            }
            // If all is good
            else {
              if (self.debug) console.log('Images: Found a good image at "'+image+'"');
            }

            if (self.debug) console.log('Images: All done, pushing', image);

            // Store it
            images.push(image);
          }
          callback(links, images);
        }
        catch (e) {
          if (self.debug) console.error('Images: Failed at parsing "'+affiliation.name+'" website:', e);
          callback(links, []);
        }
      },
      error: function(e) {
        if (self.debug) console.error('Images: Could not fetch "'+affiliation.name+'" website:');
        callback(links, []);
      },
    });
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
    if (this.debug) console.log('Images: Controlling image url "'+imageUrl+'"');
    
    // This function is primarily used by news.js for controlling the goodness
    // of image URLs found in items that contain HTML descriptions (in RSS feeds)
    if (isEmpty(imageUrl)) {
      if (this.debug) console.error('Images.control() received empty imageUrl');
      return false;
    }

    imageUrl = imageUrl.toLowerCase();

    // Look for bad keys and return false if any are found
    var keys = [
      '.gif',             // Exclude gifs since they're most likely smilies and the likes
      'data:image/gif',   // Another way to show gifs
      '/sociable/',       // Exclude social image icons (only applies for some blogs)
      '/static/',         // Exclude static content, most likely icons
      '/comments/',       // Exclude comments, most likely text in image as "Add comment here"
    ];
    for (var i in keys) {
      var str = keys[i];
      if (imageUrl.indexOf(str) !== -1) {
        if (this.debug) console.log('Images: Image url was bad, contained "'+str);
        return false;
      }
    }

    // Look for proper formats and return false if none are used
    var formats = new RegExp('(png|jpe?g|bmp|svg)$', 'gi');
    if (imageUrl.match(formats) === null) {
      if (this.debug) console.log('Images: Image url was bad, was not a proper format');
      return false;
    }

    if (this.debug) console.log('Images: Image url deemed OK');
    // Control out
    return true;
  },
  
};
