var Affiliation = {
  top: this,
  debug: 1,
  
  // IMPORTANT: Keep the same order here as in options.html and in manifest.json

  // Why do we have the key field? Because it's a practical and easy low-cost
  // solution to a problem of encapsulation

  org: {
    // Linjeforeninger Gløshaugen
    'berg': {
      name: 'Bergstuderendes Forening',
      key: 'berg',
      web: 'http://bergstud.no/',
      feed: 'http://bergstud.no/feed/',
      logo: './org/berg/logo.png',
      icon: './org/berg/icon.png',
      placeholder: './org/berg/placeholder.png',
      color: 'grey',
      useAltLink: false,
      getImage: function(link, callback) {
        var placeholder = this.placeholder;
        Ajaxer.getHtml({
          url: link,
          success: function(html) {
            try {
              // jQuery 1.9+ does not consider pages starting with a newline as HTML, first char should be "<"
              html = $.trim(html);
              // jQuery tries to preload images found in the string, the following line causes errors, ignore it for now
              html = $(html);
              // Find the actual image reference
              image = html.find('div.post img:first').attr('src');

              if (image == undefined) {
                image = placeholder;
              }
              callback(link, image);
            } catch (e) {
              if (top.debug) console.log('ERROR: wrong format or missing image for link: ' + id);
              callback(link, placeholder);
            }
          },
          error: function() {
            if (top.debug) console.log('ERROR: couldn\'t connect to '+link+' to get image links, returning default image');
            callback(link, placeholder);
          },
        });
      },
    },
    'delta': {
      name: 'Delta',
      key: 'delta',
      web: 'http://org.ntnu.no/delta/',
      feed: 'http://org.ntnu.no/delta/wp/?feed=rss2',
      logo: './org/delta/logo.png',
      icon: './org/delta/icon.png',
      placeholder: './org/delta/placeholder.png',
      color: 'green',
      useAltLink: false,
    },
    'emil': {
      name: 'Emil',
      key: 'emil',
      web: 'http://emilweb.no/',
      feed: 'http://emilweb.no/feed/',
      logo: './org/emil/logo.png',
      icon: './org/emil/icon.png',
      placeholder: './org/emil/placeholder.png',
      color: 'green',
      useAltLink: false,
    },
    'leonardo': {
      name: 'Leonardo',
      key: 'leonardo',
      web: 'http://industrielldesign.com/',
      feed: 'http://industrielldesign.com/feed',
      logo: './org/leonardo/logo.png',
      icon: './org/leonardo/icon.png',
      placeholder: './org/leonardo/placeholder.png',
      color: 'cyan',
      useAltLink: false,
      getImages: function(links, callback) {
        var web = this.web;
        var placeholder = this.placeholder;
        var placeholders = []
        // In case we don't find any images, prepare an array with placeholders
        for (var i=0; i<links.length; i++)
          placeholders.push(placeholder);
        Ajaxer.getHtml({
          url: web,
          success: function(html) {
            try {
              var images = [];
              for (i in links) {
                var realLink = links[i].split('?')[0];
                var image = $(html).find('a[href="'+realLink+'"] img').attr('src');
                images.push(image);
              }
              callback(links, images);
            }
            catch (e) {
              if (top.debug) console.log('ERROR: could not parse '+this.name+' website');
              callback(links, placeholders);
            }
          },
          error: function(e) {
            if (top.debug) console.log('ERROR: could not fetch '+this.name+' website');
            callback(links, placeholders);
          },
        });
      },
    },
    'online': {
      name: 'Online',
      key: 'online',
      web: 'https://online.ntnu.no/',
      feed: 'https://online.ntnu.no/feeds/news/',
      logo: './img/logo.png', // Note unique URL pattern
      icon: './img/icon-default.png', // Note unique URL pattern
      placeholder: './img/placeholder.png', // Note unique URL pattern
      color: 'blue',
      useAltLink: true,
      getImage: function(link, callback) {
        var placeholder = this.placeholder;
        var id = link.split('/')[4]; // id is stored in the link
        var api = 'https://online.ntnu.no/api/f5be90e5ec1d2d454ae9/news_image_by_id/';
        Ajaxer.getJson({
          url: api + id,
          success: function(json) {
            if (json['online_news_image']) {
              image = json['online_news_image']['0']['image'];
              callback(link, image);
            }
            else {
              if (top.debug) console.log('ERROR: no image exists for id: ' + id);
              callback(link, placeholder);
            }
          },
          error: function() {
            if (top.debug) console.log('ERROR: couldn\'t connect API to get image links, returning default image');
            callback(link, placeholder);
          },
        });
      },
    },
    'nabla': {
      name: 'Nabla',
      key: 'nabla',
      web: 'http://nabla.no/',
      feed: 'http://nabla.no/feed/',
      logo: './org/nabla/logo.png',
      icon: './org/nabla/icon.png',
      placeholder: './org/nabla/placeholder.png',
      color: 'red',
      useAltLink: false,
      getImages: function(links, callback) {
        var web = this.web;
        var placeholder = this.placeholder;
        var placeholders = []
        // In case we don't find any images, prepare an array with placeholders
        for (var i=0; i<links.length; i++)
          placeholders.push(placeholder);
        Ajaxer.getHtml({
          url: web,
          success: function(html) {
            try {
              var images = [];
              for (i in links) {
                var relativeLink = links[i].split('nabla.no')[1];
                // jQuery 1.9+ does not consider pages starting with a newline as HTML, first char should be "<"
                html = $.trim(html);
                // jQuery tries to preload images found in the string, the following line causes errors, ignore it for now
                image = $(html);
                // Find the actual image reference
                image = image.find('.news_item a[href="'+relativeLink+'"] img').attr('src');

                if (image == undefined) {
                  image = placeholder;
                }
                else {
                  image = 'http://nabla.no' + image;
                }
                images.push(image);
              }
              callback(links, images);
            }
            catch (e) {
              if (top.debug) console.log('ERROR: could not parse '+this.name+' website');
              callback(links, placeholders);
            }
          },
          error: function(e) {
            if (top.debug) console.log('ERROR: could not fetch '+this.name+' website');
            callback(links, placeholders);
          },
        });
      },
    },
    'spanskrøret': {
      name: 'Spanskrøret',
      key: 'spanskrøret',
      web: 'http://spanskroret.no/',
      feed: 'http://spanskroret.no/feed/',
      logo: './org/spanskrøret/logo.png',
      icon: './org/spanskrøret/icon.png',
      placeholder: './org/spanskrøret/placeholder.png',
      color: 'grey',
      useAltLink: false,
    },
    'volvox': {
      name: 'Volvox & Alkymisten',
      key: 'volvox',
      web: 'http://volvox.no/',
      feed: 'http://org.ntnu.no/volvox/feed/',
      logo: './org/volvox/logo.png',
      icon: './org/volvox/icon.png',
      placeholder: './org/volvox/placeholder.png',
      color: 'green',
      useAltLink: false,
      getImages: function(links, callback) {
        var web = this.web;
        var placeholder = this.placeholder;
        var placeholders = []
        // In case we don't find any images, prepare an array with placeholders
        for (var i=0; i<links.length; i++)
          placeholders.push(placeholder);
        Ajaxer.getHtml({
          url: web,
          success: function(html) {
            try {
              var images = [];
              for (i in links) {
                // jQuery 1.9+ does not consider pages starting with a newline as HTML, first char should be "<"
                html = $.trim(html);
                // jQuery tries to preload images found in the string, the following line causes errors, ignore it for now
                image = $(html);
                // Find the actual image reference
                image = image.find('a[href="'+links[i]+'"]:first').parents('div.post').find('img').attr('src');

                if (image == undefined) {
                  image = placeholder;
                }
                if (image.match(/smil(ie|ey)s?/g) !== null) {
                  image = placeholder;
                }
                images.push(image);
              }
              callback(links, images);
            }
            catch (e) {
              if (top.debug) console.log('ERROR: could not parse '+this.name+' website');
              callback(links, placeholders);
            }
          },
          error: function(e) {
            if (top.debug) console.log('ERROR: could not fetch '+this.name+' website');
            callback(links, placeholders);
          },
        });
      },
    },

    // Linjeforeninger Dragvoll
    'de folkevalgte': {
      name: 'De Folkevalgte',
      key: 'de folkevalgte',
      web: 'http://www.defolkevalgte.net/',
      feed: 'http://www.defolkevalgte.net/feed/rss/',
      logo: './org/de folkevalgte/logo.png',
      icon: './org/de folkevalgte/icon.png',
      placeholder: './org/de folkevalgte/placeholder.png',
      color: 'yellow',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImagesFromWordpress(this, 'article', links, callback);
      },
    },
    'dionysos': {
      name: 'Dionysos',
      key: 'dionysos',
      web: 'http://dionysosntnu.wordpress.com/',
      feed: 'http://dionysosntnu.wordpress.com/feed/',
      logo: './org/dionysos/logo.png',
      icon: './org/dionysos/icon.png',
      placeholder: './org/dionysos/placeholder.png',
      color: 'grey',
      useAltLink: false,
    },
    'erudio': {
      name: 'Erudio',
      key: 'erudio',
      web: 'http://www.erudiontnu.org/',
      feed: 'http://www.erudiontnu.org/?feed=rss2',
      logo: './org/erudio/logo.png',
      icon: './org/erudio/icon.png',
      placeholder: './org/erudio/placeholder.png',
      color: 'red',
      useAltLink: false,
    },
    'eureka': {
      name: 'Eureka',
      key: 'eureka',
      web: 'http://eurekalf.wordpress.com/',
      feed: 'http://eurekalf.wordpress.com/feed/',
      logo: './org/eureka/logo.png',
      icon: './org/eureka/icon.png',
      placeholder: './org/eureka/placeholder.png',
      color: 'yellow',
      useAltLink: false,
    },
    'geolf': {
      name: 'Geolf',
      key: 'geolf',
      web: 'http://geolf.org/',
      feed: 'http://geolf.org/feed/',
      logo: './org/geolf/logo.png',
      icon: './org/geolf/icon.png',
      placeholder: './org/geolf/placeholder.png',
      color: 'blue',
      useAltLink: false,
    },
    'gengangere': {
      name: 'Gengangere',
      key: 'gengangere',
      web: 'http://www.gengangere.no/',
      feed: 'http://www.gengangere.no/feed/',
      logo: './org/gengangere/logo.png',
      icon: './org/gengangere/icon.png',
      placeholder: './org/gengangere/placeholder.png',
      color: 'grey',
      useAltLink: false,
    },
    'jump cut': {
      name: 'Jump Cut',
      key: 'jump cut',
      web: 'http://jumpcutdragvoll.wordpress.com/',
      feed: 'http://jumpcutdragvoll.wordpress.com/feed/',
      logo: './org/jump cut/logo.png',
      icon: './org/jump cut/icon.png',
      placeholder: './org/jump cut/placeholder.png',
      color: 'grey',
      useAltLink: false,
    },
    'ludimus': {
      name: 'Ludimus',
      key: 'ludimus',
      web: 'http://ludimus.org/',
      feed: 'http://ludimus.org/feed/',
      logo: './org/ludimus/logo.png',
      icon: './org/ludimus/icon.png',
      placeholder: './org/ludimus/placeholder.png',
      color: 'red',
      useAltLink: false,
      getImages: function(links, callback) {
        var web = this.web;
        var placeholder = this.placeholder;
        var placeholders = []
        // In case we don't find any images, prepare an array with placeholders
        for (var i=0; i<links.length; i++)
          placeholders.push(placeholder);
        Ajaxer.getHtml({
          url: web,
          success: function(html) {
            try {
              var images = [];
              for (i in links) {
                // jQuery 1.9+ does not consider pages starting with a newline as HTML, first char should be "<"
                html = $.trim(html);
                // jQuery tries to preload images found in the string, the following line causes errors, ignore it for now
                image = $(html);
                // Find the actual image reference
                image = image.find('a[href="'+links[i]+'"]:first').parents('article').find('img').attr('src');

                if (image == undefined) {
                  image = placeholder;
                }
                images.push(image);
              }
              callback(links, images);
            }
            catch (e) {
              if (top.debug) console.log('ERROR: could not parse '+this.name+' website');
              callback(links, placeholders);
            }
          },
          error: function(e) {
            if (top.debug) console.log('ERROR: could not fetch '+this.name+' website');
            callback(links, placeholders);
          },
        });
      },
    },
    'primetime': {
      name: 'Primetime',
      key: 'primetime',
      web: 'http://www.primetime.trondheim.no/',
      feed: 'http://www.primetime.trondheim.no/feed/',
      logo: './org/primetime/logo.png',
      icon: './org/primetime/icon.png',
      placeholder: './org/primetime/placeholder.png',
      color: 'cyan',
      useAltLink: false,
      getImages: function(links, callback) {
        var web = this.web;
        var placeholder = this.placeholder;
        var placeholders = []
        // In case we don't find any images, prepare an array with placeholders
        for (var i=0; i<links.length; i++)
          placeholders.push(placeholder);
        Ajaxer.getHtml({
          url: web,
          success: function(html) {
            try {
              var images = [];
              for (i in links) {
                // jQuery 1.9+ does not consider pages starting with a newline as HTML, first char should be "<"
                html = $.trim(html);
                // jQuery tries to preload images found in the string, the following line causes errors, ignore it for now
                image = $(html);
                // Find the actual image reference
                image = image.find('a[href="'+links[i]+'"]:first').parents('article').find('img').attr('src');

                if (image == undefined) {
                  image = placeholder;
                }
                if (image.match(/smil(ie|ey)s?/g) !== null) {
                  image = placeholder;
                }
                images.push(image);
              }
              callback(links, images);
            }
            catch (e) {
              if (top.debug) console.log('ERROR: could not parse '+this.name+' website');
              callback(links, placeholders);
            }
          },
          error: function(e) {
            if (top.debug) console.log('ERROR: could not fetch '+this.name+' website');
            callback(links, placeholders);
          },
        });
      },
    },
    'sturm und drang': {
      name: 'Sturm Und Drang',
      key: 'sturm und drang',
      web: 'http://www.sturm.ntnu.no/',
      feed: 'http://www.sturm.ntnu.no/wordpress/?feed=rss2',
      logo: './org/sturm und drang/logo.png',
      icon: './org/sturm und drang/icon.png',
      placeholder: './org/sturm und drang/placeholder.png',
      color: 'red',
      useAltLink: false,
    },

    // Linjeforeninger HiST/DMMH/TJSF/BI
    'fraktur': {
      name: 'Fraktur',
      key: 'fraktur',
      web: 'http://www.fraktur.no/',
      feed: 'http://www.fraktur.no/feed/',
      logo: './org/fraktur/logo.png',
      icon: './org/fraktur/icon.png',
      placeholder: './org/fraktur/placeholder.png',
      color: 'cyan',
      useAltLink: false,
    },
    'kom': {
      name: 'KOM',
      key: 'kom',
      web: 'http://kjemiogmaterial.wordpress.com/',
      feed: 'http://kjemiogmaterial.wordpress.com/feed/',
      logo: './org/kom/logo.png',
      icon: './org/kom/icon.png',
      placeholder: './org/kom/placeholder.png',
      color: 'cyan',
      useAltLink: false,
    },
    'logistikkstudentene': {
      name: 'Logistikkstudentene',
      key: 'logistikkstudentene',
      web: 'http://www.logistikkstudentene.no/',
      feed: 'http://www.logistikkstudentene.no/?feed=rss2',
      logo: './org/logistikkstudentene/logo.png',
      icon: './org/logistikkstudentene/icon.png',
      placeholder: './org/logistikkstudentene/placeholder.png',
      color: 'cyan',
      useAltLink: false,
    },
    'tihlde': {
      name: 'TIHLDE',
      key: 'tihlde',
      web: 'http://tihlde.org/',
      feed: 'http://tihlde.org/feed/',
      logo: './org/tihlde/logo.png',
      icon: './org/tihlde/icon.png',
      placeholder: './org/tihlde/placeholder.png',
      color: 'blue',
      useAltLink: false,
    },
    'tim og shænko': {
      name: 'Tim & Shænko',
      key: 'tim og shænko',
      web: 'http://bygging.no/',
      feed: 'http://bygging.no/feed/',
      logo: './org/tim og shænko/logo.png',
      icon: './org/tim og shænko/icon.png',
      placeholder: './org/tim og shænko/placeholder.png',
      color: 'blue',
      useAltLink: false,
    },
    'tjsf': {
      name: 'TJSF',
      key: 'tjsf',
      web: 'http://tjsf.no/',
      feed: 'http://tjsf.no/feed/',
      logo: './org/tjsf/logo.png',
      icon: './org/tjsf/icon.png',
      placeholder: './org/tjsf/placeholder.png',
      color: 'grey',
      useAltLink: false,
    },

    // Studentmedier
    'dusken': {
      name: 'Dusken.no',
      key: 'dusken',
      web: 'http://dusken.no/',
      feed: 'http://dusken.no/feed/',
      logo: './org/dusken/logo.png',
      icon: './org/dusken/icon.png',
      placeholder: './org/dusken/placeholder.png',
      color: 'grå',
      useAltLink: false,
    },
    'universitetsavisa': {
      name: 'Universitetsavisa',
      key: 'universitetsavisa',
      web: 'http://www.universitetsavisa.no/',
      feed: 'http://www.universitetsavisa.no/?service=rss',
      logo: './org/universitetsavisa/logo.png',
      icon: './org/universitetsavisa/icon.png',
      placeholder: './org/universitetsavisa/placeholder.png',
      color: 'cyan',
      useAltLink: false,
    },

    // Store studentorganisasjoner
    'samfundet': {
      name: 'Studentersamfundet',
      key: 'samfundet',
      web: 'http://www.samfundet.no/',
      feed: 'http://www.samfundet.no/arrangement/rss',
      logo: './org/samfundet/logo.png',
      icon: './org/samfundet/icon.png',
      placeholder: './org/samfundet/placeholder.png',
      color: 'red',
      useAltLink: false,
      getImage: function(link, callback) {
        var placeholder = this.placeholder;
        Ajaxer.getHtml({
          url: link,
          success: function(html) {
            try {
              var image = $(html).find('img.event').attr('src');
              callback(link, image);
            }
            catch (e) {
              if (top.debug) console.log('ERROR: could not parse Samfundet\'s website');
              callback(link, placeholder);
            }
          },
          error: function(e) {
            if (top.debug) console.log('ERROR: could not fetch Samfundet\'s website');
            callback(link, placeholder);
          },
        });
      },
    },

    // Studentdemokrati
    'velferdstinget': {
      name: 'Velferdstinget',
      key: 'velferdstinget',
      web: 'http://www.velferdstinget.no/',
      feed: 'http://www.velferdstinget.no/feed/rss/',
      logo: './org/velferdstinget/logo.png',
      icon: './org/velferdstinget/icon.png',
      placeholder: './org/velferdstinget/placeholder.png',
      color: 'cyan',
      useAltLink: false,
    },
    'studenttinget ntnu': {
      name: 'Studenttinget NTNU',
      key: 'studenttinget ntnu',
      web: 'http://www.studenttinget.no/',
      feed: 'http://www.studenttinget.no/feed/',
      logo: './org/studenttinget ntnu/logo.png',
      icon: './org/studenttinget ntnu/icon.png',
      placeholder: './org/studenttinget ntnu/placeholder.png',
      color: 'purple',
      useAltLink: false,
    },
    'studentparlamentet hist': {
      name: 'Studentparlamentet HiST',
      key: 'studentparlamentet hist',
      web: 'http://studentparlamentet.com/',
      feed: 'http://studentparlamentet.com/?feed=rss2',
      logo: './org/studentparlamentet hist/logo.png',
      icon: './org/studentparlamentet hist/icon.png',
      placeholder: './org/studentparlamentet hist/placeholder.png',
      color: 'blue',
      useAltLink: false,
      getImages: function(links, callback) {
        var web = this.web;
        var placeholder = this.placeholder;
        var placeholders = []
        // In case we don't find any images, prepare an array with placeholders
        for (var i=0; i<links.length; i++)
          placeholders.push(placeholder);
        Ajaxer.getHtml({
          url: web,
          success: function(html) {
            try {
              var images = [];
              for (i in links) {
                // jQuery 1.9+ does not consider pages starting with a newline as HTML, first char should be "<"
                html = $.trim(html);
                // jQuery tries to preload images found in the string, the following line causes errors, ignore it for now
                image = $(html);
                // Find the actual image reference
                image = image.find('div.post a[href="http://studentparlamentet.com/ny-nettside-og-ny-logo/"]').parents('div.post').find('img').attr('src');

                if (image == undefined) {
                  image = placeholder;
                }
                images.push(image);
              }
              callback(links, images);
            }
            catch (e) {
              if (top.debug) console.log('ERROR: could not parse '+this.name+' website');
              callback(links, placeholders);
            }
          },
          error: function(e) {
            if (top.debug) console.log('ERROR: could not fetch '+this.name+' website');
            callback(links, placeholders);
          },
        });
      },
    },
    
    // Institusjoner
    'ntnu': {
      name: 'NTNU',
      key: 'ntnu',
      web: 'http://ntnu.no/',
      feed: 'https://www.retriever-info.com/feed/2002900/generell_arkiv166/index.xml',
      logo: './org/ntnu/logo.png',
      icon: './org/ntnu/icon.png',
      placeholder: './org/ntnu/placeholder.png',
      color: 'blue',
      useAltLink: false,
    },
    'rektoratet ntnu': {
      name: 'Rektoratet NTNU',
      key: 'rektoratet ntnu',
      web: 'http://www.ntnu.no/blogger/rektoratet/',
      feed: 'http://www.ntnu.no/blogger/rektoratet/feed/',
      logo: './org/rektoratet ntnu/logo.png',
      icon: './org/rektoratet ntnu/icon.png',
      placeholder: './org/rektoratet ntnu/placeholder.png',
      color: 'blue',
      useAltLink: false,
    },
    'hist': {
      name: 'HiST',
      key: 'hist',
      web: 'http://hist.no/',
      feed: 'http://hist.no/rss.ap?thisId=1393',
      logo: './org/hist/logo.png',
      icon: './org/hist/icon.png',
      placeholder: './org/hist/placeholder.png',
      color: 'blue',
      useAltLink: false,
    },
    'dmmh': {
      name: 'DMMH',
      key: 'dmmh',
      web: 'http://www.dmmh.no/',
      feed: 'http://www.dmmh.no/rss.php?type=site&id=10&location=393',
      logo: './org/dmmh/logo.png',
      icon: './org/dmmh/icon.png',
      placeholder: './org/dmmh/placeholder.png',
      color: 'red',
      useAltLink: false,
    },
  },

  // Common getImage[s] functions

  getImagesFromWordpress: function(affiliation, parentSelector, links, callback) {
    var web = affiliation.web;
    var placeholder = affiliation.placeholder;
    var placeholders = []
    // In case we don't find any images, prepare an array with placeholders
    for (var i=0; i<links.length; i++)
      placeholders.push(placeholder);
    Ajaxer.getHtml({
      url: web,
      success: function(html) {
        try {
          var images = [];
          for (i in links) {
            // jQuery 1.9+ does not consider pages starting with a newline as HTML, first char should be "<"
            html = $.trim(html);
            // jQuery tries to preload images found in the string, the following line causes errors, ignore it for now
            image = $(html);
            // Find the actual image reference
            image = image.find('a[href="'+links[i]+'"]:first').parents(parentSelector).find('img').attr('src');

            if (image == undefined) {
              image = placeholder;
            }
            images.push(image);
          }
          callback(links, images);
        }
        catch (e) {
          if (top.debug) console.log('ERROR: could not parse '+affiliation.name+' website');
          callback(links, placeholders);
        }
      },
      error: function(e) {
        if (top.debug) console.log('ERROR: could not fetch '+affiliation.name+' website');
        callback(links, placeholders);
      },
    });
  },

}