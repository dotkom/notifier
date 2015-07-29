"use strict";

popup.update = {

  all: function() {
    this.servant();
    this.meeting();
    this.coffee();
    this.cantinas();
    this.bus();
    this.affiliationNews(1);
    if (ls.showAffiliation2 === 'true')
      this.affiliationNews(2);
  },

  //
  // Update Servant
  //

  servant: function() {
    console.log('updateServant');

    if (!ls.servantString) {
      $('#todays #schedule #servant').html('- '+Affiliation.msgConnectionError);
    }
    else {
      var servantString = ls.servantString;
      $('#todays #schedule #servant').html('- '+servantString);
    }
  },

  //
  // Update Meetings
  //

  meeting: function() {
    console.log('updateMeeting');
    // This function just fetches from localstorage (updates in background)

    if (!ls.meetingString) {
      $('#todays #schedule #meetings').html(Affiliation.msgConnectionError);
    }
    else {
      var meetingString = ls.meetingString;
      var htmlMeeting = meetingString.replace(/\n/g, '<br />');

      // Online and Abakus gets the Hackerspace info as well as meetings
      if (ls.affiliationKey1.match(/online|abakus/g)) {
        Hackerspace.get(function(hackerspace) {
          $('#todays #schedule #meetings').html(htmlMeeting + '<div id="hackerspace">' + hackerspace + '</div>');
          $('#todays #schedule #meetings #hackerspace span').click(function(elem) {
            Browser.openTab(Hackerspace.web);
            window.close();
          });
        });
      }
      else {
        $('#todays #schedule #meetings').html(htmlMeeting);
      }
    }
  },

  //
  // Update Coffee
  //

  coffee: function() {
    console.log('updateCoffee');
    // This function just fetches from localstorage (updates in background)

    if (!ls.coffeePotsString || !ls.coffeeDateString) {
      $('#todays #coffee #pots').html('- ' + Coffee.msgConnectionError);
      $('#todays #coffee #age').html(Coffee.msgComforting);
    }
    else {
      var coffeePotsString = ls.coffeePotsString;
      var coffeeDateString = ls.coffeeDateString;
      $('#todays #coffee #pots').html('- ' + coffeePotsString);
      $('#todays #coffee #age').html(coffeeDateString);
    }
  },

  //
  // Update Cantina
  //

  cantinas: function() {
    console.log('updateCantinas');
    // This function just fetches from localstorage (updates in background)

    var update = function(shortname, data, selector) {
      var name = Cantina.names[shortname];
      var title = '#cantinas ' + selector + ' .title';
      var subtitle = '#cantinas ' + selector + ' .subtitle';
      var hours = '#cantinas ' + selector + ' .hours';
      var mealBox = '#cantinas ' + selector + ' .mealBox';

      // Default to dinner, be positive
      var doLunch = false;
      var noDinnerExists = false;

      // Decide whether to show lunch or dinner
      var isLunchTime = new Date().getHours() < 14;
      // Check if either lunch or dinner is empty, if so, and the other has content, show the other
      var isThereLunch = Array.isArray(data.lunch); // Otherwise just an object with a message
      var isThereDinner = Array.isArray(data.dinner); // Otherwise just an object with a message
      // So is it lunch then?
      if (isLunchTime && isThereLunch) {
        doLunch = true;
      }
      // Also, if there is a lunch menu, but no dinner menu, just show the lunch throughout, whatever the time.
      if (!isThereDinner && isThereLunch) {
        doLunch = true;
        noDinnerExists = true;
      }

      // Title: Set name of current cantina
      $(title).text(name);

      // If data is just a message
      if (typeof data === 'string') {
        $(hours).html('- ' + data);
        $(mealBox).html('');
      }
      // Otherwise data has attributes "name", "hours", "menu" and possibly "error"
      else {
        // Set hours
        $(hours).html('');
        if (data.hours && data.hours.message) {
          $(hours).html('- ' + data.hours.message);
          clickHours(hours, shortname);
        }
        // Set subtitle, lunch or dinner
        var menuTitle = (doLunch ? 'Lunsjmeny' + (noDinnerExists ? ' (ingen middag)' : '') : 'Middagsmeny');
        $(subtitle).text(menuTitle);
        // Set meals
        $(mealBox).html('');
        var meals = (doLunch ? data.lunch : data.dinner);
        if (meals) {
          for (var i in meals) {
            var meal = meals[i];
            if (meal.price !== undefined) {
              if (meal.price) {
                $(mealBox).append('<li>' + meal.price + ',- ' + meal.text + '</li>');
              }
              else {
                $(mealBox).append('<li class="message">"' + meal.text + '"</li>');
              }
            }
            else {
              $(mealBox).append('<li class="message">"' + meal + '"</li>');
            }
          }
          clickMeal(mealBox + ' li', shortname);
        }
        // Log error messages
        if (data.error) console.error(data.error);
      }
    };

    var clickHours = function(cssSelector, cantina) {
      $(cssSelector).click(function() {
        Analytics.trackEvent('clickHours', $(this).text());
        Browser.openTab(Cantina.webHours);
        window.close();
      });
    }

    var clickMeal = function(cssSelector, cantina) {
      $(cssSelector).click(function() {
        Analytics.trackEvent('clickDinner', $(this).text());
        Browser.openTab(Cantina.webDinner);
        window.close();
      });
    }

    // Load data from cantinas
    var cantina1Data = JSON.parse(ls.cantina1Data);
    var cantina2Data = JSON.parse(ls.cantina2Data);
    update(ls.cantina1, cantina1Data, '.first');
    update(ls.cantina2, cantina2Data, '.second');
  },

  //
  // Update Bus
  //

  bus: function() {
    console.log('updateBus');

    var createBusDataRequest = function(bus, cssIdentificator) {
      var activeLines = ls[bus+'ActiveLines']; // array of lines stringified with JSON (hopefully)
      // Parse self (was stored as array)
      activeLines = JSON.parse(activeLines);
      // Get bus data, if activeLines is an empty array we'll get all lines, no problemo :D
      Bus.get(ls[bus], activeLines, function(lines) {
        insertBusInfo(lines, ls[bus+'Name'], ls[bus+'Direction'], cssIdentificator);
      });
    };

    var insertBusInfo = function(lines, stopName, direction, cssIdentificator) {
      var busStop = '#bus ' + cssIdentificator;
      var spans = ['first', 'second', 'third'];

      $(busStop+' .name').html(stopName + (direction !== 'null' ? ' ' + direction : ''));

      // Reset spans
      for (var i in spans) {
        $(busStop+' .'+spans[i]+' .line').html('');
        $(busStop+' .'+spans[i]+' .time').html('');
      }
      $(busStop+' .error').html('');

      // if lines is an error message
      if (typeof lines === 'string') {
        // if online, recommend oracle
        if (navigator.onLine) {
          $(busStop+' .error').html(lines+'<br />Prøv Orakelet i stedet');
        }
        else {
          $(busStop+' .error').html(lines);
        }
      }
      else {
        // No lines to display, bus stop is sleeping
        if (lines['departures'].length === 0) {
          $(busStop+' .error').html('....zzzZZZzzz....');
        }
        else {
          // Display line for line with according times
          for (var i in spans) {
            // If there aren't any more lines left: break
            if (!lines['destination'][i] && !lines['departures'][i]) {
              break;
            }
            // Add the current line
            $(busStop+' .'+spans[i]+' .line').append(lines['destination'][i]);
            // Calculate urgency
            var urgency = Bus.calculateUrgency(lines['departures'][i]);
            var departString = '<span style="color: ' + urgency + ';">' + lines['departures'][i] + '</span>';
            $(busStop+' .'+spans[i]+' .time').append(departString);
          }
        }
      }
    };

    // Inner functions are ready, go!
    createBusDataRequest('firstBus', '#firstBus');
    createBusDataRequest('secondBus', '#secondBus');
  },

  //
  // Update Affiliation News
  //

  affiliationNews: function(number) {
    console.log('updateAffiliationNews'+number);
    // This function just fetches from localstorage (updates in background)
    number = ''+number; // stringify

    var displayItems = function(items, selector, newsListName, viewedListName, unreadCountName) {

      // Get feedkey
      var feedKey = items[0].feedKey;

      // Get list of last viewed items and check for news that are just
      // updated rather than being actual news
      var newsList = JSON.parse(ls[newsListName]);
      var viewedList = JSON.parse(ls[viewedListName]);
      var updatedList = findUpdatedPosts(newsList, viewedList);

      // Build list of last viewed for the next time the user views the news
      viewedList = [];

      // Prepare a column for our elements
      var column = $();

      // Add feed items
      $.each(items, function (index, item) {

        if (index < News.newsLimitToShow) {
          viewedList.push(item.link);

          var unreadCount = Number(ls[unreadCountName]);
          var readUnread = '';
          // if (!isFlashy) {
          //   if (index < unreadCount) {
          //     if (updatedList.indexOf(item.link) > -1) {
          //       readUnread += '<span class="unread">UPDATED <b>::</b> </span>';
          //     }
          //     else {
          //       readUnread += '<span class="unread">NEW <b>::</b> </span>';
          //     }
          //   }
          // }

          var descLimit = 140;
          if (ls.showAffiliation2 === 'true') {
            descLimit = 100;
          }
          if (item.description.length > descLimit) {
            item.description = item.description.substr(0, descLimit) + '...';
          }

          var htmlItem = '';

          if (ls.showAffiliation2 === 'true') {
            htmlItem = [
              '<article data="' + item.link + '">',
                '<img class="flashy" src="' + item.image + '" />',
                '<div class="title flashy">' + readUnread + item.title + '</div>',
                '<div class="author flashy">&ndash; Av ' + item.creator + '</div>',
              '</article>',
            ].join('\n');
          }
          else {
            htmlItem = [
              '<article data="' + item.link + '">',
                '<img class="regular" src="' + item.image + '" />',
                '<div class="title">' + readUnread + item.title + '</div>',
                item.description,
                '<br /><div class="author">&ndash; Av ' + item.creator + '</div>',
              '</article>',
            ].join('\n');
          }

          column = column.add(htmlItem);
        }
      });

      // Remove old news, add fresh news
      $('#news ' + selector + ' div.content article').remove();
      $('#news ' + selector + ' div.content').append(column);

      // Store list of last viewed items
      ls[viewedListName] = JSON.stringify(viewedList);

      // All items are now considered read
      Browser.setBadgeText('');
      ls[unreadCountName] = 0;

      // Make news items open extension website while closing popup
      $('#news '+selector+' div.content article').click(function() {
        // The link is embedded as the ID of the element, we don't want to use
        // <a> anchors because it creates an ugly box marking the focus element.
        var link = $(this).attr('data');
        Browser.openTab(link);
        Analytics.trackEvent('clickNews', link);
        window.close();
      });
    }

    // Checks the most recent list of news against the most recently viewed list of news
    var findUpdatedPosts = function(newsList, viewedList) {
      var updatedList = [];
      // Compare lists, keep your mind straight here:
      // Updated news are:
      // - saved in the newsList before the first identical item in the viewedList
      // - saved in the viewedList after the first identical item in the newsList
      for (var i in newsList) {
        if (newsList[i] === viewedList[0]) {
          break;
        }
        for (var j in viewedList) {
          if (j === 0) {
            continue;
          }
          if (newsList[i] === viewedList[j]) {
            updatedList.push(newsList[i]);
          }
        }
      }
      return updatedList;
    }

    //
    // All news functions are now defined,
    // proceed to execution!
    //

    // Get the news feed (prefetched by the background page)
    var news = ls['affiliationNews'+number];

    // Detect selector
    var selector = (number === '1' ? '#left' : '#right');
    if (ls.showAffiliation2 === 'false') {
      selector = '#full';
    }

    // Set affiliation name
    var name = Affiliation.org[ls['affiliationKey'+number]].name;
    $('#news '+selector+' .title').html(name);

    // Parse and display news
    if (typeof news !== 'undefined') {
      news = JSON.parse(news);
      displayItems(news, selector, 'affiliationNewsList'+number, 'affiliationViewedList'+number, 'affiliationUnreadCount'+number);
    }
    else {
      // Offline or unresponsive
      var key = ls['affiliationKey'+number];
      var name = Affiliation.org[key].name;
      $('#news '+selector+' div.content article').remove(); // Remove all existing articles
      $('#news '+selector+' div.content').append('<article>Frakoblet fra nyhetsstrøm</article>');
      $('#news '+selector+' div.content article').click(function() {
        // Link to affiliation website
        Browser.openTab(Affiliation.org[key].web);
      });
    }
  },

};
