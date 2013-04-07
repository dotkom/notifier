var Affiliation = {
  top: this,
  debug: 0,
  
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
      symbol: './org/berg/symbol.png',
      placeholder: './org/berg/placeholder.png',
      color: 'grey',
      useAltLink: false,
    },
    'delta': {
      name: 'Delta',
      key: 'delta',
      feed: 'http://org.ntnu.no/delta/wp/?feed=rss2',
      logo: './org/delta/logo.png',
      symbol: './org/delta/symbol.png',
      placeholder: './org/delta/placeholder.png',
      color: 'green',
      useAltLink: false,
    },
    'emil': {
      name: 'Emil',
      key: 'emil',
      feed: 'http://emilweb.no/feed/',
      logo: './org/emil/logo.png',
      symbol: './org/emil/symbol.png',
      placeholder: './org/emil/placeholder.png',
      color: 'green',
      useAltLink: false,
    },
    'leonardo': {
      name: 'Leonardo',
      key: 'leonardo',
      feed: 'http://industrielldesign.com/feed',
      logo: './org/leonardo/logo.png',
      symbol: './org/leonardo/symbol.png',
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
              if (top.debug) console.log('ERROR: could not parse Leonardo\'s website');
              callback(links, placeholders);
            }
          },
          error: function(e) {
            if (top.debug) console.log('ERROR: could not fetch Leonardo\'s website');
            callback(links, placeholders);
          },
        });
      },
    },
    'online': {
      name: 'Online',
      key: 'online',
      feed: 'https://online.ntnu.no/feeds/news/',
      logo: './org/online/logo.png',
      symbol: './org/online/symbol.png',
      placeholder: './img/placeholder.png', // Note different URL from the rest
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
      symbol: './org/nabla/symbol.png',
      placeholder: './org/nabla/placeholder.png',
      color: 'red',
      useAltLink: false,
    },
    'spanskrøret': {
      name: 'Spanskrøret',
      key: 'spanskrøret',
      feed: 'http://spanskroret.no/feed/',
      logo: './org/spanskrøret/logo.png',
      symbol: './org/spanskrøret/symbol.png',
      placeholder: './org/spanskrøret/placeholder.png',
      color: 'grey',
      useAltLink: false,
    },
    'volvox': {
      name: 'Volvox & Alkymisten',
      key: 'volvox',
      feed: 'http://org.ntnu.no/volvox/feed/',
      logo: './org/volvox/logo.png',
      symbol: './org/volvox/symbol.png',
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
      symbol: './org/dionysos/symbol.png',
      placeholder: './org/dionysos/placeholder.png',
      color: 'grey',
      useAltLink: false,
    },
    'erudio': {
      name: 'Erudio',
      key: 'erudio',
      feed: 'http://www.erudiontnu.org/?feed=rss2',
      logo: './org/erudio/logo.png',
      symbol: './org/erudio/symbol.png',
      placeholder: './org/erudio/placeholder.png',
      color: 'red',
      useAltLink: false,
    },
    'geolf': {
      name: 'Geolf',
      key: 'geolf',
      feed: 'http://geolf.org/feed/',
      logo: './org/geolf/logo.png',
      symbol: './org/geolf/symbol.png',
      placeholder: './org/geolf/placeholder.png',
      color: 'blue',
      useAltLink: false,
    },
    'gengangere': {
      name: 'Gengangere',
      key: 'gengangere',
      feed: 'http://www.gengangere.no/feed/',
      logo: './org/gengangere/logo.png',
      symbol: './org/gengangere/symbol.png',
      placeholder: './org/gengangere/placeholder.png',
      color: 'grey',
      useAltLink: false,
    },
    'jump cut': {
      name: 'Jump Cut',
      key: 'jump cut',
      feed: 'http://jumpcutdragvoll.wordpress.com/feed/',
      logo: './org/jump cut/logo.png',
      symbol: './org/jump cut/symbol.png',
      placeholder: './org/jump cut/placeholder.png',
      color: 'grey',
      useAltLink: false,
    },
    'ludimus': {
      name: 'Ludimus',
      key: 'ludimus',
      feed: 'http://ludimus.org/feed/',
      logo: './org/ludimus/logo.png',
      symbol: './org/ludimus/symbol.png',
      placeholder: './org/ludimus/placeholder.png',
      color: 'red',
      useAltLink: false,
    },
    'primetime': {
      name: 'Primetime',
      key: 'primetime',
      feed: 'http://www.primetime.trondheim.no/feed/',
      logo: './org/primetime/logo.png',
      symbol: './org/primetime/symbol.png',
      placeholder: './org/primetime/placeholder.png',
      color: 'cyan',
      useAltLink: false,
    },
    'sturm und drang': {
      name: 'Sturm Und Drang',
      key: 'sturm und drang',
      feed: 'http://www.sturm.ntnu.no/wordpress/?feed=rss2',
      logo: './org/sturm und drang/logo.png',
      symbol: './org/sturm und drang/symbol.png',
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
      symbol: './org/fraktur/symbol.png',
      placeholder: './org/fraktur/placeholder.png',
      color: 'cyan',
      useAltLink: false,
    },
    'kom': {
      name: 'KOM',
      key: 'kom',
      feed: 'http://kjemiogmaterial.wordpress.com/feed/',
      logo: './org/kom/logo.png',
      symbol: './org/kom/symbol.png',
      placeholder: './org/kom/placeholder.png',
      color: 'cyan',
      useAltLink: false,
    },
    'logistikkstudentene': {
      name: 'Logistikkstudentene',
      key: 'logistikkstudentene',
      feed: 'http://www.logistikkstudentene.no/?feed=rss2',
      logo: './org/logistikkstudentene/logo.png',
      symbol: './org/logistikkstudentene/symbol.png',
      placeholder: './org/logistikkstudentene/placeholder.png',
      color: 'cyan',
      useAltLink: false,
    },
    'tihlde': {
      name: 'TIHLDE',
      key: 'tihlde',
      feed: 'http://tihlde.org/feed/',
      logo: './org/tihlde/logo.png',
      symbol: './org/tihlde/symbol.png',
      placeholder: './org/tihlde/placeholder.png',
      color: 'blue',
      useAltLink: false,
    },
    'tim og shænko': {
      name: 'Tim & Shænko',
      key: 'tim og shænko',
      feed: 'http://bygging.no/feed/',
      logo: './org/tim og shænko/logo.png',
      symbol: './org/tim og shænko/symbol.png',
      placeholder: './org/tim og shænko/placeholder.png',
      color: 'blue',
      useAltLink: false,
    },
    'tjsf': {
      name: 'TJSF',
      key: 'tjsf',
      feed: 'http://tjsf.no/feed/',
      logo: './org/tjsf/logo.png',
      symbol: './org/tjsf/symbol.png',
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
      symbol: './org/dusken/symbol.png',
      placeholder: './org/dusken/placeholder.png',
      color: 'grå',
      useAltLink: false,
    },
    'universitetsavisa': {
      name: 'Universitetsavisa',
      key: 'universitetsavisa',
      feed: 'http://www.universitetsavisa.no/?service=rss',
      logo: './org/universitetsavisa/logo.png',
      symbol: './org/universitetsavisa/symbol.png',
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
      symbol: './org/samfundet/symbol.png',
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
      symbol: './org/velferdstinget/symbol.png',
      placeholder: './org/velferdstinget/placeholder.png',
      color: 'cyan',
      useAltLink: false,
    },
    'studenttinget ntnu': {
      name: 'Studenttinget NTNU',
      key: 'studenttinget ntnu',
      feed: 'http://www.studenttinget.no/feed/',
      logo: './org/studenttinget ntnu/logo.png',
      symbol: './org/studenttinget ntnu/symbol.png',
      placeholder: './org/studenttinget ntnu/placeholder.png',
      color: 'red',
      useAltLink: false,
    },
    'studentparlamentet hist': {
      name: 'Studentparlamentet HiST',
      key: 'studentparlamentet hist',
      feed: 'http://studentparlamentet.com/?feed=rss2',
      logo: './org/studentparlamentet hist/logo.png',
      symbol: './org/studentparlamentet hist/symbol.png',
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
      symbol: './org/ntnu/symbol.png',
      placeholder: './org/ntnu/placeholder.png',
      color: 'blue',
      useAltLink: false,
    },
    'rektoratet ntnu': {
      name: 'Rektoratet NTNU',
      key: 'rektoratet ntnu',
      feed: 'http://www.ntnu.no/blogger/rektoratet/feed/',
      logo: './org/rektoratet ntnu/logo.png',
      symbol: './org/rektoratet ntnu/symbol.png',
      placeholder: './org/rektoratet ntnu/placeholder.png',
      color: 'blue',
      useAltLink: false,
    },
    'hist': {
      name: 'HiST',
      key: 'hist',
      feed: 'http://hist.no/rss.ap?thisId=1393',
      logo: './org/hist/logo.png',
      symbol: './org/hist/symbol.png',
      placeholder: './org/hist/placeholder.png',
      color: 'blue',
      useAltLink: false,
    },
    'dmmh': {
      name: 'DMMH',
      key: 'dmmh',
      feed: 'http://www.dmmh.no/rss.php?type=site&id=10&location=393',
      logo: './org/dmmh/logo.png',
      symbol: './org/dmmh/symbol.png',
      placeholder: './org/dmmh/placeholder.png',
      color: 'red',
      useAltLink: false,
    },
  },

}