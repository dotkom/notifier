var Cantina = {

  url: 'https://www.sit.no/middag',
  msgClosed: 'Ingen publisert meny i dag',
  msgConnectionError: 'Frakoblet fra sit.no/rss',
  msgUnsupportedCantina: 'Kantinen støttes ikke',
  msgMalformedMenu: 'Galt format på meny',
  dinnerWordLimit: 4, // 4-7 is good, depends on screen size
  
  debug: 0, // General debugging
  debugDay: 0, // Whether or not to debug a particular day
  debugThisDay: 'Fredag', // The day in question
  debugText: 0, // Whether or not to deep debug dinner strings (even in weekends)
  debugThisText: 'Vårruller. Servert med ris og salat: 1000,-', // debugText must be true
  // Expected format of debugThisText: "Seirett med ris (G): 8 kroner" -> "food: price"
  // Note1: Set the price of debugThisText low to show it first cuz the list is sorted by price

  // Feeds
  // To single out days use 'https://www.sit.no/rss.ap?thisId=36441&ma=on' - gives 'mandag' alone
  feeds: {
    'dmmh': 'https://www.sit.no/rss.ap?thisId=38798',
    'dragvoll': 'https://www.sit.no/rss.ap?thisId=36441',
    'elektro': 'https://www.sit.no/rss.ap?thisId=40227',
    'hangaren': 'https://www.sit.no/rss.ap?thisId=36444',
    'kalvskinnet': 'https://www.sit.no/rss.ap?thisId=36453',
    // 'kjelhuset': 'https://www.sit.no/rss.ap?thisId=31681', // Har aldri innhold
    'moholt': 'https://www.sit.no/rss.ap?thisId=36456',
    // 'mtfs': '...', // Mangler
    'ranheimsveien': 'https://www.sit.no/rss.ap?thisId=38753',
    'realfag': 'https://www.sit.no/rss.ap?thisId=36447',
    'rotvoll': 'https://www.sit.no/rss.ap?thisId=38910',
    'tyholt': 'https://www.sit.no/rss.ap?thisId=36450',
    // 'øya': '...', // Mangler
  },

  // SiTs new format for ajaxing dinner:
  // NOT used, we use RSS instead, so far this is just saved here for the sake of interest
  // https://www.sit.no/ajaxdinner/get
  // POST: "diner=realfag&trigger=week"
  // diner = "dragvoll | hangaren | realfag | kjel | elektro | tyholt
  //    | kalvskinnet | moholt | dmmh | oya | rotvoll | ranheimsveien"

  // Public

  get: function (cantina, callback) {
    if (callback === undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }
    if (this.feeds[cantina] === undefined) {
      if (this.debug) console.log('ERROR: '+this.msgUnsupportedCantina);
      callback('');
      return;
    }

    cantina = cantina.toLowerCase();
    var rssUrl = this.feeds[cantina];

    var self = this;
    Ajaxer.getXml({
      url: rssUrl,
      success: function(xml) {
        self.parseXml(xml, callback);
      },
      error: function(jqXHR, text, err) {
        if (DEBUG) console.log('ERROR: '+self.msgConnectionError);
        callback(self.msgConnectionError);
      },
    })
  },

  // Private

  parseXml: function(xml, callback) {
    var self = this;
    try {
      // Find description tags (cantina title and dinner menus)
      var descriptions = $(xml).find("description");
      
      // If menu is missing: stop
      if (descriptions[1] === undefined) {
        callback(self.msgClosed);
        return;
      }
      
      var fullWeekDinnerInfo = descriptions[1]['textContent'];
      
      // Throw away SiT's very excessive whitespace
      fullWeekDinnerInfo = $.trim(fullWeekDinnerInfo.replace(/[\s\n\r]+/g,' '));
      
      var today = self.whichDayIsIt();
      if (self.debugDay)
        today = self.debugThisDay;
      var dinnerForEachDay = fullWeekDinnerInfo.split('<b>');
      var todaysMenu = self.msgClosed;
      var mondaysCantinaMenu = '';
      for (dinnerDay in dinnerForEachDay) {
        // Find todays dinner menu
        if (dinnerForEachDay[dinnerDay].lastIndexOf(today, 0) === 0)
          todaysMenu = dinnerForEachDay[dinnerDay];
        // Mondays menu is kept in case it contains a lonely message
        if (dinnerForEachDay[dinnerDay].lastIndexOf('Mandag', 0) === 0)
          mondaysCantinaMenu = dinnerForEachDay[dinnerDay];
      }
      // If no dinners for today were found (saturday / sunday)
      if (todaysMenu === self.msgClosed && !self.debugText) {
        callback(self.msgClosed);
        return;
      }
      
      self.parseTodaysMenu(todaysMenu, mondaysCantinaMenu, callback);
    }
    catch (err) {
      if (DEBUG) console.log('ERROR: problems during parsing of dinner xml');
      callback(self.msgMalformedMenu + ': ' + err);
    }
  },

  parseTodaysMenu: function(todaysMenu, mondaysCantinaMenu, callback) {
    var self = this;
    try {
      var dinnerList = todaysMenu.split('<br>');

      // Remove empty or irrelevant information (items: first, last, second last)
      dinnerList = dinnerList.splice(1,dinnerList.length-3);

      // Separate dinner and price
      var dinnerObjects = [];
      var indexCount = 0;
      dinnerList.forEach( function(dinner) {

        if (self.debugText && indexCount === 0) {
          dinner = self.debugThisText;
        }
        
        if (dinner.indexOf(': ') !== -1) {
          var description = dinner.substring(0, dinner.lastIndexOf(': '));
          var price = dinner.substring(dinner.lastIndexOf(': ') + 2);

          // If both dinner and price contains a '/' there might be two dinners
          // Lodged into one cell, try to separate the siamese dinners!
          if ((description.indexOf('/') !== -1) && (price.indexOf('/') !== -1)) {
            var descriptions = description.split('/');
            var prices = price.split('/');
            if (self.debugText) console.log('WARNING: multiple dinners in one cell: ' + descriptions + ', ' + prices + ', index: ' + index);
            dinnerObjects.push(new self.dinnerObject(descriptions[0], prices[0], indexCount));
            dinnerObjects.push(new self.dinnerObject(descriptions[1], prices[1], indexCount));
          }

          else {
            var singleDinner = new self.dinnerObject(description, price, indexCount);
            if (self.debug) console.log(singleDinner.price + ', ' + singleDinner.text  + ', ' + singleDinner.index);
            dinnerObjects.push(singleDinner);
          }
        }
        else {
          if (DEBUG) console.log('ERROR: problems during initial parsing of todays dinner');
          callback(self.msgMalformedMenu);
          return;
        }
        // The dinner.index represents the current dinners index in SiT's RSS feeds
        indexCount++;
      });
      
      // Shorten dinner prices
      dinnerObjects.forEach( function(dinner) {
        if (dinner.price !== null) {
          var price = dinner.price;
          
          price = price.replace(/((,|[.])00)/g, ''); // Remove 'øre' if shown
          price = price.trim();

          // Two price classes? Choose the cheapest
          if (price.match(/ |\//) != null) { // Split by space or slash
            // Find delimiter
            var delimiter = '/'; // Assume split by slash
            if (price.indexOf(' ') !== -1)
              delimiter = ' '; // Use split by space instead
            // Split and compare prices
            var price1 = price.split(delimiter)[0].match(/\d+/g);
            var price2 = price.split(delimiter)[1].match(/\d+/g);
            price = ( Number(price1) < Number(price2) ? price1 : price2 );
            if (self.debug) console.log('Price from "'+dinner.price+'" to "'+price+'" (DUAL price)');
          }
          else {
            price = price.match(/\d+/g);
            if (price == null) {
              price = NaN;
            }
            if (self.debug) console.log('Price from "'+dinner.price+'" to "'+price+'"');
          }
          dinner.price = price;
        }
      });
      
      // If no dinner info is found at all, check for unique message at monday
      if (dinnerObjects.length === 0) {
        if (self.debug) console.log('WARNING: no dinner menu found today, checking monday');
        if (mondaysCantinaMenu !== null) {
          // WARNING: recursion is divine!
          self.parseTodaysMenu(mondaysCantinaMenu, null, callback);
        }
        else {
          if (self.debug) console.log('WARNING: no info found on monday either');
          callback(this.msgClosed);
        }
        return;
      }

      // Prettify dinner descriptions, this is where the real magic happens
      dinnerObjects.forEach( function(dinner) {
        var text = dinner.text;

        // Extract any food flags first
        dinner.flags = self.getFoodFlags(text);
        // If it's a message (dinner without a price) we'll just trim it
        if (dinner.price == null) {
          // Even messages (like " God sommer ") needs trimming
          text = text.trim();
        }
        else {
          text = self.removeFoodFlags(text);
          text = self.addMissingSpaces(text);
          text = self.shortenFoodServedWith(text);
          text = self.shortenFoodWithATasteOf(text);
          text = self.expandAbbreviations(text);
          text = self.removeFoodHomeMade(text);
          text = self.removePartsAfter(['.','('], text); // don't use: '/', ','
          text = text.trim();
          // If current item is NOT about the buffet, continue with:
          if (text.toLowerCase().indexOf('buffet') === -1) {
            text = self.limitNumberOfWords(self.dinnerWordLimit, text);
            text = self.removeLastWords([' i',' &',' og',' med', ' m'], text);
            text = self.removePunctuationAtEndOfLine(text);
            text = self.shortenVeggieWarning(text);
            text = text.trim();
          }
        }
        if (self.debug) console.log('\nFrom\t"'+dinner.text+'"\nTo\t\t"'+text+'"\n');
        // Add flags
        if (dinner.flags !== null)
          text += ' ' + dinner.flags;
        // Save
        dinner.text = text;
      });
      
      // Turn prices into Number vars and sort dinnerobjects by price
      if (dinnerObjects[0].price !== null) {
        dinnerObjects.sort(function(a,b){
          a.price = Number(a.price);
          b.price = Number(b.price);
          return(a.price>b.price)?1:((b.price>a.price)?-1:0);
        });
      }
      
      // Check for NaN-prices and set to question mark
      dinnerObjects.forEach( function(dinner) {
        if (dinner.price != null) {
          if (isNaN(dinner.price)) {
            dinner.price = '??';
          }
        }
      });
      
      callback(dinnerObjects);
    }
    catch (err) {
      if (DEBUG) console.log('ERROR: problems during deep parsing of todays dinners');
      callback(self.msgMalformedMenu);
    }
  },

  // The actual Dinner object

  dinnerObject: function(text, price, index) {
    this.text = text;
    this.price = price;
    this.index = index;
    this.flags = null;
  },

  // Welcome to the department of simple functions, HELLO!

  endsWith: function(suffix, str) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1; // Faster than regex matching
  },

  whichDayIsIt: function() {
    var dayNames = ["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"];
    var today = dayNames[new Date().getDay()];
    return today;
  },

  // Welcome to the department of key removal, how may we help you?

  removePartsAfter: function(keys, text) {
    var self = this;
    for (key in keys) {
      if (self.debugText) console.log(keys[key] + (keys[key].length<4?'\t\t':'\t') + ':: ' + text);
      if (text.indexOf(keys[key]) !== -1)
        text = text.split(keys[key])[0];
    }
    return text;
  },

  removeLastWords: function(keys, text) {
    var self = this;
    for (key in keys) {
      if (self.debugText) console.log(keys[key] + (keys[key].length<4?'\t\t':'\t') + ':: ' + text);
      if (self.endsWith(keys[key], text)) {
        var pieces = text.split(' ');
        text = pieces.splice(0,pieces.length-1).join(' ');
      }
    }
    return text;
  },

  // Welcome to the department of regular expressions, how may we (help|do) you\?

  getFoodFlags: function(text) {
    var matches = text.match(/\b[VGL]+(?![æøåÆØÅ])\b/g);
    return (matches !== null ? '(' + matches.join('') + ')' : null);
    // TODO: Both getFoodFlags and removeFoodFlags suffer from a lacking implementation
    // of the regex flag 'word boundary'. Add the flag /i to both and make sure they
    // can handle æøåÆØÅ on both sides of food flags, especially in words like
    // Vårruller, Blomkål, etc. For now these functions rely on the fact that flags
    // are always shown in uppercase.
  },

  removeFoodFlags: function(text) {
    if (this.debugText) console.log('Flags\t:: ' + text);
    // Removes food flags like V,G,L in all known forms. Seriously. All known forms. Don't.
    return text.replace(/([,;&(.\/]*\b[VGL]+(?![æøåÆØÅ])\b[,;&).\s]*)+/g, '');
    // return text.replace(/([,;&\(\/\.]*\b[VGL]+(?![æøåÆØÅ])\b[,;&\s\)\.]*)+/g, '');
    // NOTE: æøåÆØÅ is wrongly matched as word boundary, bug report has been submitted to
    // the Chromium team. A case sensitive fix is implemented via negative lookahead.
    // UPDATE from yangguo@chromium.org: "Unfortunately, this is specified by ECMA-262,
    // 15.10.2.6 (Assertion). \b essentially depends on the definition of IsWordChar,
    // which basically covers [a-zA-Z0-9_]. Unicode is not considered here." ..dammit.
    // REPORT: https://code.google.com/p/chromium/issues/detail?id=223360
  },

  addMissingSpaces: function(text) {
    if (this.debugText) console.log('Spaces\t:: ' + text);
    // Add spaces where missing, like "smør,brød,sopp" to "smør, brød, sopp"
    return text.replace(/([a-zA-Z0-9æøåÆØÅ])(,)([a-zA-Z0-9æøåÆØÅ])/gi, '$1, $3');
  },

  shortenFoodServedWith: function(text) {
    if (this.debugText) console.log('Served\t:: ' + text);
    // Replace wordings like 'servert med' to just 'med'
    return text.replace(/[,|\.]?\s?(ser(e)?ver\w*(t|es)?)?\s?med\s/gi, ' med ');
  },

  shortenFoodWithATasteOf: function(text) {
    if (this.debugText) console.log('TasteOf\t:: ' + text);
    // Replace wordings like 'med en liten smak av' to just 'med'
    return text.replace(/[,|\.]?\s?(med)?\s?(en|et)?\s?(liten?)?\s?(smak|hint|dæsj|tøtsj)\s?(av)?\s/gi, ' med ');
  },

  expandAbbreviations: function(text) {
    if (this.debugText) console.log('Abbrev.\t:: ' + text);
    // Replace wordings like 'm', 'm/' with the actual word, make sure there is one space on either side of the word
    return text.replace(/((\b|[æøåÆØÅ]*)\S|\S(\b|[æøåÆØÅ]*)) ?\/?m(\/| |\b|[æøåÆØÅ]) ?/gi, '$1 med ');
  },

  removeFoodHomeMade: function(text) {
    if (this.debugText) console.log('Home\t:: ' + text);
    // Replace wordings like 'Hjemmelagde kjøttkaker' to just 'Kjøttkaker'
    text = text.replace(/^\s?hjemmelag(et|de)\s/gi, '');
    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  removePunctuationAtEndOfLine: function(text) {
    if (this.debugText) console.log(',;.-\t:: ' + text);
    // Removing use of punctuation at EOL in lists, like: "39,- Pasta bolognaise."
    return text.replace(/[,;.-]$/gm, '');
  },

  shortenVeggieWarning: function(text) {
    if (this.debugText) console.log('Vegwarn\t:: ' + text);
    // Shortening "Ingen vegetar i dag" to "Ingen vegetar"
    if (text.match(/^(ingen|ikke) vegetar/i) != null)
      text = text.split(' ').splice(0,2).join(' ');
    return text;
  },

  limitNumberOfWords: function(limit, originalText) {
    if (this.debugText) console.log(limit + '\t\t:: ' + originalText);
    var text = originalText;
    if (text.split(' ').length > limit) {
      text = text.split(' ').splice(0,limit).join(' ');
      // Surprisingly accurate check to see if we're ending the sentence with a verb
      // E.g. "Gryte med wokede", "Lasagna med friterte", "Risrett med kokt", "Pølse med hjemmelaget"
      if (text.match(/(te|de|kt|laget)$/))
        // In that case, return the expected noun as well (heighten limit by 1)
        return originalText.split(' ').splice(0,limit+1).join(' ');
    }
    return text;
  },

}
