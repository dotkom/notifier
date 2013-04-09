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
      feed: 'http://bergstud.no/feed/',
      logo: './org/berg/logo.png',
      icon: './org/berg/icon.png',
      placeholder: './org/berg/placeholder.png',
      color: 'grey',
      useAltLink: false,
    },
    'delta': {
      name: 'Delta',
      key: 'delta',
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
      feed: 'http://industrielldesign.com/feed',
      logo: './org/leonardo/logo.png',
      icon: './org/leonardo/icon.png',
      placeholder: './org/leonardo/placeholder.png',
      color: 'cyan',
      useAltLink: false,
      getImages: function(links, callback) {
        var placeholder = this.placeholder;
        var placeholders = []
        // In case we don't find any images, prepare an array with placeholders
        for (var i=0; i<links.length; i++)
          placeholders.push(placeholder);
        Ajaxer.getHtml({
          url: 'http://industrielldesign.com/',
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
      feed: 'http://nabla.no/feed/',
      logo: './org/nabla/logo.png',
      icon: './org/nabla/icon.png',
      placeholder: './org/nabla/placeholder.png',
      color: 'white',
      useAltLink: false,
      getImages: function(links, callback) {
        var placeholder = this.placeholder;
        var placeholders = []
        // In case we don't find any images, prepare an array with placeholders
        for (var i=0; i<links.length; i++)
          placeholders.push(placeholder);
        Ajaxer.getHtml({
          url: 'http://nabla.no/',
          success: function(html) {
            try {
              var images = [];
              for (i in links) {
                var relativeLink = links[i].split('nabla.no')[1];
                // jQuery 1.9+ does not consider pages starting with a newline as HTML, only "<" is allowed
                html = $.trim(html);
                var image = $(html).find('.news_item a[href="'+relativeLink+'"] img').attr('src');
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
      feed: 'http://org.ntnu.no/volvox/feed/',
      logo: './org/volvox/logo.png',
      icon: './org/volvox/icon.png',
      placeholder: './org/volvox/placeholder.png',
      color: 'green',
      useAltLink: false,
    },

    // Linjeforeninger Dragvoll
    'dionysos': {
      name: 'Dionysos',
      key: 'dionysos',
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
      feed: 'http://www.erudiontnu.org/?feed=rss2',
      logo: './org/erudio/logo.png',
      icon: './org/erudio/icon.png',
      placeholder: './org/erudio/placeholder.png',
      color: 'red',
      useAltLink: false,
    },
    'geolf': {
      name: 'Geolf',
      key: 'geolf',
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
      feed: 'http://ludimus.org/feed/',
      logo: './org/ludimus/logo.png',
      icon: './org/ludimus/icon.png',
      placeholder: './org/ludimus/placeholder.png',
      color: 'red',
      useAltLink: false,
    },
    'primetime': {
      name: 'Primetime',
      key: 'primetime',
      feed: 'http://www.primetime.trondheim.no/feed/',
      logo: './org/primetime/logo.png',
      icon: './org/primetime/icon.png',
      placeholder: './org/primetime/placeholder.png',
      color: 'cyan',
      useAltLink: false,
    },
    'sturm und drang': {
      name: 'Sturm Und Drang',
      key: 'sturm und drang',
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
      feed: 'http://www.studenttinget.no/feed/',
      logo: './org/studenttinget ntnu/logo.png',
      icon: './org/studenttinget ntnu/icon.png',
      placeholder: './org/studenttinget ntnu/placeholder.png',
      color: 'red',
      useAltLink: false,
    },
    'studentparlamentet hist': {
      name: 'Studentparlamentet HiST',
      key: 'studentparlamentet hist',
      feed: 'http://studentparlamentet.com/?feed=rss2',
      logo: './org/studentparlamentet hist/logo.png',
      icon: './org/studentparlamentet hist/icon.png',
      placeholder: './org/studentparlamentet hist/placeholder.png',
      color: 'blue',
      useAltLink: false,
    },
    
    // Institusjoner
    'ntnu': {
      name: 'NTNU',
      key: 'ntnu',
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
      feed: 'http://www.dmmh.no/rss.php?type=site&id=10&location=393',
      logo: './org/dmmh/logo.png',
      icon: './org/dmmh/icon.png',
      placeholder: './org/dmmh/placeholder.png',
      color: 'red',
      useAltLink: false,
    },
  },

}