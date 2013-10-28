Ajaxer = {
  debug: 0,
  mobileApi: 'index.php',

  // Format of params:
  // params = {
  //   url: 'http://api.lol.com',
  //   data: {sth: 'something', lol: 'laugh out LOUD'}, // Only use if you want a POST request
  //   success: function(data) {
  //     // Do something wth data
  //   },
  //   error: function(jqXHR, text, err) {
  //     // if DEBUG then console.log "something, something, error"
  //   },
  // }

  getPlainText: function(params) {
    params.dataType = 'text';
    this.get(params);
  },

  getJson: function(params) {
    params.dataType = 'json';
    this.get(params);
  },

  getXml: function(params) {
    params.dataType = 'xml';
    this.get(params);
  },

  getHtml: function(params) {
    params.dataType = 'html';
    this.get(params);
  },

  getCleanHtml: function(params) {
    params.dataType = 'html';
    params.dataFilter = Ajaxer.cleanHtml;
    this.get(params);
  },

  get: function(params) {
    if (params == undefined) {
      console.log('ERROR: Params is required. Check ajaxer.js to see format of params.');
      return;
    }
    if (params.url == undefined) {
      console.log('ERROR: URL missing from params.');
      return;
    }
    if (params.dataType == undefined) {
      console.log('ERROR: Do not use Ajaxer.get() directly, use getXml, getJson or one of the others instead.');
      return;
    }
    if (params.success == undefined) {
     console.log('ERROR: Params is missing success function. The success function should use the results for something useful.');
      return;
    }
    if (params.error == undefined) {
     console.log('ERROR: Params is missing error function. Error handling must be in place.');
      return;
    }

    var self = this;
    // Using the constant window.IS_MOBILE here is a small hack
    // which saves a considerable amount of code clutter
    if (window.IS_MOBILE) {
      // Notifier Mobile
      var dataBlob = {};
      dataBlob.url = params.url;
      if (params.data != undefined) {
        dataBlob.data = params.data;
      }
      $.ajax({
        type: 'POST',
        data: dataBlob,
        url: self.mobileApi,
        dataFilter: params.dataFilter,
        dataType: params.dataType,
        success: params.success,
        error: params.error,
      });
    }
    else {
      // Notifier
      $.ajax({
        type: (params.data ? 'POST' : 'GET'),
        data: (params.data ? params.data : ''),
        url: params.url,
        dataFilter: params.dataFilter,
        dataType: params.dataType,
        success: params.success,
        error: params.error,
      });
    }
  },

  cleanHtml: function(html, type) {
    var size = html.length;
    // Remove head, scripts, iframes
    html = html.replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '');
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    // Remove audio, video, object, canvas
    html = html.replace(/<audio\b[^<]*(?:(?!<\/audio>)<[^<]*)*<\/audio>/gi, '');
    html = html.replace(/<video\b[^<]*(?:(?!<\/video>)<[^<]*)*<\/video>/gi, '');
    html = html.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
    html = html.replace(/<canvas\b[^<]*(?:(?!<\/canvas>)<[^<]*)*<\/canvas>/gi, '');
    if (Ajaxer.debug) console.log('Ajaxer cleaned HTML, from', size, 'to', html.length);
    return html;
  },
}
