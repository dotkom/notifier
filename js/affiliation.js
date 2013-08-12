var Affiliation = {
  
  debug: 0,
  
  // IMPORTANT: Keep the same order here as in options.html and in manifest.json

  // Explanation of organization attributes:

  // name: 'Organization X',
  // key: 'orgx',
  // web: 'https://orgx.com',
  // feed: 'https://orgx.com/feed',
  // logo: './org/orgx/logo.png',               // 512x128 transparent logo, for dark background
  // icon: './org/orgx/icon.png',               //  38x38  transparent icon, for extension icon
  // symbol: './org/orgx/symbol.png',           // 256x256 symbol, big version of the icon
  // placeholder: './org/orgx/placeholder.png', // 512x384 placeholder, used when news images is loading
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
    'abakus': {
      name: 'Abakus',
      key: 'abakus',
      web: 'http://abakus.no/',
      // feed not available, use getNews instead
      logo: './org/abakus/logo.png',
      icon: './org/abakus/icon.png',
      symbol: './org/abakus/symbol.png',
      placeholder: './org/abakus/placeholder.png',
      palette: 'red',
      useAltLink: false,
      // getImages unnecessary, images are extracted from the source code
      getNews: function(limit, callback) {
        if (typeof callback == 'undefined') {
          console.log('ERROR: callback is required');
          return;
        }
        var self = this;
        Ajaxer.getHtml({
          url: self.web,
          success: function(html) {
            html = html.trim(); // Why all the newlines in the start of the file? jQuery doesn't liek dat.
            var posts = [];
            var count = 0;
            // Add each item from news tags
            if ($(html).find('.article').length != 0) {
              $(html).find('.article').each( function() {
                if (count++ < limit) {
                  var post = {};
                  
                  // The popular fields
                  post.title = $(this).find("h2").filter(':first').text();
                  post.link = $(this).find("a").filter(':first').attr('href');
                  post.description = $(this).find(".introtext p").filter(':first').text();
                  // Less used fields
                  post.creator = self.name;
                  post.date = ''
                  // Locally stored
                  post.image = $(this).find("img").filter(':first').attr('src');
                  // Tag the posts with the key and name of the feed they came from
                  post.feedKey = self.key;
                  post.feedName = self.name;

                  // Link fixing
                  post.link = 'http://abakus.no' + post.link;
                  if (typeof post.image != 'undefined')
                    post.image = 'http://abakus.no' + post.image;
                  else
                    post.image = self.placeholder;

                  posts.push(post);
                }
              });
            }
            else {
              if (self.debug) console.log('ERROR: No articles found at', self.web);
            }
            callback(posts);
          },
          error: function(e) {
            if (self.debug) console.log('ERROR: could not fetch '+self.name+' website');
          },
        });
      },
    },
    'aarhonen': {
      name: 'H.M. Aarhønen',
      key: 'aarhonen',
      web: 'http://www.aarhonen.ntnu.no/',
      feed: 'http://www.aarhonen.ntnu.no/?q=rss.xml',
      logo: './org/aarhonen/logo.png',
      icon: './org/aarhonen/icon.png',
      symbol: './org/aarhonen/symbol.png',
      placeholder: './org/aarhonen/placeholder.png',
      palette: 'purple',
      useAltLink: false,
      getImage: function(link, callback) {
        Affiliation.getImages(this, link, callback, {newsSelector:'div.content'});
      },
    },
    'alf': {
      name: 'Alf',
      key: 'alf',
      web: 'http://org.ntnu.no/alf/',
      feed: 'http://org.ntnu.no/alf/?feed=rss2',
      logo: './org/alf/logo.png',
      icon: './org/alf/icon.png',
      symbol: './org/alf/symbol.png',
      placeholder: './org/alf/placeholder.png',
      palette: 'green',
      useAltLink: false,
      getImages: function(link, callback) {
        Affiliation.getImages(this, link, callback);
      },
    },
    'berg': {
      name: 'Bergstuderendes Forening',
      key: 'berg',
      web: 'http://bergstud.no/',
      feed: 'http://bergstud.no/feed/',
      logo: './org/berg/logo.png',
      icon: './org/berg/icon.png',
      symbol: './org/berg/symbol.png',
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
      web: 'http://www.deltahouse.no/',
      feed: 'http://www.deltahouse.no/?feed=rss2',
      logo: './org/delta/logo.png',
      icon: './org/delta/icon.png',
      symbol: './org/delta/symbol.png',
      placeholder: './org/delta/placeholder.png',
      palette: 'green',
      useAltLink: false,
      hardwareFeatures: true,
      coffeeApi: 'http://informatikk.org/delta/coffee.txt',
      lightApi: 'http://informatikk.org/delta/lys.txt',
      eventApi: 'http://informatikk.org/delta/office_status.txt',
      servantApi: 'http://informatikk.org/delta/servant_list.txt',
      meetingsApi: 'http://informatikk.org/delta/meeting_plan.txt',
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
      },
    },
    'emil': {
      name: 'EMIL',
      key: 'emil',
      web: 'http://emilweb.no/',
      feed: 'http://emilweb.no/feed/',
      logo: './org/emil/logo.png',
      icon: './org/emil/icon.png',
      symbol: './org/emil/symbol.png',
      placeholder: './org/emil/placeholder.png',
      palette: 'green',
      useAltLink: false,
      getImages: function(link, callback) {
        Affiliation.getImages(this, link, callback, {newsSelector:'div.frontpage'});
      },
    },
    'entreprenoerskolen': {
      name: 'Entreprenørskolen',
      key: 'entreprenoerskolen',
      web: 'http://entreprenorskolen.no/',
      feed: 'http://entreprenorskolen.no/feed/',
      logo: './org/entreprenoerskolen/logo.png',
      icon: './org/entreprenoerskolen/icon.png',
      symbol: './org/entreprenoerskolen/symbol.png',
      placeholder: './org/entreprenoerskolen/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImage: function(links, callback) {
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
      symbol: './org/hybrida/symbol.png',
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
      symbol: './org/leonardo/symbol.png',
      placeholder: './org/leonardo/placeholder.png',
      palette: 'cyan',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback, {newsSelector:'div.post_wrapper', linkDelimiter:'?'});
      },
    },
    'mannhullet': {
      name: 'Mannhullet',
      key: 'mannhullet',
      web: 'http://mannhullet.no/',
      feed: 'http://mannhullet.no/index.php?format=feed&type=rss',
      logo: './org/mannhullet/logo.png',
      icon: './org/mannhullet/icon.png',
      symbol: './org/mannhullet/symbol.png',
      placeholder: './org/mannhullet/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImage: function(links, callback) {
        Affiliation.getImages(this, links, callback, {newsSelector:'div#container', imageIndex: 1});
      },
    },
    'online': {
      name: 'Online',
      key: 'online',
      web: 'https://online.ntnu.no/',
      feed: 'https://online.ntnu.no/feeds/news/',
      logo: './org/online/logo.png',
      icon: './org/online/icon.png',
      symbol: './org/online/symbol.png',
      placeholder: './org/online/placeholder.png',
      palette: 'online',
      palettePath: './org/online/palette.css',
      useAltLink: true,
      hardwareFeatures: true,
      coffeeApi: 'http://draug.online.ntnu.no/coffee.txt',
      lightApi: 'http://draug.online.ntnu.no/lys.txt',
      eventApi: 'https://online.ntnu.no/service_static/office_status',
      servantApi: 'https://online.ntnu.no/service_static/servant_list',
      meetingsApi: 'https://online.ntnu.no/service_static/meeting_plan',
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
              if (Affiliation.debug) console.log('ERROR: no image exists for id: ' + id);
              callback(link, placeholder);
            }
          },
          error: function() {
            if (Affiliation.debug) console.log('ERROR: couldn\'t connect API to get image links, returning default image');
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
      symbol: './org/nabla/symbol.png',
      placeholder: './org/nabla/placeholder.png',
      palette: 'red',
      useAltLink: false,
      getImage: function(link, callback) {
        Affiliation.getImages(this, link, callback, {newsSelector:'div.row div.span8 div.row div.span8', domainUrl:'nabla.no'});
      },
    },
    'spanskroeret': {
      name: 'Spanskrøret',
      key: 'spanskroeret',
      web: 'http://spanskroret.no/',
      feed: 'http://spanskroret.no/feed/',
      logo: './org/spanskroeret/logo.png',
      icon: './org/spanskroeret/icon.png',
      symbol: './org/spanskroeret/symbol.png',
      placeholder: './org/spanskroeret/placeholder.png',
      palette: 'green',
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
      symbol: './org/volvox/symbol.png',
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
      symbol: './org/de folkevalgte/symbol.png',
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
      symbol: './org/dhs/symbol.png',
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
      symbol: './org/dionysos/symbol.png',
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
      symbol: './org/erudio/symbol.png',
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
      symbol: './org/eureka/symbol.png',
      placeholder: './org/eureka/placeholder.png',
      palette: 'blue',
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
      symbol: './org/geolf/symbol.png',
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
      symbol: './org/gengangere/symbol.png',
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
      symbol: './org/jump cut/symbol.png',
      placeholder: './org/jump cut/placeholder.png',
      palette: 'grey',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
      },
    },
    'kwakiutl': {
      name: 'Kwakiutl',
      key: 'kwakiutl',
      web: 'http://sosantntnu.wordpress.com/',
      feed: 'http://sosantntnu.wordpress.com/feed/',
      logo: './org/kwakiutl/logo.png',
      icon: './org/kwakiutl/icon.png',
      symbol: './org/kwakiutl/symbol.png',
      placeholder: './org/kwakiutl/placeholder.png',
      palette: 'kwakiutl',
      palettePath: './org/kwakiutl/palette.css',
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
      symbol: './org/ludimus/symbol.png',
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
      symbol: './org/paideia/symbol.png',
      placeholder: './org/paideia/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
      },
    },
    'panoptikon': {
      name: 'Panoptikon',
      key: 'panoptikon',
      web: 'http://panoptikon.blogg.no/',
      feed: 'http://feeds.blogg.no/259521/post.rss',
      logo: './org/panoptikon/logo.png',
      icon: './org/panoptikon/icon.png',
      symbol: './org/panoptikon/symbol.png',
      placeholder: './org/panoptikon/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
      },
    },
    'pareto': {
      name: 'Pareto',
      key: 'pareto',
      web: 'http://pareto-ntnu.no/',
      feed: 'http://pareto-ntnu.no/?format=feed&type=rss',
      logo: './org/pareto/logo.png',
      icon: './org/pareto/icon.png',
      symbol: './org/pareto/symbol.png',
      placeholder: './org/pareto/placeholder.png',
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
      symbol: './org/primetime/symbol.png',
      placeholder: './org/primetime/placeholder.png',
      palette: 'cyan',
      useAltLink: false,
      getImage: function(link, callback) {
        Affiliation.getImages(this, link, callback);
      },
    },
    'psi': {
      name: 'Psi',
      key: 'psi',
      web: 'http://psilinjeforening.wordpress.com/',
      feed: 'http://psilinjeforening.wordpress.com/feed/',
      logo: './org/psi/logo.png',
      icon: './org/psi/icon.png',
      symbol: './org/psi/symbol.png',
      placeholder: './org/psi/placeholder.png',
      palette: 'red',
      useAltLink: false,
      getImages: function(link, callback) {
        Affiliation.getImages(this, link, callback);
      },
    },
    'sturm und drang': {
      name: 'Sturm Und Drang',
      key: 'sturm und drang',
      web: 'http://www.sturm.ntnu.no/',
      feed: 'http://www.sturm.ntnu.no/wordpress/?feed=rss2',
      logo: './org/sturm und drang/logo.png',
      icon: './org/sturm und drang/icon.png',
      symbol: './org/sturm und drang/symbol.png',
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
      symbol: './org/fraktur/symbol.png',
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
      symbol: './org/kom/symbol.png',
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
      symbol: './org/logistikkstudentene/symbol.png',
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
      symbol: './org/tihlde/symbol.png',
      placeholder: './org/tihlde/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImages: function(links, callback) {
        Affiliation.getImages(this, links, callback);
      },
    },
    'tim og shaenko': {
      name: 'Tim & Shænko',
      key: 'tim og shaenko',
      web: 'http://bygging.no/',
      feed: 'http://bygging.no/feed/',
      logo: './org/tim og shaenko/logo.png',
      icon: './org/tim og shaenko/icon.png',
      symbol: './org/tim og shaenko/symbol.png',
      placeholder: './org/tim og shaenko/placeholder.png',
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
      symbol: './org/tjsf/symbol.png',
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
      symbol: './org/isu/symbol.png',
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
      symbol: './org/projeksjon/symbol.png',
      placeholder: './org/projeksjon/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImage: function(link, callback) {
        Affiliation.getImages(this, link, callback);
      },
    },
    // 'signifikant': {
    //   name: 'Signifikant',
    //   key: 'signifikant',
    //   web: 'http://org.ntnu.no/signifikant/',
    //   feed: 'http://org.ntnu.no/signifikant/?q=rss.xml',
    //   logo: './org/signifikant/logo.png',
    //   icon: './org/signifikant/icon.png',
    //   symbol: './org/signifikant/symbol.png',
    //   placeholder: './org/signifikant/placeholder.png',
    //   palette: 'cyan',
    //   useAltLink: false,
    //   getImages: function(links, callback) {
    //     Affiliation.getImages(this, links, callback);
    //   },
    // },
    'soma': {
      name: 'Soma',
      key: 'soma',
      web: 'http://somantnu.blogspot.com/',
      feed: 'http://somantnu.blogspot.com/feeds/posts/default',
      logo: './org/soma/logo.png',
      icon: './org/soma/icon.png',
      symbol: './org/soma/symbol.png',
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
      symbol: './org/symbiosis/symbol.png',
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
      symbol: './org/dusken/symbol.png',
      placeholder: './org/dusken/placeholder.png',
      palette: 'grey',
      useAltLink: false,
      getImage: function(link, callback) {
        // Affiliation.getImages(this, links, callback, {newsSelector:'section.articlepreview', domainUrl:'dusken.no'});
        // Using getImage instead because Dusken posts the article to the RSS feed before the frontpage.
        // Affiliation.getImages(this, link, callback, {newsSelector:'section.article', domainUrl:'dusken.no'});
        Affiliation.getImages(this, link, callback, {newsSelector:'div.span8', domainUrl:'dusken.no'});
      },
    },
    'universitetsavisa': {
      name: 'Universitetsavisa',
      key: 'universitetsavisa',
      web: 'http://www.universitetsavisa.no/',
      feed: 'http://www.universitetsavisa.no/?service=rss',
      logo: './org/universitetsavisa/logo.png',
      icon: './org/universitetsavisa/icon.png',
      symbol: './org/universitetsavisa/symbol.png',
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
      symbol: './org/gemini/symbol.png',
      placeholder: './org/gemini/placeholder.png',
      palette: 'cyan',
      useAltLink: false,
      // getImages unnecessary, Gemini uses <bilde>-tag for images
    },
    'adressa': {
      name: 'Adresseavisen',
      key: 'adressa',
      web: 'http://adressa.no/',
      feed: 'http://www.adressa.no/?widgetName=polarisFeeds&widgetId=3185248&getXmlFeed=true',
      logo: './org/adressa/logo.png',
      icon: './org/adressa/icon.png',
      symbol: './org/adressa/symbol.png',
      placeholder: './org/adressa/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      // getImages unnecessary, Adresseavisen uses <enclosure>-tag, attribute "url", for images
    },

    // Store studentorganisasjoner
    'samfundet': {
      name: 'Studentersamfundet',
      key: 'samfundet',
      web: 'http://www.samfundet.no/',
      feed: 'http://www.samfundet.no/arrangement/rss',
      logo: './org/samfundet/logo.png',
      icon: './org/samfundet/icon.png',
      symbol: './org/samfundet/symbol.png',
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
      symbol: './org/velferdstinget/symbol.png',
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
      symbol: './org/studenttinget ntnu/symbol.png',
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
      symbol: './org/studentparlamentet hist/symbol.png',
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
      symbol: './org/ntnu/symbol.png',
      placeholder: './org/ntnu/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImage: function(link, callback) {
        if (link.indexOf('adressa.no') !== -1) {
          Affiliation.getImages(this, link, callback, {newsSelector:'div.media'});
        }
        else if (link.indexOf('bygg.no') !== -1) {
          Affiliation.getImages(this, link, callback, {newsSelector:'div#article'});
        }
        else if (link.indexOf('byggfakta.no') !== -1 || link.indexOf('byggaktuelt.no') !== -1) {
          Affiliation.getImages(this, link, callback, {newsSelector:'div.body-content'});
        }
        else if (link.indexOf('dn.no') !== -1) {
          Affiliation.getImages(this, link, callback, {newsSelector:'div#content'});
        }
        else if (link.indexOf('forskningsradet.no') !== -1) {
          Affiliation.getImages(this, link, callback, {newsSelector:'article', domainUrl:'www.forskningsradet.no'});
        }
        else if (link.indexOf('npolar.no') !== -1) {
          Affiliation.getImages(this, link, callback, {newsSelector:'div.paragraph', domainUrl:'www.npolar.no'});
        }
        else if (link.indexOf('nrk.no') !== -1) {
          Affiliation.getImages(this, link, callback, {newsSelector:'figure', noscriptMatching:/src="(http:\/\/gfx.nrk.no\/\/[a-zA-Z0-9]+)"/});
        }
        else if (link.indexOf('regjeringen.no') !== -1) {
          Affiliation.getImages(this, link, callback, {newsSelector:'div.imagecontainer', domainUrl:'regjeringen.no'});
        }
        else if (link.indexOf('stfk.no') !== -1) {
          Affiliation.getImages(this, link, callback, {newsSelector:'div.documentbody', domainUrl:'www.stfk.no'});
        }
        else if (link.indexOf('trondheim.kommune.no') !== -1) {
          Affiliation.getImages(this, link, callback, {domainUrl:'www.trondheim.kommune.no'});
        }
        else if (link.indexOf('tu.no') !== -1) {
          Affiliation.getImages(this, link, callback, {newsSelector:'div#topImage'});
        }
        else if (link.indexOf('utdanningsnytt.no') !== -1) {
          Affiliation.getImages(this, link, callback, {newsSelector:'div#hovedartikkelContainer', domainUrl:'utdanningsnytt.no'});
        }
        else {
          // Just try something, might work!
          Affiliation.getImages(this, link, callback);
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
      symbol: './org/rektoratet ntnu/symbol.png',
      placeholder: './org/rektoratet ntnu/placeholder.png',
      palette: 'blue',
      useAltLink: false,
      getImage: function(link, callback) {
        Affiliation.getImages(this, link, callback, {newsSelector:'div.entry'});
      },
    },
    'hist': {
      name: 'HiST',
      key: 'hist',
      web: 'http://hist.no/',
      feed: 'http://hist.no/rss.ap?thisId=1393',
      logo: './org/hist/logo.png',
      icon: './org/hist/icon.png',
      symbol: './org/hist/symbol.png',
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
      symbol: './org/dmmh/symbol.png',
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
    //   newsSelector: 'div.news_item', // if website uses uncommon selectors for news containers it must be defined here
    //   domainUrl: 'hybrida.no', // if website uses relative links, split by this url and search for last part of the link
    //   linkDelimiter: '?', // if the link contains parameter data which isn't used in the on-site link, trash the parameter data after this specified delimiter
    //   imageIndex: 2, // if the first picture in each post is a bad fit, use the one at specified index, note that this is zero-indexed
    // };

    // Create empty object to avoid crashes when looking up undefined props of undefined object
    if (options == undefined)
      options = {};

    var url = affiliation.web;
    var isSingleLink = false;
    if (typeof links == 'string') {
      url = links;
      // If links is just a single link, convert to single item array
      links = [links];
      isSingleLink = true;
    }

    // Array of possible news containers sorted by estimated probabilty
    var containers = [
      'div.entry',
      'div.post', // some blogs have div.entry inside a div.post, therefore we check div.entry first
      'article', // leave <article> at the bottom of the preferred list, it's a bit misused
    ];
    
    // In case we don't find any images, prepare an array with placeholders
    var placeholder = affiliation.placeholder;
    var placeholders = []
    for (var i=0; i<links.length; i++)
      placeholders.push(placeholder);

    // If jQuery or Ajaxer.js is not loaded yet, just return placeholders
    if (typeof $ == 'undefined' || typeof Ajaxer == 'undefined') {
      if (this.debug) console.log('ERROR: getImages called before $ and Ajaxer was ready');
      return placeholders;
    }

    var self = this;
    Ajaxer.getHtml({
      url: url,
      success: function(html) {
        try {
          // jQuery 1.9+ does not consider pages starting with a newline as HTML, first char should be "<"
          html = $.trim(html);
          // jQuery tries to preload images found in the string, the following line causes errors, ignore it for now
          var doc = $(html);

          //
          // Decide which selector to use for identifying news containers
          //

          var newsSelector = null;
          if (options.newsSelector) {
            newsSelector = options.newsSelector;
            if (self.debug) console.log('Using selector', '"'+newsSelector+'" for news at '+url+'\n');
          }
          else {
            for (var i=0; i<containers.length; i++) {
              var current = containers[i];
              if (doc.find(current).length != 0) {
                newsSelector = current;
                if (self.debug) console.log('Using selector', '"'+current+'" for news at '+url+'\n');
                break;
              }
            }
          }

          // A place to store all the image links
          var images = [];

          for (i in links) {

            //
            // Find the news container which contains the news image, using our selector
            //
            
            var link = links[i];

            if (self.debug) console.log('Checking for '+(isSingleLink? 'image at' : 'posts with link'), link);

            // If posts are using relative links, split by domainUrl, like 'hist.no'
            if (options.domainUrl) {
              if (self.debug) console.log('Splitting link by domain url', options.domainUrl);
              link = links[i].split(options.domainUrl)[1];
            }

            // Trash link suffix data (found after delimiter) which is included in some news feeds for the sake of statistics and such
            if (options.linkDelimiter) {
              if (self.debug) console.log('Splitting link by delimiter', options.linkDelimiter);
              link = links[i].split(options.linkDelimiter)[0];
            }

            // Look up the first post with the link inside it...
            image = doc.find(newsSelector + ' a[href="' + link + '"]');

            // ...then find parent 'article' or 'div.post' or the like...
            if (image.length != 0) {
              if (self.debug) console.log('Found something with the link, finding the parent (the news box');
              image = image.parents(newsSelector);
            }
            // ...unless we didn't find anything with the link, in which case we just look for the news selector
            else if (isSingleLink) {
              if (self.debug) console.log('Found nothing with a[href=url], trying news selector instead');
              // On a specific news page (not a frontpage) we can allow ourselves to search
              // more broadly if we didn't find anything while searching for the link. We'll
              // search for the newsSelector instead and assume that the first news container
              // we find contains the image we're looking for (which is highly likely based
              // on experience).
              image = doc.find(newsSelector);
            }

            //
            // Presumably we've found the news container here, now we need to find the image within it
            //

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

              // Exclude social image icons (only applies for some blogs)
              image = image.not('img[src*="sociable"]');
              
              // Use image at specified index if requested
              if (options.imageIndex)
                image = image.eq(options.imageIndex);

              // Get the src for the first image left in the array
              image = image.attr('src');
            }

            //
            // Here we determine whether we have found an image or not, and callback the image or a placeholder
            //

            // If image is undefined
            if (typeof image == 'undefined') {
              if (self.debug) console.log('No image exists for link', link);
              image = placeholder;
            }
            // If image needs to be prefixed with the domain name
            else if (options.domainUrl) {
              image = 'http://' + options.domainUrl + image;
              if (self.debug) console.log('Found a good image at', image);
            }
            // If image is something useless like "//assets.pinterest.com/whatever.png"
            // NOTE: Must be done after adding "http" and domainUrl
            else if (image.match('^https?://') == null) {
              if (self.debug) console.log('No good image exists for link', link);
              image = placeholder;
            }
            // If all is good
            else {
              if (self.debug) console.log('Found a good image at', image);
            }
            if (self.debug) console.log('\n');

            images.push(image);
          }
          callback(links, images);
        }
        catch (e) {
          if (self.debug) console.log('ERROR: could not parse '+affiliation.name+' website');
          callback(links, placeholders);
        }
      },
      error: function(e) {
        if (self.debug) console.log('ERROR: could not fetch '+affiliation.name+' website');
        callback(links, placeholders);
      },
    });
  },

}
