var Images = {
  debug: 1,

  get: function(affiliation, links, callback, options) {

    // Return with stacktrace if links is undefined
    if (links == undefined) {
      if (this.debug) console.log('ERROR: no image links, var links is undefined');
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
    
    // In case we don't find any images, prepare an array with placeholders
    var placeholder = affiliation.placeholder;
    var placeholders = [];
    for (var i=0; i<links.length; i++)
      placeholders.push(placeholder);

    // If jQuery or Ajaxer.js is not loaded yet, just return placeholders.
    // This could occur with like one in a million probability, but like almost everything else it's handled.
    if (typeof $ == 'undefined' || typeof Ajaxer == 'undefined') {
      if (this.debug) console.log('ERROR: getImages called before $ and Ajaxer was ready');
      return placeholders;
    }

    var self = this;
    Ajaxer.getCleanHtml({
      url: url,
      success: function(html) {
      try {
        // jQuery 1.9+ does not consider pages starting with a newline as HTML, first char should be "<"
        html = $.trim(html);
        // jQuery tries to preload images found in the string, the following line causes errors, ignore it for now
        var doc = $(html);

        //
        // Decide which selector to use for identifying news containers
        //

        var newsSelector = null;
        if (options.newsSelector) {
        newsSelector = options.newsSelector;
        if (self.debug) console.log('Using selector', '"'+newsSelector+'" for news at '+url+'\n');
        }
        else {
        for (var i=0; i<containers.length; i++) {
          var current = containers[i];
          if (doc.find(current).length != 0) {
          newsSelector = current;
          if (self.debug) console.log('Using selector', '"'+current+'" for news at '+url+'\n');
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

        if (self.debug) console.log('Checking for '+(isSingleLink? 'image at' : 'posts with link'), link);

        // If posts are using relative links, split by domainUrl, like 'hist.no'
        if (options.domainUrl) {
          if (self.debug) console.log('Splitting link by domain url', options.domainUrl);
          link = links[i].split(options.domainUrl)[1];
        }

        // Trash link suffix data (found after delimiter) which is included in some news feeds for the sake of statistics and such
        if (options.linkDelimiter) {
          if (self.debug) console.log('Splitting link by delimiter', options.linkDelimiter);
          link = links[i].split(options.linkDelimiter)[0];
        }

        // Look up the first post with the link inside it...
        var image = doc.find(newsSelector + ' a[href="' + link + '"]');

        // ...then find parent 'article' or 'div.post' or the like...
        if (image.length != 0) {
          if (self.debug) console.log('Found something with the link, finding the parent (the news box');
          image = image.parents(newsSelector);
        }
        // ...unless we didn't find anything with the link, in which case we just look for the news selector
        else if (isSingleLink) {
          if (self.debug) console.log('Found nothing with a[href=url], trying news selector instead');
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
        // Here we determine whether we have found an image or not, and callback the image or a placeholder
        //

        // If image is undefined
        if (typeof image == 'undefined') {
          if (self.debug) console.log('No image exists for link', link);
          image = placeholder;
        }
        // If image needs to be prefixed with the domain name
        else if (options.domainUrl) {
          image = 'http://' + options.domainUrl + image;
          if (self.debug) console.log('Found a good image at', image);
        }
        // If image is something useless like "//assets.pinterest.com/whatever.png"
        // NOTE: Must be done after adding "http" and domainUrl
        else if (image.match('^https?://') == null) {
          if (self.debug) console.log('No good image exists for link', link);
          image = placeholder;
        }
        // If all is good
        else {
          if (self.debug) console.log('Found a good image at', image);
        }
        if (self.debug) console.log('\n');

        images.push(image);
        }
        callback(links, images);
      }
      catch (e) {
        if (self.debug) console.log('ERROR: could not parse '+affiliation.name+' website');
        callback(links, placeholders);
      }
      },
      error: function(e) {
      if (self.debug) console.log('ERROR: could not fetch '+affiliation.name+' website');
      callback(links, placeholders);
      },
    });
  },

  control: function(imageUrl) {
    if (isEmpty(imageUrl)) {
      if (this.debug) console.log('ERROR: Images.control received empty imageUrl');
      return false;
    }
    // Exclude gifs since they're most likely smilies and the likes
    if (imageUrl.indexOf('.gif') != -1) return false;
    if (imageUrl.indexOf('data:image/gif') != -1) return false;
    // Exclude social image icons (only applies for some blogs)
    if (imageUrl.indexOf('sociable') != -1) return false;
    // Exclude static content, most likely icons
    if (imageUrl.indexOf('static') != -1) return false;
    // Exclude comments, most likely text in image as "Add comment here"
    if (imageUrl.indexOf('comments') != -1) return false;
    // Control out
    return true;
  },
  
}
