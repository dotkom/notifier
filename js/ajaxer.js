Ajaxer = {
  mobileApi: 'index.php',

  // Format of params:
  // params = {
  //   url: 'http://api.lol.com',
  //   isMobile: 1,
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
    
    if (params.isMobile) {
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
        dataType: params.dataType,
        success: params.success,
        error: params.error,
      });
    }
  },
}
