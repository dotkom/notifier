"use strict";

var Ajaxer = {
  debug: 0,

  // Ajax setup for all requests, this snippet is added
  // to jQuery setup at the end of this file
  ajaxSetup: {
    beforeSend: function (request, fields) {
      if (fields.type === 'GET') {
        request.setRequestHeader('From', 'https://github.com/appKom/notifier');
      }
      return true;
    },
  },

  // Format of params:
  // params = {
  //   url: 'http://api.lol.com',
  //   data: {sth: 'something', lol: 'laugh out LOUD'}, // Only use if you want a POST request
  //   success: function(data) {
  //     // Do something wth data
  //   },
  //   error: function(jqXHR, text, err) {
  //     // console.log "something, something, error"
  //   },
  // }

  getPlainText: function(params) {
    params.dataType = 'text';
    return this.get(params);
  },

  getJson: function(params) {
    params.dataType = 'json';
    return this.get(params);
  },

  getXml: function(params) {
    params.dataType = 'xml';
    return this.get(params);
  },

  getHtml: function(params) {
    params.dataType = 'html';
    var html = this.get(params);
    html = html.trim(); // jQuery 1.9+ does not consider pages starting with a newline as HTML, first char should be "<"
    return html;
  },

  getCleanHtml: function(params) {
    params.dataType = 'html';
    params.dataFilter = Ajaxer.cleanHtml;
    return this.get(params);
  },

  get: function(params) {
    if (params === undefined) {
      console.error('Params is required. Check ajaxer.js to see format of params.');
      return;
    }
    if (params.url === undefined) {
      console.error('URL missing from params.');
      return;
    }
    if (params.dataType === undefined) {
      console.error('Do not use Ajaxer.get() directly, use Ajaxer.getXml(), Ajaxer.getJson() or one of the others instead.');
      return;
    }
    if (params.success === undefined) {
      console.error('Params is missing success function. The success function should use the results for something useful.');
      return;
    }
    if (params.error === undefined) {
      console.error('Params is missing error function. Error handling must be in place.');
      return;
    }

    if (params.url.indexOf(API_SERVER_1) !== -1) {
      // Expect fast response from primary API server...
      // ...to fall back quickly to secondary API server
      params.timeout = 3000;
    }

    var ajax = function(params) {
      return $.ajax({
        type: (params.data ? 'POST' : 'GET'),
        data: (params.data ? params.data : ''),
        url: params.url,
        timeout: params.timeout || 10000,
        dataFilter: params.dataFilter,
        dataType: params.dataType,
        success: params.success,
        error: function(err) {
          if (params.url.indexOf(API_SERVER_1) !== -1) {
            if (Ajaxer.debug) console.warn('Ajaxer: Falling back to secondary API server');
            params.url = params.url.replace(API_SERVER_1, API_SERVER_2);
            params.timeout = 20000; // Assume slow network, be patient
            ajax(params);
          }
          else {
            params.error(err);
          }
        },
      });
    }

    return ajax(params); // Returns the promise that is given by $.ajax
  },

  cleanHtml: function(html, type) {
    var size = html.length;

    html = Ajaxer.cleaner(html);

    // If no more tags were stripped by cleaning one more time.
    if (Ajaxer.cleaner(html) === html) {
      if (Ajaxer.debug) console.log('Ajaxer cleaned HTML, from', size, 'to', html.length);
      return html;
    }
    // More tags were found, most likely nested html (malicious).
    else {
      if (Ajaxer.debug) console.warn('Ajaxer detected malicious html.');
      return '';
    }
  },

  // IMPORTANT: This function replaces all <img> tags with <pic>
  cleaner: function(html) {

    // Remove head, links, metas, scripts, iframes, frames, framesets
    html = html.replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '');
    html = html.replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '');
    html = html.replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, '');
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    html = html.replace(/<frame\b[^<]*(?:(?!<\/frame>)<[^<]*)*<\/frame>/gi, '');
    html = html.replace(/<frameset\b[^<]*(?:(?!<\/frameset>)<[^<]*)*<\/frameset>/gi, '');

    // Remove audio, video, object, canvas, applet, embed
    html = html.replace(/<audio\b[^<]*(?:(?!<\/audio>)<[^<]*)*<\/audio>/gi, '');
    html = html.replace(/<video\b[^<]*(?:(?!<\/video>)<[^<]*)*<\/video>/gi, '');
    html = html.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
    html = html.replace(/<canvas\b[^<]*(?:(?!<\/canvas>)<[^<]*)*<\/canvas>/gi, '');
    html = html.replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '');
    html = html.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');

    // Remove inline scripts
    html = html.replace(/on\w+\s*?=\s*?("[^"]*"|'[^']*')/gi, '');
    // If any inline scripts didn't use enclosing quotes, turn them into harmless titles
    html = html.replace(/on\w+\s*?=/gi, 'title='); // Note: a bit greedy, but won't cause anything but lulz

    // Rename <img> tags to <pic> tags to prevent jQuery from trying to fetch all images.
    // jQuerys behavior is not too problematic, but has some security concerns, also it
    // will most definitely slow down any slow computer running Notifier.
    // When parsing for images, we will just look for the <pic> tags.
    html = html.replace(/<[\s]*?img/gi, '<pic');
    html = html.replace(/<[\s]*?\/[\s]*?img/gi, '</pic');

    // jQuery 1.9+ does not consider pages starting with a newline as HTML, first char should be "<"
    html = html.trim();

    return html;
  },
};

// Applying Ajax setup
$.ajaxSetup(Ajaxer.ajaxSetup);
