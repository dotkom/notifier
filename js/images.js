var Images = {
  debug: 0,

  get: function(affiliation, links, callback, options) {
    if (affiliation == undefined) {
      console.log('ERROR: Images.get needs the affiliation parameter');
      return;
    }
    if (links == undefined) {
      console.log('ERROR: Images.get needs the links parameter');
      return;
    }
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    // TODO: Point of improvement: A few sites have differing selectors for
    // news articles across different news pages. Like e.g. if one of their
    // news pages have a regular header image and another has a slideshow.
    // Make sure this function can check for multiple different selectors.
    // TODO: Refactor, think of an awesome new way to organize this function.

    // Possible values in options:
    // options = {
    //   newsSelector: 'div.news_item', // if website uses uncommon selectors for news containers it must be defined here
    //   domainUrl: 'hybrida.no', // if website uses relative links, split by this url and search for last part of the link
    //   linkDelimiter: '?', // if the link contains parameter data which isn't used in the on-site link, trash the parameter data after this specified delimiter
    //   imageIndex: 2, // if the first picture in each post is a bad fit, use the one at specified index, note that this is zero-indexed
    //   noscriptMatching: /src="(http:\/\/gfx.nrk.no\/\/[a-zA-Z0-9]+)"/ // If a noscript tag is used we'll just search the contents of the noscript tag for the image src with regex
    // };

    // Create empty object to avoid crashes when looking up undefined props of undefined object
    if (options == undefined)
      options = {};

    // Single link?
    var url = affiliation.web;
    var isSingleLink = false;
    if (typeof links == 'string') {
      url = links;
      // If links is just a single link, convert to single item array
      links = [links];
      isSingleLink = true;
    }

    // Array of possible news containers sorted by estimated probabilty
    var containers = [
      'div.entry',
      'div.post', // some blogs have div.entry inside a div.post, therefore we check div.entry first
      'article', // leave <article> at the bottom of the preferred list, it's a bit misused
    ];

    var self = this;
    Ajaxer.getCleanHtml({
      url: url,
      success: function(html) {
      try {
        // jQuery tries to preload images found in the string, that is why the
        // html has had all <img> replaced by <pic> by Ajaxer.getCleanHTML
        var doc = $(html);

        //
        // Decide which selector to use for identifying news containers
        //

        var newsSelector = null;
        if (options.newsSelector) {
          newsSelector = options.newsSelector;
          if (self.debug) console.log('Images: Using selector "'+newsSelector+'" for news at "'+url+'"');
        }
        else {
          for (var i=0; i<containers.length; i++) {
            var current = containers[i];
            if (doc.find(current).length != 0) {
              newsSelector = current;
              if (self.debug) console.log('Images: Using selector "'+current+'" for news at "'+url+'"');
              break;
            }
          }
        }

        // A place to store all the image links
        var images = [];

        for (i in links) {

          //
          // Find the news container which contains the news image, using our selector
          //

          var link = links[i];

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
          var image = doc.find(newsSelector + ' a[href="' + link + '"]');

          // ...then find parent 'article' or 'div.post' or the like...
          if (image.length != 0) {
            if (self.debug) console.log('Images: Found something with the link, locating parent tag (the news box)');
            image = image.parents(newsSelector);
          }
          // ...unless we didn't find anything with the link, in which case we just look for the news selector
          else if (isSingleLink) {
            if (self.debug) console.log('Images: Found nothing with a[href=url], instead trying news selector "'+newsSelector+'"');
            // On a specific news page (not a frontpage) we can allow ourselves to search
            // more broadly if we didn't find anything while searching for the link. We'll
            // search for the newsSelector instead and assume that the first news container
            // we find contains the image we're looking for (which is highly likely based
            // on experience).
            image = doc.find(newsSelector);
          }

          //
          // Presumably we've found the news container here, now we need to find the image within it
          //

          if (options.noscriptMatching) {
            // If a <noscript> tag is used, we'll just find the image URL by matching
            // NOTE: This is for very special cases only! Like NRK.no, lulz @ nrk
            image = image.html().match(options.noscriptMatching)[1];
          }
          else {
            // Find all image tags within post
            image = image.find('pic');

            // Exclude gifs since they're most likely smilies and the likes
            image = image.not('pic[src*=".gif"]');
            image = image.not('pic[src*="data:image/gif"]');

            // Exclude social image icons (only applies for some blogs)
            image = image.not('pic[src*="sociable"]');

            // Exclude static content, most likely icons
            image = image.not('pic[src*="static"]');

            // Exclude comments, most likely text in image as "Add comment here"
            image = image.not('pic[src*="comments"]');

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

          // If images uses optional protocol "//", specify "http://"
          if (image !== null && image.match(/^\/\//) !== null) {
            image = image.replace(/^\/\//, 'http://');
          }
          // If image does not start with http://, https:// or at least //
          // NOTE: Must be checked after adding "http" and domainUrl
          else if (image !== null && image.match(/^(http)?s?:?\/\//) == null) {
            if (self.debug) console.log('Images: No good image exists for link "'+link+'", all we have is "'+image+'"');
            image = null;
          }
          // If all is good
          else {
            if (self.debug) console.log('Images: Found a good image at "'+image+'"');
          }

          if (self.debug) console.log('');

          // Store it
          images.push(image);
        }
        callback(links, images);
      }
      catch (e) {
        if (self.debug) console.log('ERROR: failed at parsing "'+affiliation.name+'" website');
          callback(links, []);
        }
      },
      error: function(e) {
        if (self.debug) console.log('ERROR: could not fetch "'+affiliation.name+'" website');
          callback(links, []);
        },
    });
  },

  control: function(imageUrl) {
    if (this.debug) console.log('Images: Controlling image url "'+imageUrl+'"');
    
    // This function is primarily used by news.js for controlling the goodness
    // of image URLs found in items that contain HTML descriptions (in RSS feeds)
    if (isEmpty(imageUrl)) {
      if (this.debug) console.log('ERROR: Images.control() received empty imageUrl');
      return false;
    }

    var keys = [
      '.gif',             // Exclude gifs since they're most likely smilies and the likes
      'data:image/gif',   // Another way to show gifs
      '/sociable/',       // Exclude social image icons (only applies for some blogs)
      '/static/',         // Exclude static content, most likely icons
      '/comments/',       // Exclude comments, most likely text in image as "Add comment here"
    ];

    // Look for keys and return false if any are found
    for (i in keys) {
      var str = keys[i];
      if (imageUrl.indexOf(str) !== -1) {
        if (this.debug) console.log('Images: Image url was bad, contained "'+str+'"\n');
        return false;
      }
    }

    if (this.debug) console.log('Images: Image url deemed OK\n');
    // Control out
    return true;
  },
  
}
