var Cantina = {

  msg_not_open: 'Ingen publisert meny i dag',
  msg_connection_error: 'Frakoblet',
  msg_malformed_menu: 'Galt format på meny',
  DINNERDEBUG: 0, // General debugging
  DINNERTEXTDEBUG: 0, // Deep debugging of dinner texts

  // Public

  get: function (rssUrl, callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    var self = this;
    $.ajax({
      url: rssUrl, // permission to use url granted in manifest.json
      success: function(xml) {
        self.parseXml(xml, callback);
      },
    })
    .error(function(jqXHR, err) {
      callback(self.msg_connection_error + ': ' + err);
    });
  },

  // Private

  parseXml: function(xml, callback) {
    var self = this;
    try {
      // Find description tags (cantina title and dinner menus)
      var descriptions = $(xml).find("description");
      
      // If menu is missing: stop
      if (descriptions[1] == undefined) {
        callback(self.msg_not_open);
        return;
      }
      
      var fullWeekDinnerInfo = descriptions[1]['textContent'];
      
      // Throw away SiT's very excessive whitespace
      fullWeekDinnerInfo = $.trim(fullWeekDinnerInfo.replace(/[\s\n\r]+/g,' '));
      
      var today = self.whichDayIsIt();
      var dinnerForEachDay = fullWeekDinnerInfo.split('<b>');
      var todaysMenu = self.msg_not_open;
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
      if (todaysMenu == self.msg_not_open) {
        callback(self.msg_not_open);
        return;
      }
      
      self.parseTodaysMenu(todaysMenu, mondaysCantinaMenu, callback);
    }
    catch (err) {
      callback(self.msg_malformed_menu + ': ' + err);
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
        
        // Smiley-time, most likely no price information
        if (dinner.indexOf(':-)') != -1 || dinner.indexOf(':)') != -1) {
          var descriptions = dinner.split(': ');
          var dinner = descriptions[0];
          var price = (descriptions[1] == '' ? null : descriptions[1]);
          var singleDinner = new self.dinnerObject(dinner, price, indexCount);
          if (self.DINNERTEXTDEBUG) console.log('WARNING: smileytime: ' + singleDinner.text  + ' @ index ' + singleDinner.index);
          dinnerObjects.push(singleDinner);
        }

        // Find price information
        else if (dinner.indexOf(':') != -1) {
          var description = dinner.split(':')[0];
          var price = dinner.split(':')[1];

          // if both dinner and price contains a '/' there might be two dinners
          // lodged into one cell, try to separate the siamese dinners!
          if ((description.indexOf('/') != -1) && (price.indexOf('/') != -1)) {
            var descriptions = description.split('/');
            var prices = price.split('/');
            if (self.DINNERTEXTDEBUG) console.log('WARNING: multiple dinners in one cell: ' + descriptions + ', ' + prices + ', index: ' + index);
            dinnerObjects.push(new self.dinnerObject(descriptions[0], prices[0], indexCount));
            dinnerObjects.push(new self.dinnerObject(descriptions[1], prices[1], indexCount));
          }

          else {
            var singleDinner = new self.dinnerObject(description, price, indexCount);
            if (self.DINNERTEXTDEBUG) console.log(singleDinner.price + ', ' + singleDinner.text  + ', ' + singleDinner.index);
            dinnerObjects.push(singleDinner);
          }
        }
        else {
          callback(self.msg_malformed_menu);
          return;
        }
        // The dinner.index represents the current dinners index in SiT's dinner lists.
        indexCount++;
      });
      
      // Shorten dinner prices
      dinnerObjects.forEach( function(dinner) {
        if (dinner.price != null) {
          var price = dinner.price;
          // Two price classes? Choose the cheapest
          if (price.indexOf('/') != -1) {
            var price1 = price.split('/')[0].match(/\d+/g);
            var price2 = price.split('/')[1].match(/\d+/g);
            price = ( Number(price1) < Number(price2) ? price1 : price2 );
            if (self.DINNERDEBUG) console.log('Price from "'+dinner.price+'" to "'+price+'" (DUAL price)');
          }
          else {
            price = price.match(/\d+/g); // Find the number, toss the rest
            if (self.DINNERDEBUG) console.log('Price from "'+dinner.price+'" to "'+price+'"');
          }
          dinner.price = price;
        }
      });
      
      // IF no dinner info is found at all, check for unique message at monday
      // WARNING: recursion going on!
      if (dinnerObjects.length == 0 && mondaysCantinaMenu != null) {
        if (self.DINNERDEBUG) console.log('WARNING: no dinner menu found today, checking monday');
        self.parseTodaysMenu(mondaysCantinaMenu, null, callback);
        return;
      }
      // IF only one or two dinner object are found, keep them entirely
      else if (dinnerObjects.length == 1 || dinnerObjects.length == 2) {
        // in other words: do nothing!
        if (self.DINNERDEBUG) console.log('only one or two dinner menus found, let\'s keep them');
      }
      // Shorten dinner descriptions
      else {
        dinnerObjects.forEach( function(dinner) {
          var text = dinner.text;
          text = self.removePartsAfter(['.',',','(','serveres','Serveres'], text); // removed: '/'
          text = text.trim();
        
          // If current item is NOT about the buffet, continue with:
          if (text.toLowerCase().indexOf('buffet') == -1) {
            text = self.limitNumberOfWords(4, text);
            text = self.removeLastWords(['&','og','med'], text);
            text = self.shortenVeggieWarning(text);
            text = text.trim();
          }
          if (self.DINNERDEBUG) console.log('Text from: "'+dinner.text+'"\nText to: "'+text+'"');
          dinner.text = text;
        });
      }
      
      /* Uncommented because the returned list should have the same order as the list on SiTs website. */
      // // Sort dinnerobjects by price
      // if (dinnerObjects[0].price != null)
      //   dinnerObjects.sort(function(a,b){return(a.price>b.price)?1:((b.price>a.price)?-1:0);});
      
      callback(dinnerObjects);
    }
    catch (err) {
      callback(self.msg_malformed_menu);
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

  limitNumberOfWords: function(limit, text) {
    if (this.DINNERTEXTDEBUG) console.log(limit + ' :: ' + text);
    if (text.split(' ').length > limit)
      text = text.split(' ').splice(0,limit).join(' ');
    return text;
  },

  removeLastWords: function(keys, text) {
    var self = this;
    for (key in keys) {
      if (self.DINNERTEXTDEBUG) console.log(keys[key] + ' :: ' + text);
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
      if (self.DINNERTEXTDEBUG) console.log(keys[key] + ' :: ' + text);
      if (text.indexOf(keys[key]) != -1)
        text = text.split(keys[key])[0];
    }
    return text;
  },

  shortenVeggieWarning: function(text) {
    if (this.DINNERTEXTDEBUG) console.log('V :: ' + text);
    if (text.toLowerCase().indexOf('ingen vegetar') != -1 || text.toLowerCase().indexOf('ikke vegetar') != -1)
      text = text.split(' ').splice(0,2).join(' ');
    return text;
  },

  whichDayIsIt: function() {
    var dayNames=["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"];
    var today = dayNames[new Date().getDay()];
    localStorage.today = today;
    return today;
  },

}
