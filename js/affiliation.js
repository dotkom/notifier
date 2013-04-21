var Affiliation = {
  top: this,
  debug: 1,
  
  // IMPORTANT: Keep the same order here as in options.html and in manifest.json

  // Explanation of organization attributes:

  // name: 'Organization X',
  // key: 'orgx',
  // web: 'https://orgx.com',
  // feed: 'https://orgx.com/feed',
  // logo: './org/orgx/logo.png',
  // icon: './org/orgx/icon.png',
  // placeholder: './org/orgx/placeholder.png',
  // palette: 'orgx',                           // The color palette to use, if special palette exists use orgx-key
  // palettePath: './org/orgx/palette.css',     // Optional: Path to the special palette
  // useAltLink: false,                         // Search news posts for alternative links?
  // getImages: function(links, callback) {},   // getImage(s) will be used if it exists

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
      palette: 'grey',
      useAltLink: false,
      getImage: function(link, callback) {
        Affiliation.getImage(this, link, callback, 'div.post img');
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
      palette: 'green',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
      },
    },
    'emil': {
      name: 'Emil',
      key: 'emil',
      web: 'http://emilweb.no/',
      feed: 'http://emilweb.no/feed/',
      logo: './org/emil/logo.png',
      icon: './org/emil/icon.png',
      placeholder: './org/emil/placeholder.png',
      palette: 'green',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback, 'div.frontpage', 2);
      },
    },
    'leonardo': {
      name: 'Leonardo',
      key: 'leonardo',
      web: 'http://industrielldesign.com/',
      feed: 'http://industrielldesign.com/feed',
      logo: './org/leonardo/logo.png',
      icon: './org/leonardo/icon.png',
      placeholder: './org/leonardo/placeholder.png',
      palette: 'cyan',
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
      palette: 'online',
      palettePath: './org/online/palette.css',
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
      palette: 'red',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback, '.news_item', 'nabla.no');
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
      palette: 'grey',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
      },
    },
    'volvox': {
      name: 'Volvox & Alkymisten',
      key: 'volvox',
      web: 'http://volvox.no/',
      feed: 'http://org.ntnu.no/volvox/feed/',
      logo: './org/volvox/logo.png',
      icon: './org/volvox/icon.png',
      placeholder: './org/volvox/placeholder.png',
      palette: 'green',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback, 'div.post');
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
      palette: 'yellow',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
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
      palette: 'purple',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
      },
    },
    'erudio': {
      name: 'Erudio',
      key: 'erudio',
      web: 'http://www.erudiontnu.org/',
      feed: 'http://www.erudiontnu.org/?feed=rss2',
      logo: './org/erudio/logo.png',
      icon: './org/erudio/icon.png',
      placeholder: './org/erudio/placeholder.png',
      palette: 'red',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback, 'div.post');
      },
    },
    'eureka': {
      name: 'Eureka',
      key: 'eureka',
      web: 'http://eurekalf.wordpress.com/',
      feed: 'http://eurekalf.wordpress.com/feed/',
      logo: './org/eureka/logo.png',
      icon: './org/eureka/icon.png',
      placeholder: './org/eureka/placeholder.png',
      palette: 'yellow',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
      },
    },
    'geolf': {
      name: 'Geolf',
      key: 'geolf',
      web: 'http://geolf.org/',
      feed: 'http://geolf.org/feed/',
      logo: './org/geolf/logo.png',
      icon: './org/geolf/icon.png',
      placeholder: './org/geolf/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
      },
    },
    'gengangere': {
      name: 'Gengangere',
      key: 'gengangere',
      web: 'http://www.gengangere.no/',
      feed: 'http://www.gengangere.no/feed/',
      logo: './org/gengangere/logo.png',
      icon: './org/gengangere/icon.png',
      placeholder: './org/gengangere/placeholder.png',
      palette: 'grey',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
      },
    },
    'jump cut': {
      name: 'Jump Cut',
      key: 'jump cut',
      web: 'http://jumpcutdragvoll.wordpress.com/',
      feed: 'http://jumpcutdragvoll.wordpress.com/feed/',
      logo: './org/jump cut/logo.png',
      icon: './org/jump cut/icon.png',
      placeholder: './org/jump cut/placeholder.png',
      palette: 'grey',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback, 'div.post');
      },
    },
    'ludimus': {
      name: 'Ludimus',
      key: 'ludimus',
      web: 'http://ludimus.org/',
      feed: 'http://ludimus.org/feed/',
      logo: './org/ludimus/logo.png',
      icon: './org/ludimus/icon.png',
      placeholder: './org/ludimus/placeholder.png',
      palette: 'red',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
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
      palette: 'cyan',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
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
      palette: 'red',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
      },
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
      palette: 'cyan',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback, 'div.post');
      },
    },
    'kom': {
      name: 'KOM',
      key: 'kom',
      web: 'http://kjemiogmaterial.wordpress.com/',
      feed: 'http://kjemiogmaterial.wordpress.com/feed/',
      logo: './org/kom/logo.png',
      icon: './org/kom/icon.png',
      placeholder: './org/kom/placeholder.png',
      palette: 'cyan',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback, 'div.post');
      },
    },
    'logistikkstudentene': {
      name: 'Logistikkstudentene',
      key: 'logistikkstudentene',
      web: 'http://logistikkstudentene.no/',
      feed: 'http://logistikkstudentene.no/?feed=rss2',
      logo: './org/logistikkstudentene/logo.png',
      icon: './org/logistikkstudentene/icon.png',
      placeholder: './org/logistikkstudentene/placeholder.png',
      palette: 'cyan',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback, 'div.post');
      },
    },
    'tihlde': {
      name: 'TIHLDE',
      key: 'tihlde',
      web: 'http://tihlde.org/',
      feed: 'http://tihlde.org/feed/',
      logo: './org/tihlde/logo.png',
      icon: './org/tihlde/icon.png',
      placeholder: './org/tihlde/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback, 'div.entry');
      },
    },
    'tim og shænko': {
      name: 'Tim & Shænko',
      key: 'tim og shænko',
      web: 'http://bygging.no/',
      feed: 'http://bygging.no/feed/',
      logo: './org/tim og shænko/logo.png',
      icon: './org/tim og shænko/icon.png',
      placeholder: './org/tim og shænko/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
      },
    },
    'tjsf': {
      name: 'TJSF',
      key: 'tjsf',
      web: 'http://tjsf.no/',
      feed: 'http://tjsf.no/feed/',
      logo: './org/tjsf/logo.png',
      icon: './org/tjsf/icon.png',
      placeholder: './org/tjsf/placeholder.png',
      palette: 'grey',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback, 'div.post');
      },
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
      palette: 'grå',
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
      palette: 'cyan',
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
      palette: 'red',
      useAltLink: false,
      getImage: function(link, callback) {
        Affiliation.getImage(this, link, callback, 'img.event');
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
      palette: 'cyan',
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
      palette: 'purple',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
      },
    },
    'studentparlamentet hist': {
      name: 'Studentparlamentet HiST',
      key: 'studentparlamentet hist',
      web: 'http://studentparlamentet.com/',
      feed: 'http://studentparlamentet.com/?feed=rss2',
      logo: './org/studentparlamentet hist/logo.png',
      icon: './org/studentparlamentet hist/icon.png',
      placeholder: './org/studentparlamentet hist/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback, 'div.post');
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
      palette: 'blue',
      useAltLink: false,
      getImage: function(link, callback) {
        Affiliation.getImage(this, link, callback, 'img', 2);
      },
    },
    'rektoratet ntnu': {
      name: 'Rektoratet NTNU',
      key: 'rektoratet ntnu',
      web: 'http://www.ntnu.no/blogger/rektoratet/',
      feed: 'http://www.ntnu.no/blogger/rektoratet/feed/',
      logo: './org/rektoratet ntnu/logo.png',
      icon: './org/rektoratet ntnu/icon.png',
      placeholder: './org/rektoratet ntnu/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImage: function(link, callback) {
        Affiliation.getImage(this, link, callback, 'div.entry img');
      },
    },
    'hist': {
      name: 'HiST',
      key: 'hist',
      web: 'http://hist.no/',
      feed: 'http://hist.no/rss.ap?thisId=1393',
      logo: './org/hist/logo.png',
      icon: './org/hist/icon.png',
      placeholder: './org/hist/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback, 'div.unit', 'hist.no');
      },
    },
    'dmmh': {
      name: 'DMMH',
      key: 'dmmh',
      web: 'http://www.dmmh.no/',
      feed: 'http://www.dmmh.no/rss.php?type=site&id=10&location=393',
      logo: './org/dmmh/logo.png',
      icon: './org/dmmh/icon.png',
      placeholder: './org/dmmh/placeholder.png',
      palette: 'red',
      useAltLink: false,
      getImage: function(link, callback) {
        Affiliation.getImage(this, link, callback, 'div.news_article img', 0, 'dmmh.no');
      },
    },
  },

  // Common getImage[s] function

  getImages: function(affiliation, links, callback, parentSelector, domainUrl) {
    var web = affiliation.web;
    var placeholder = affiliation.placeholder;
    var placeholders = []
    if (parentSelector == undefined)
      parentSelector = 'article';
    // In case we don't find any images, prepare an array with placeholders
    for (var i=0; i<links.length; i++)
      placeholders.push(placeholder);
    Ajaxer.getHtml({
      url: web,
      success: function(html) {
        try {
          var images = [];
          for (i in links) {
            // If posts are using relative links, split by passed string, usually the domain name, like 'hist.no'
            if (domainUrl)
              var relativeLink = links[i].split(domainUrl)[1];
            // jQuery 1.9+ does not consider pages starting with a newline as HTML, first char should be "<"
            html = $.trim(html);
            // jQuery tries to preload images found in the string, the following line causes errors, ignore it for now
            image = $(html);
            
            // Look up the first post with the link inside it
            image = image.find(parentSelector + ' a[href="'+(domainUrl ? relativeLink : links[i])+'"]');
            // Find parent 'article' or 'div.post' or the like
            image = image.parents(parentSelector);
            // Find all image tags within post
            image = image.find('img');
            // Exclude gifs since they're most likely smilies and the likes
            image = image.not('img[src*=".gif"]');
            // Get the src for the first image left in the array
            image = image.attr('src');

            if (image == undefined)
              image = placeholder;
            else if (domainUrl)
              image = 'http://' + domainUrl + image

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

  getImage: function(affiliation, link, callback, selector, index, domainUrl) {
    var placeholder = affiliation.placeholder;
    if (index == undefined)
      var index = 0;
    Ajaxer.getHtml({
      url: link,
      success: function(html) {
        // jQuery 1.9+ does not consider pages starting with a newline as HTML, first char should be "<"
        html = $.trim(html);
        // jQuery tries to preload images found in the string, the following line causes errors, ignore it for now
        image = $(html);
        // Get image from parent selector, with optional image index
        image = image.find(selector).not('img[src*=".gif"]').eq(index).attr('src');

        if (image != undefined) {
          if (domainUrl != undefined) {
            image = 'http://' + domainUrl + image;
          }
          callback(link, image);
        }
        else {
          if (top.debug) console.log('ERROR: no image exists for link', link);
          callback(link, placeholder);
        }
      },
      error: function() {
        if (top.debug) console.log('ERROR: couldn\'t load page to get image links', link);
        callback(link, placeholder);
      },
    });
  },

}
