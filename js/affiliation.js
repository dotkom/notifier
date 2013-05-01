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
  // getImages: function(links, callback) {},   // getImages will be used if it exists

  // Standard dimensions:

  // logo         512 x 128, at least 256 x 64
  // icon         256 x 256, at least  64 x 64
  // placeholder  512 x 384, at least 128 x 96
  // All dimensions should be in the power of two in case we decide to
  // introduce some fancy WebGL graphics later on.

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
        Affiliation.getImages(this, link, callback);
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
      getImages: function(link, callback) {
        Affiliation.getImages(this, link, callback, {newsSelector:'div.frontpage'});
      },
    },
    'entreprenorskolen': {
      name: 'Entreprenørskolen',
      key: 'entreprenorskolen',
      web: 'http://entreprenorskolen.no/',
      feed: 'http://entreprenorskolen.no/feed/',
      logo: './org/entreprenorskolen/logo.png',
      icon: './org/entreprenorskolen/icon.png',
      placeholder: './org/entreprenorskolen/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
      },
    },
    'hybrida': {
      name: 'Hybrida',
      key: 'hybrida',
      web: 'http://hybrida.no/',
      feed: 'http://hybrida.no/newsfeed/rss',
      logo: './org/hybrida/logo.png',
      icon: './org/hybrida/icon.png',
      placeholder: './org/hybrida/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImages: function(link, callback) {
        Affiliation.getImages(this, link, callback, {newsSelector:'div.element', domainUrl:'hybrida.no'});
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
        Affiliation.getImages(this, links, callback, {newsSelector:'div.post_wrapper', linkDelimiter:'?'});
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
        Affiliation.getImages(this, links, callback, {newsSelector:'.news_item', domainUrl:'nabla.no'});
      },
    },
    'spanskroret': {
      name: 'Spanskrøret',
      key: 'spanskroret',
      web: 'http://spanskroret.no/',
      feed: 'http://spanskroret.no/feed/',
      logo: './org/spanskroret/logo.png',
      icon: './org/spanskroret/icon.png',
      placeholder: './org/spanskroret/placeholder.png',
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
        Affiliation.getImages(this, links, callback);
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
    'dhs': {
      name: 'Det Historiske Selskab',
      key: 'dhs',
      web: 'http://ntnuhistorie.wordpress.com/',
      feed: 'http://ntnuhistorie.wordpress.com/feed/',
      logo: './org/dhs/logo.png',
      icon: './org/dhs/icon.png',
      placeholder: './org/dhs/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImage: function(links, callback) {
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
      getImage: function(links, callback) {
        Affiliation.getImages(this, links, callback);
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
        Affiliation.getImages(this, links, callback);
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
    'paideia': {
      name: 'Paideia',
      key: 'paideia',
      web: 'http://paideiantnu.wordpress.com/',
      feed: 'http://paideiantnu.wordpress.com/rss',
      logo: './org/paideia/logo.png',
      icon: './org/paideia/icon.png',
      placeholder: './org/paideia/placeholder.png',
      palette: 'blue',
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
        Affiliation.getImages(this, links, callback);
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
        Affiliation.getImages(this, links, callback);
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
        Affiliation.getImages(this, links, callback);
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
        Affiliation.getImages(this, links, callback);
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
        Affiliation.getImages(this, links, callback);
      },
    },

    // Masterforeninger, doktorforeninger, internasjonale foreninger
    'isu': {
      name: 'International Student Union',
      key: 'isu',
      web: 'http://org.ntnu.no/isu/',
      feed: 'http://org.ntnu.no/isu/feed/',
      logo: './org/isu/logo.png',
      icon: './org/isu/icon.png',
      placeholder: './org/isu/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
      },
    },
    'projeksjon': {
      name: 'Projeksjon',
      key: 'projeksjon',
      web: 'http://projeksjon.no/',
      feed: 'http://projeksjon.no/feed/',
      logo: './org/projeksjon/logo.png',
      icon: './org/projeksjon/icon.png',
      placeholder: './org/projeksjon/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
      },
    },
    'soma': {
      name: 'Soma',
      key: 'soma',
      web: 'http://somantnu.blogspot.com/',
      feed: 'http://somantnu.blogspot.com/feeds/posts/default',
      logo: './org/soma/logo.png',
      icon: './org/soma/icon.png',
      placeholder: './org/soma/placeholder.png',
      palette: 'cyan',
      useAltLink: false,
      // getImages unnecessary, images are extracted from HTML in entries
    },
    'symbiosis': {
      name: 'Symbiosis',
      key: 'symbiosis',
      web: 'http://www.ntnusymbiosis.com/',
      feed: 'http://www.ntnusymbiosis.com/feed/',
      logo: './org/symbiosis/logo.png',
      icon: './org/symbiosis/icon.png',
      placeholder: './org/symbiosis/placeholder.png',
      palette: 'green',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
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
      palette: 'grey',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback, {newsSelector:'section.articlepreview', domainUrl:'dusken.no'});
      },
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
      // getImages unnecessary, Universitetsavisa uses <enclosure>-tag for images
    },
    'gemini': {
      name: 'Gemini',
      key: 'gemini',
      web: 'http://gemini.no/',
      feed: 'http://gemini.no/feed/',
      logo: './org/gemini/logo.png',
      icon: './org/gemini/icon.png',
      placeholder: './org/gemini/placeholder.png',
      palette: 'cyan',
      useAltLink: false,
      // getImages unnecessary, Gemini uses <bilde>-tag for images
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
        Affiliation.getImages(this, link, callback, {newsSelector:'div#banner'});
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
      getImage: function(link, callback) {
        Affiliation.getImages(this, link, callback, {newsSelector:'#innhold'});
      },
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
        Affiliation.getImages(this, links, callback);
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
        if (link.indexOf('tu.no') !== -1) {
          Affiliation.getImages(this, link, callback, {newsSelector:'div#topImage'});
        }
        else if (link.indexOf('adressa.no') !== -1) {
          Affiliation.getImages(this, link, callback, {newsSelector:'div.media'});
        }
        else if (link.indexOf('stfk.no') !== -1) {
          Affiliation.getImages(this, link, callback, {newsSelector:'div.documentbody', domainUrl:'www.stfk.no'});
        }
        else if (link.indexOf('nrk.no') !== -1) {
          Affiliation.getImages(this, link, callback, {newsSelector:'figure', noscriptMatching:/src="(http:\/\/gfx.nrk.no\/\/[a-zA-Z0-9]+)"/});
        }
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
        Affiliation.getImages(this, link, callback);
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
        Affiliation.getImages(this, links, callback, {newsSelector:'div.unit', domainUrl:'hist.no'});
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
        Affiliation.getImages(this, link, callback, {newsSelector:'div.news_article', domainUrl:'dmmh.no'});
      },
    },
  },

  getImages: function(affiliation, links, callback, options) {

    // Possible values in options:
    // options = {
    //   newsSelector: 'div.news_item', // if website uses unpopuplar selectors for news containers it must be defined here
    //   domainUrl: 'hybrida.no', // if website uses relative links, split by this url and search for last part of the link
    //   linkDelimiter: '?', // if the link contains parameter data which isn't used in the on-site link, trash the parameter data after this specified delimiter
    //   imageIndex: 2, // if the first picture in each post is a bad fit, use the one at specified index, note that this is zero-indexed
    // };

    // Create empty object to avoid crashes when looking up undefined props of undefined object
    if (options == undefined)
      options = {};

    var url = affiliation.web;
    if (typeof links == 'string') {
      url = links;
      // If links is just a single link, convert to single item array
      links = [links];
    }

    // Array of possible news containers sorted by estimated probabilty
    var containers = [
      'article',
      'div.post',
      'div.entry',
    ];
    
    // In case we don't find any images, prepare an array with placeholders
    var placeholder = affiliation.placeholder;
    var placeholders = []
    for (var i=0; i<links.length; i++)
      placeholders.push(placeholder);

    Ajaxer.getHtml({
      url: url,
      success: function(html) {
        try {
          // jQuery 1.9+ does not consider pages starting with a newline as HTML, first char should be "<"
          html = $.trim(html);
          // jQuery tries to preload images found in the string, the following line causes errors, ignore it for now
          var doc = $(html);

          // Decide which selector to use for identifying news containers
          var newsSelector = null;
          if (options.newsSelector) {
            newsSelector = options.newsSelector;
          }
          else {
            for (var i=0; i<containers.length; i++) {
              var current = containers[i];
              if (doc.find(current).length != 0) {
                newsSelector = current;
                if (top.debug) console.log('Selector for news on remote site is', current);
                break;
              }
            }
          }

          // A place to store all the image links
          var images = [];

          for (i in links) {
            
            var link = links[i];

            // If posts are using relative links, split by domainUrl, like 'hist.no'
            if (options.domainUrl)
              link = links[i].split(options.domainUrl)[1];

            // Trash link suffix data (found after delimiter) which is included in some news feeds for the sake of statistics and such
            if (options.linkDelimiter)
              link = links[i].split(options.linkDelimiter)[0];

            // Look up the first post with the link inside it
            image = doc.find(newsSelector + ' a[href="' + link + '"]');

            // Find parent 'article' or 'div.post' or the like
            if (image.length != 0) {
              image = image.parents(newsSelector);
            }
            else {
              image = doc.find(newsSelector);
            }

            if (options.noscriptMatching) {
              // If a <noscript> tag is used, we'll just find the image URL by matching
              // NOTE: This is for very special cases only! Like NRK.no, lulz @ nrk
              image = image.html().match(options.noscriptMatching)[1];
            }
            else {
              // Find all image tags within post
              image = image.find('img');
              
              // Exclude gifs since they're most likely smilies and the likes
              image = image.not('img[src*=".gif"]');
              image = image.not('img[src*="data:image/gif"]');
              
              // Use image at specified index if requested
              if (options.imageIndex)
                image = image.eq(options.imageIndex);

              // Get the src for the first image left in the array
              image = image.attr('src');
            }

            if (image == undefined) {
              if (top.debug) console.log('ERROR: no image exists for link', link);
              image = placeholder;
            }
            else if (options.domainUrl) {
              image = 'http://' + options.domainUrl + image;
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
