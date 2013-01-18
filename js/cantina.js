var Cantina = {

  msgNotOpen: 'Ingen publisert meny i dag',
  msgConnectionError: 'Frakoblet fra sit.no',
  msgMalformedMenu: 'Galt format på meny',
  dinnerWordLimit: 4, // 4-7 is good, depends on screen size
  dinnerDebug: 0, // General debugging
  dinnerDebugText: 0, // Deep debugging of dinner strings
  dinnerDebugString: 'Seirett med ris (G): 36 kroner', // dinnerDebugText must be true
  // Required format of dinnerDebugString: "Seirett med ris (G): 36 kroner" -> "food : price"

  // Feeds
  feeds: {
    'dragvoll': 'https://www.sit.no/rss.ap?thisId=36441&ma=on&ti=on&on=on&to=on&fr=on',
    'hangaren': 'http://www.sit.no/rss.ap?thisId=36444&ma=on&ti=on&on=on&to=on&fr=on',
    'kalvskinnet': 'https://www.sit.no/rss.ap?thisId=36453&ma=on&ti=on&on=on&to=on&fr=on',
    'moholt': 'https://www.sit.no/rss.ap?thisId=36456&ma=on&ti=on&on=on&to=on&fr=on',
    'realfag': 'http://www.sit.no/rss.ap?thisId=36447&ma=on&ti=on&on=on&to=on&fr=on',
    'tyholt': 'http://www.sit.no/rss.ap?thisId=36450&ma=on&ti=on&on=on&to=on&fr=on',
  },

  // SiTs new format for ajaxing dinner:
  // NOT used, so far it's just saved here for the sake of interest
  // https://www.sit.no/ajaxdinner/get
  // POST: "diner=realfag&trigger=week"
  // dragvoll
  // hangaren
  // realfag
  // kjel
  // elektro
  // tyholt
  // kalvskinnet
  // moholt
  // dmmh
  // oya
  // rotvoll
  // ranheimsveien

  // Public

  get: function (cantina, callback) {
    if (callback === undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }
    if (this.feeds[cantina] === undefined) {
      console.log('ERROR: Unsupported/unknown cantina.');
      callback('ERROR: Unsupported/unknown cantina.');
      return;
    }

    cantina = cantina.toLowerCase();
    var rssUrl = this.feeds[cantina];

    var self = this;
    $.ajax({
      url: rssUrl, // permission to use url granted in manifest.json
      success: function(xml) {
        self.parseXml(xml, callback);
      },
      error: function(jqXHR, text, err) {
        if (DEBUG) console.log('ERROR: could not connect to api.visuweb.no');
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
        callback(self.msgNotOpen);
        return;
      }
      
      var fullWeekDinnerInfo = descriptions[1]['textContent'];
      
      // Throw away SiT's very excessive whitespace
      fullWeekDinnerInfo = $.trim(fullWeekDinnerInfo.replace(/[\s\n\r]+/g,' '));
      
      var today = self.whichDayIsIt();
      var dinnerForEachDay = fullWeekDinnerInfo.split('<b>');
      var todaysMenu = self.msgNotOpen;
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
      if (todaysMenu === self.msgNotOpen) {
        callback(self.msgNotOpen);
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

        if (self.dinnerDebugText) {
          dinner = self.dinnerDebugString;
        }
        
        // Smiley-time, most likely no price information
        if (dinner.indexOf(':-)') !== -1 || dinner.indexOf(':)') !== -1) {
          var descriptions = dinner.split(': ');
          var dinner = descriptions[0];
          var price = (descriptions[1] === '' ? null : descriptions[1]);
          var singleDinner = new self.dinnerObject(dinner, price, indexCount);
          if (self.dinnerDebugText) console.log('WARNING: smileytime: ' + singleDinner.text  + ' @ index ' + singleDinner.index);
          dinnerObjects.push(singleDinner);
        }

        // Find price information
        else if (dinner.indexOf(':') !== -1) {
          var description = dinner.split(':')[0];
          var price = dinner.split(':')[1];

          // if both dinner and price contains a '/' there might be two dinners
          // lodged into one cell, try to separate the siamese dinners!
          if ((description.indexOf('/') !== -1) && (price.indexOf('/') !== -1)) {
            var descriptions = description.split('/');
            var prices = price.split('/');
            if (self.dinnerDebugText) console.log('WARNING: multiple dinners in one cell: ' + descriptions + ', ' + prices + ', index: ' + index);
            dinnerObjects.push(new self.dinnerObject(descriptions[0], prices[0], indexCount));
            dinnerObjects.push(new self.dinnerObject(descriptions[1], prices[1], indexCount));
          }

          else {
            var singleDinner = new self.dinnerObject(description, price, indexCount);
            if (self.dinnerDebugText) console.log(singleDinner.price + ', ' + singleDinner.text  + ', ' + singleDinner.index);
            dinnerObjects.push(singleDinner);
          }
        }
        else {
          if (DEBUG) console.log('ERROR: problems during initial parsing of todays dinner');
          callback(self.msgMalformedMenu);
          return;
        }
        // The dinner.index represents the current dinners index in SiT's dinner lists.
        indexCount++;
      });
      
      // Shorten dinner prices
      dinnerObjects.forEach( function(dinner) {
        if (dinner.price !== null) {
          var price = dinner.price;
          // Two price classes? Choose the cheapest
          if (price.indexOf('/') !== -1) {
            var price1 = price.split('/')[0].match(/\d+/g);
            var price2 = price.split('/')[1].match(/\d+/g);
            price = ( Number(price1) < Number(price2) ? price1 : price2 );
            if (self.dinnerDebug) console.log('Price from "'+dinner.price+'" to "'+price+'" (DUAL price)');
          }
          else {
            price = price.match(/\d+/g); // Find the number, toss the rest
            if (self.dinnerDebug) console.log('Price from "'+dinner.price+'" to "'+price+'"');
          }
          dinner.price = price;
        }
      });
      
      // IF no dinner info is found at all, check for unique message at monday
      // WARNING: recursion going on!
      if (dinnerObjects.length === 0 && mondaysCantinaMenu !== null) {
        if (self.dinnerDebug) console.log('WARNING: no dinner menu found today, checking monday');
        self.parseTodaysMenu(mondaysCantinaMenu, null, callback);
        return;
      }
      // IF only one or two dinner object are found keep them entirely, - unless we're debugging texts
      else if ((dinnerObjects.length === 1 || dinnerObjects.length === 2) && !self.dinnerDebugText) {
        // in other words: do nothing!
        if (self.dinnerDebug) console.log('only one or two dinner menus found, let\'s keep them intact');
        // except of course for a little trimming
        dinnerObjects.forEach( function(dinner) {
          dinner.text = dinner.text.trim();
        });
      }
      // Shorten dinner descriptions
      else {
        dinnerObjects.forEach( function(dinner) {
          var text = dinner.text;

          // Unless it's a message (dinner without a price) we'll shorten it
          if (dinner.price != undefined) {
            text = self.removePartsAfter(['.','(','serveres','Serveres'], text); // don't use: '/', ','
            text = text.trim();
          
            // If current item is NOT about the buffet, continue with:
            if (text.toLowerCase().indexOf('buffet') === -1) {
              text = self.limitNumberOfWords(self.dinnerWordLimit, text);
              text = self.removeLastWords([' i',' &',' og',' med'], text);
              text = self.shortenVeggieWarning(text);
              text = text.trim();
            }
            if (self.dinnerDebug) console.log('Text from: "'+dinner.text+'"\nText to: "'+text+'"');
            dinner.text = text;
          }
          else {
            // Even messages (like " God sommer ") needs trimming
            dinner.text = text.trim();
          }
        });
      }
      
      /* Uncommented because the returned list should have the same order as the list on SiTs website. */
      // // Sort dinnerobjects by price
      // if (dinnerObjects[0].price !== null)
      //   dinnerObjects.sort(function(a,b){return(a.price>b.price)?1:((b.price>a.price)?-1:0);});
      
      callback(dinnerObjects);
    }
    catch (err) {
      if (DEBUG) console.log('ERROR: problems during deep parsing of todays dinner');
      callback(self.msgMalformedMenu);
    }
  },

  dinnerObject: function(text, price, index) {
    this.text = text;
    this.price = price;
    this.index = index;
  },

  endsWith: function(suffix, str) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  },

  limitNumberOfWords: function(limit, originalText) {
    if (this.dinnerDebugText) console.log(limit + ' :: ' + originalText);
    var text = originalText;
    if (text.split(' ').length > limit) {
      text = text.split(' ').splice(0,limit).join(' ');
      // Surprisingly accurate check to see if we're ending the sentence with a verb
      // E.g. "Gryte med wokede", "Lasagna med friterte", "Risrett med kokt"
      if (this.endsWith('te', text) || this.endsWith('de', text) || this.endsWith('kt', text))
        // In that case, return the noun as well (heighten limit by 1)
        return originalText.split(' ').splice(0,limit+1).join(' ');
    }
    return text;
  },

  removeLastWords: function(keys, text) {
    var self = this;
    for (key in keys) {
      if (self.dinnerDebugText) console.log(keys[key] + ' :: ' + text);
      if (self.endsWith(keys[key], text)) {
        var pieces = text.split(' ');
        text = pieces.splice(0,pieces.length-1).join(' ');
      }
    }
    return text;
  },

  removePartsAfter: function(keys, text) {
    var self = this;
    for (key in keys) {
      if (self.dinnerDebugText) console.log(keys[key] + ' :: ' + text);
      if (text.indexOf(keys[key]) !== -1)
        text = text.split(keys[key])[0];
    }
    return text;
  },

  shortenVeggieWarning: function(text) {
    if (this.dinnerDebugText) console.log('V :: ' + text);
    if (text.toLowerCase().indexOf('ingen vegetar') !== -1 || text.toLowerCase().indexOf('ikke vegetar') !== -1)
      text = text.split(' ').splice(0,2).join(' ');
    return text;
  },

  whichDayIsIt: function() {
    var dayNames = ["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"];
    var today = dayNames[new Date().getDay()];
    localStorage.today = today;
    return today;
  },

}
