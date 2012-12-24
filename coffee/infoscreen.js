// Generated by CoffeeScript 1.3.3
(function() {
  var $, insertBusInfo, iteration, listDinners, ls, mainLoop, updateBus, updateCantinas, updateCoffee, updateMeetings, updateNews, updateOffice, updateServant;

  $ = jQuery;

  ls = localStorage;

  iteration = 0;

  mainLoop = function() {
    if (DEBUG) {
      console.log("\n#" + iteration);
    }
    if (iteration % UPDATE_OFFICE_INTERVAL === 0) {
      updateOffice();
    }
    if (iteration % UPDATE_MEETINGS_INTERVAL === 0) {
      updateMeetings();
    }
    if (iteration % UPDATE_COFFEE_INTERVAL === 0) {
      updateCoffee();
    }
    if (iteration % UPDATE_SERVANT_INTERVAL === 0) {
      updateServant();
    }
    if (iteration % UPDATE_NEWS_INTERVAL === 0) {
      updateNews();
    }
    if (iteration % UPDATE_BUS_INTERVAL === 0) {
      updateBus();
    }
    if (iteration % UPDATE_CANTINAS_INTERVAL === 0) {
      updateCantinas();
    }
    if (10000 < iteration) {
      iteration = 0;
    } else {
      iteration++;
    }
    return setTimeout((function() {
      return mainLoop();
    }), PAGE_LOOP);
  };

  updateOffice = function() {
    if (DEBUG) {
      console.log('updateOffice');
    }
    return Office.get(function(status, title, message) {
      if (ls.currentStatus !== status || ls.currentStatusMessage !== message) {
        $('#office img').attr('src', 'img/status-' + status + '.png');
        $('#office #subtext').html(message);
        ls.currentStatus = status;
        return ls.currentStatusMessage = message;
      }
    });
  };

  updateMeetings = function() {
    if (DEBUG) {
      console.log('updateMeetings');
    }
    return Meetings.get(function(meetings) {
      return $('#todays #meetings .content').html(meetings);
    });
  };

  updateCoffee = function() {
    if (DEBUG) {
      console.log('updateCoffee');
    }
    return Coffee.get(function(pots, age) {
      return $('#todays #coffee .content').html(pots + ' kanner i dag, tid siden sist kanne ble laget: ' + age);
    });
  };

  updateServant = function() {
    if (DEBUG) {
      console.log('updateServant');
    }
    return Servant.get(function(servant) {
      return $('#todays #servant .content').html(servant);
    });
  };

  updateNews = function() {
    var displayStories;
    if (DEBUG) {
      console.log('updateNews');
    }
    fetchFeed(function() {
      var response;
      response = ls.lastResponseData;
      if (response !== void 0) {
        return displayStories(response);
      } else {
        return $('#news').html('<div class="post"><div class="title">Nyheter</div><div class="item">Frakoblet fra online.ntnu.no</div></div>');
      }
    });
    return displayStories = function(xmlstring) {
      var $xml, idsOfLastViewed, index, items, lolRememberThis, value, whatsthis, xmldoc, _guid, _mostRecent, _results, _text;
      xmldoc = $.parseXML(xmlstring);
      $xml = $(xmldoc);
      items = $xml.find("item");
      lolRememberThis = ls.mostRecentRead;
      _guid = $(items[0]).find("guid");
      _text = $(_guid).text();
      _mostRecent = _text.split('/')[4];
      if (ls.mostRecentRead === _mostRecent) {
        return;
      }
      ls.mostRecentRead = _mostRecent;
      $('#news').html('');
      idsOfLastViewed = [];
      items.each(function(index, element) {
        var item, limit, post;
        limit = ls.noDinnerInfo === 'true' ? 4 : 3;
        if (index < limit) {
          post = parsePost(element);
          idsOfLastViewed.push(post.id);
          item = '<div class="post"><span class="read"></span>';
          item += '\
            <span class="title">' + post.title + '</span>\
            <div class="item">\
              <img id="' + post.id + '" src="' + post.image + '" width="107" />\
              <div class="textwrapper">\
                <div class="emphasized">- Skrevet av ' + post.creator + ' den ' + post.date + '</div>\
                ' + post.description + '\
              </div>\
            </div>\
          </div>';
          return $('#news').append(item);
        }
      });
      whatsthis = $('#news').html();
      whatsthis = whatsthis.trim();
      if (whatsthis === '') {
        alert('TRAP TRIGGERED!');
        console.log('TRAPPED!');
        console.log('items', typeof items, items);
        console.log('#news', $('#news').html());
        console.log('ls.mostRecentRead was', typeof lolRememberThis, lolRememberThis);
        console.log('_mostRecent is', typeof _mostRecent, _mostRecent);
      }
      _results = [];
      for (index in idsOfLastViewed) {
        value = idsOfLastViewed[index];
        _results.push(getImageUrlForId(value, function(id, image) {
          return $('#' + id).attr('src', image);
        }));
      }
      return _results;
    };
  };

  updateBus = function() {
    var amountOfLines, first_stop_name, second_stop_name;
    if (DEBUG) {
      console.log('updateBus');
    }
    if (!navigator.onLine) {
      $('#bus #first_bus .name').html(ls.first_bus_name);
      $('#bus #second_bus .name').html(ls.second_bus_name);
      $('#bus #first_bus .lines').html('<div class="line error">Frakoblet fra api.visuweb.no</div>');
      $('#bus #second_bus .lines').html('<div class="line error">Frakoblet fra api.visuweb.no</div>');
      $('#bus #first_bus .times').html('');
      return $('#bus #second_bus .times').html('');
    } else {
      first_stop_name = ls.first_bus_name;
      second_stop_name = ls.second_bus_name;
      amountOfLines = 4;
      Bus.getAnyLines(ls.first_bus, amountOfLines, function(lines) {
        return insertBusInfo(lines, first_stop_name, '#first_bus');
      });
      return Bus.getAnyLines(ls.second_bus, amountOfLines, function(lines) {
        return insertBusInfo(lines, second_stop_name, '#second_bus');
      });
    }
  };

  insertBusInfo = function(lines, stopName, cssIdentificator) {
    var busStop, i, spans, _results;
    busStop = '#bus ' + cssIdentificator;
    $(busStop + ' .name').html(stopName);
    if (typeof lines === 'string') {
      $(busStop + ' .lines').html('<div class="line error">' + lines + '</div>');
      return $(busStop + ' .times').html('');
    } else {
      if (lines['departures'].length === 0) {
        $(busStop + ' .lines').html('<div class="line error">....zzzZZZzzz....</div>');
        return $(busStop + ' .times').html('');
      } else {
        spans = ['first', 'second', 'third', 'fourth'];
        $(busStop + ' .lines').html('');
        $(busStop + ' .times').html('');
        _results = [];
        for (i in spans) {
          $(busStop + ' .lines').append('<div class="line ' + spans[i] + '">' + lines['destination'][i] + '</div>');
          _results.push($(busStop + ' .times').append('<div class="time ' + spans[i] + '">' + lines['departures'][i] + '</div>'));
        }
        return _results;
      }
    }
  };

  updateCantinas = function() {
    var hangaren_rss, realfag_rss;
    if (DEBUG) {
      console.log('updateCantinas');
    }
    hangaren_rss = 'http://sit.no/rss.ap?thisId=36444&ma=on&ti=on&on=on&to=on&fr=on';
    realfag_rss = 'http://sit.no/rss.ap?thisId=36447&ma=on&ti=on&on=on&to=on&fr=on';
    Cantina.get(hangaren_rss, function(menu) {
      return $('#cantinas #hangaren #dinnerbox').html(listDinners(menu));
    });
    return Cantina.get(realfag_rss, function(menu) {
      return $('#cantinas #realfag #dinnerbox').html(listDinners(menu));
    });
  };

  listDinners = function(menu) {
    var dinner, dinnerlist, _i, _len;
    dinnerlist = '';
    if (typeof menu === 'string') {
      ls.noDinnerInfo = 'true';
      dinnerlist += '<li>' + menu + '</li>';
    } else {
      ls.noDinnerInfo = 'false';
      for (_i = 0, _len = menu.length; _i < _len; _i++) {
        dinner = menu[_i];
        if (dinner.price !== null) {
          dinner.price = dinner.price + ',- ';
          dinnerlist += '<li id="' + dinner.index + '">' + dinner.price + dinner.text + '</li>';
        } else {
          dinnerlist += '<li class="message" id="' + dinner.index + '">- "' + dinner.text + '"</li>';
        }
      }
    }
    return dinnerlist;
  };

  $(function() {
    if (DEBUG) {
      less.watch();
      $('html').css('cursor', 'auto');
      $('#overlay').hide();
    }
    ls.removeItem('mostRecentRead');
    ls.removeItem('currentStatus');
    ls.removeItem('currentStatusMessage');
    if (OPERATING_SYSTEM === 'Windows') {
      $('#pagefliptext').attr("style", "bottom:9px;");
      $('#pagefliplink').attr("style", "bottom:9px;");
    }
    setInterval((function() {
      return $(".pageflipcursor").animate({
        opacity: 0
      }, "fast", "swing", function() {
        return $(this).animate({
          opacity: 1
        }, "fast", "swing");
      });
    }), 600);
    setInterval((function() {
      var hours, minutes, _d;
      _d = new Date();
      minutes = _d.getMinutes();
      hours = _d.getHours();
      if (minutes < 10) {
        minutes = '0' + minutes;
      }
      if (hours < 10) {
        hours = '0' + hours;
      }
      $("#bus #clock #minutes").html(minutes);
      return $("#bus #clock #hours").html(hours);
    }), 1000);
    setInterval((function() {
      var linebreaks, num, random;
      random = Math.ceil(Math.random() * 25);
      linebreaks = ((function() {
        var _i, _results;
        _results = [];
        for (num = _i = 0; 0 <= random ? _i <= random : _i >= random; num = 0 <= random ? ++_i : --_i) {
          _results.push('<br />');
        }
        return _results;
      })()).join(' ');
      $('#overlay').html(linebreaks + 'preventing image burn-in...');
      $('#overlay').css('opacity', 1);
      return setTimeout((function() {
        return $('#overlay').css('opacity', 0);
      }), 3500);
    }), 1800000);
    setInterval((function() {
      return document.location.reload();
    }), 86400000);
    return mainLoop();
  });

}).call(this);
