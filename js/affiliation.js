"use strict";

var Affiliation = {

  // API
  api: API_SERVER_1 + 'affiliation/',
  // Messages
  msgUnsupportedAffiliation: 'Tilhørigheten støttes ikke',
  msgConnectionError: 'Frakoblet fra Notiwire',
  msgError: {
    'meeting': 'Feil i møtedata',
    'servant': 'Feil i kontorvaktdata',
    'coffee': 'Feil i kaffedata',
    'status': 'Feil i kontorstatusdata',
  },

  // Basic statuses have titles and messages (icons are fetched from affiliation)
  statuses: {
    'error': {title: 'Oops', color: 'LightGray', message: 'Klarte ikke hente kontorstatus'},
    'open': {title: 'Åpent', color: 'LimeGreen', message: 'Velkommen inn!'},
    'closed': {title: 'Lukket', color: 'yellow', message: 'Finn et komitemedlem'},
    'meeting': {title: 'Møte', color: 'red', message: 'Kontoret er opptatt'}, // meetings usually get message from calendar entries
  },
  // Food statuses have titles and icons (messages exist as calendar titles)
  foods: {
    'bun': {title: 'Boller', color: 'NavajoWhite', icon: './img/icon-bun.png', image: './img/image-bun.png'},
    'cake': {title: 'Kake', color: 'NavajoWhite', icon: './img/icon-cake.png', image: './img/image-cake.png'},
    'coffee': {title: 'Kaffekos', color: 'NavajoWhite', icon: './img/icon-coffee.png'},
    'pizza': {title: 'Pizza', color: 'NavajoWhite', icon: './img/icon-pizza.png', image: './img/image-pizza.png'},
    'taco': {title: 'Taco', color: 'NavajoWhite', icon: './img/icon-taco.png', image: './img/image-taco.png'},
    'waffle': {title: 'Vafler', color: 'NavajoWhite', icon: './img/icon-waffle.png', image: './img/image-waffle.png'},
  },
  
  // IMPORTANT: Keep the same order of affiliations here as <select> in popup.html

  // Explanation of organization attributes:

  // name: 'Organization X',
  // key: 'orgx',
  // web: 'https://orgx.com',
  // feed: 'https://orgx.com/feed',               // ALTERNATIVE: Use either 'feed' or 'getNews', not both
  // logo: './org/orgx/logo.png',                 // 512x128 transparent white logo, for dark backgrounds
  // icon: './org/orgx/icon.png',                 //  76x76  transparent icon, for extension icon
  // symbol: './org/orgx/symbol.png',             // 256x256 transparent symbol, big version of the icon with ~20% empty padding
  // placeholder: './org/orgx/placeholder.png',   // 512x256 placeholder, used when news images is loading, standard was previously 512x384
  // sponsor: './org/orgx/sponsor.png',           // 512x128 sponsor logo, replaces the affiliation logo in the corner of the infoscreen
  // palette: 'orgx',                             // The color palette to use, if special palette exists use orgx-key
  // palettePath: './org/orgx/palette.css',       // OPTIONAL: Path to the special palette
  // slack: 'https://orgx.slack.com/signup',      // OPTIONAL: add Slack button to the popup
  // hardware: {                                  // OPTIONAL: Has hardwarefeatures?
  //   office: "orgxkontoret",                    // OPTIONAL: Friendly name for the affiliation office
  //   statusIcons: {
  //     open: './org/orgx/icon.png',
  //     closed: './org/orgx/icon.png',
  //     meeting: './org/orgx/icon.png',
  //   },
  //   statusMessages: {                          // OPTIONAL: separate statusmessages for this affiliation's office
  //     open: 'Velkommen inn!',
  //     closed: 'Få tilgang av kontorsjef',
  //     meeting: 'Kontoret er helt opptatt!',
  //   },
  //   memePath: './org/orgx/meme/',              // OPTIONAL: pictures in /orgx/meme/ with the format 1...N.png
  // },
  // news: {
  //   type: "feed",                              // types: "feed" (RSS/Atom), "json" (API), "website" (scraping)
  //   scrape: function(json, limit, callback) {},// ONLY for types "website"
  //   api: "http://orgx.com/feed",               // ONLY for types "json"
  //   parse: function(html, limit, callback) {}, // ONLY for types "json"
  //   feed: "http://orgx.com/feed",              // ONLY for types "feed"
  //   imageScraping: {options...},               // OPTIONAL, for all news types, see Images.js for the different options
  //   imageScraping: {},                         // SEE ABOVE, if you want scraping, but it works without options, then just use empty object like this
  // }

  // Other notes:
  // - Image dimensions should be in the power of two in case we decide to use WebGL one day.

  org: {

    //
    // DEBUG, a debug affiliation that fetches data from Notiwire when DEBUG is enabled
    //

    'DEBUG': {
      name: 'DEBUG',
      key: 'DEBUG',
      web: 'http://example.com/',
      logo: './org/DEBUG/logo.png',
      icon: './org/DEBUG/icon.png',
      symbol: './org/DEBUG/symbol.png',
      placeholder: './org/DEBUG/placeholder.png',
      palette: 'grey',
      slack: 'https://onlinentnu.slack.com/signup',
      hardware: {
        office: 'DEBUG-kontoret',
        statusIcons: {
          open: './org/DEBUG/icon-open.png',
          closed: './org/DEBUG/icon-closed.png',
          meeting: './org/DEBUG/icon-meeting.png',
        },
      },
      news: {
        type: 'feed',
        feed: 'http://dusken.no/feed/',
        imageScraping: {directHit:'img#header-img', domainUrl:'dusken.no'},
      },
    },

    //
    // Linjeforeninger Gløshaugen
    //
    
    'abakus': {
      name: 'Abakus',
      key: 'abakus',
      web: 'http://abakus.no/',
      logo: './org/abakus/logo.png',
      icon: './org/abakus/icon.png',
      symbol: './org/abakus/symbol.png',
      placeholder: './org/abakus/placeholder.png',
      palette: 'red',
      slack: 'https://abakus-ntnu.slack.com/signup',
      hardware: {
        office: "Abakuskontoret",
        statusIcons: {
          // TODO: update when Abakus gets office status feature
          open: './org/abakus/icon.png', //'./org/abakus/icon-open.png',
          closed: './org/abakus/icon.png', //'./org/abakus/icon-closed.png',
          meeting: './org/abakus/icon.png', //'./org/abakus/icon-meeting.png',
        },
        memePath: './org/abakus/meme/',
        memeCount: 3,
      },
      news: {
        type: 'website',
        scrape: function(html, limit, callback) {
          var aff = Affiliation.org['abakus'];
          var count = 0;
          var posts = [];
          // Add each item from news tags
          if ($(html).find('.article').length != 0) {
            $(html).find('.article').each(function() {
              if (count < limit) {
                var post = {};
                // The popular fields
                post.title = $(this).find("h2").filter(':first').text();
                post.link = $(this).find("a").filter(':first').attr('href');
                post.description = $(this).find(".introtext p").filter(':first').text();
                post.image = $(this).find("pic").filter(':first').attr('src');
                // Link fixing
                post.link = 'http://abakus.no' + post.link;
                // Image fixing
                if (typeof post.image != 'undefined') {
                  post.image = 'http://abakus.no' + post.image;
                }
                else {
                  post.image = aff.placeholder;
                }
                posts[count++] = post;
              }
            });
          }
          else {
            console.error('No articles found at', aff.web);
          }
          callback(posts);
        },
      },
    },

    'aarhonen': {
      name: 'H.M. Aarhønen',
      key: 'aarhonen',
      web: 'http://aarhonen.no/',
      logo: './org/aarhonen/logo.png',
      icon: './org/aarhonen/icon.png',
      symbol: './org/aarhonen/symbol.png',
      placeholder: './org/aarhonen/placeholder.png',
      palette: 'purple',
      news: {
        type: 'feed',
        feed: 'http://aarhonen.no/feed/',
        imageScraping: {},
      },
    },

    'berg': {
      name: 'Bergstuderendes Forening',
      key: 'berg',
      web: 'http://bergstud.no/',
      logo: './org/berg/logo.png',
      icon: './org/berg/icon.png',
      symbol: './org/berg/symbol.png',
      placeholder: './org/berg/placeholder.png',
      palette: 'grey',
      news: {
        type: 'feed',
        feed: 'http://bergstud.no/feed/',
        imageScraping: {},
      },
    },

    'broderskabet': {
      name: 'Broderskabet',
      key: 'broderskabet',
      web: 'http://broderskabet.no/',
      logo: './org/broderskabet/logo.png',
      icon: './org/broderskabet/icon.png',
      symbol: './org/broderskabet/symbol.png',
      placeholder: './org/broderskabet/placeholder.png',
      palette: 'grey',
      news: {
        type: 'feed',
        feed: 'http://broderskabet.no/feed/',
        imageScraping: {},
      },
    },

    'delta': {
      name: 'Delta',
      key: 'delta',
      web: 'http://www.deltahouse.no/',
      logo: './org/delta/logo.png',
      icon: './org/delta/icon.png',
      symbol: './org/delta/symbol.png',
      placeholder: './org/delta/placeholder.png',
      palette: 'green',
      hardware: {
        office: 'Deltakontoret',
        statusIcons: {
          open: './org/delta/icon-open.png',
          closed: './org/delta/icon-closed.png',
          meeting: './org/delta/icon-meeting.png',
        },
        memePath: './org/delta/meme/',
        memeCount: 1,
      },
      news: {
        type: 'feed',
        feed: 'http://www.deltahouse.no/?feed=rss2',
        imageScraping: {},
      },
    },

    'emil': {
      name: 'EMIL',
      key: 'emil',
      web: 'http://emilweb.no/',
      logo: './org/emil/logo.png',
      icon: './org/emil/icon.png',
      symbol: './org/emil/symbol.png',
      placeholder: './org/emil/placeholder.png',
      palette: 'green',
      news: {
        type: 'feed',
        feed: 'http://emilweb.no/feed/',
        imageScraping: {newsSelector:'div.frontpage'},
      },
    },

    'hc': {
      name: 'Høiskolens Chemikerforening',
      key: 'hc',
      web: 'https://chemie.no/',
      logo: './org/hc/logo.png',
      icon: './org/hc/icon.png',
      symbol: './org/hc/symbol.png',
      placeholder: './org/hc/placeholder.png',
      palette: 'yellow',
      hardware: {
        office: 'HC-kontoret',
        statusIcons: {
          open: './org/hc/icon-open.png',
          closed: './org/hc/icon-closed.png',
          meeting: './org/hc/icon-meeting.png',
        },
        statusMessages: {
          open: 'Velkommen inn!',
          closed: 'Finn et komitemedlem for å åpne',
          meeting: 'Kontoret er opptatt',
        },
        memePath: './org/hc/meme/',
        memeCount: 2,
      },
      news: {
        type: 'feed',
        feed: 'https://chemie.no/feed/',
        // Images extracted from feed
      },
    },

    'hybrida': {
      name: 'Hybrida',
      key: 'hybrida',
      web: 'http://hybrida.no/',
      logo: './org/hybrida/logo.png',
      icon: './org/hybrida/icon.png',
      symbol: './org/hybrida/symbol.png',
      placeholder: './org/hybrida/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'http://hybrida.no/newsfeed/rss',
        imageScraping: {newsSelector:'div.headerImage', domainUrl:'hybrida.no'},
      },
    },

    'janus': {
      name: 'Janus',
      key: 'janus',
      web: 'http://www.januslinjeforening.no/',
      logo: './org/janus/logo.png',
      icon: './org/janus/icon.png',
      symbol: './org/janus/symbol.png',
      placeholder: './org/janus/placeholder.png',
      palette: 'blue',
      news: {
        type: 'website',
        scrape: function(html, limit, callback) { 
          var aff = Affiliation.org['janus'];
          var count = 0;
          var posts = [];
          // Add each item from news tags
          if ($(html).find('div.feature').length != 0) {
            $(html).find('div.feature').each( function() {
              if (count < limit) {
                var post = {};
                // The popular fields
                post.title = $(this).find("h6").filter(':first').text();
                post.link = $(this).find("a").attr('href');
                post.description = "";
                post.image = $(this).find("pic").filter(':first').attr('src');
                // Author field
                post.creator = $(this).find("em").filter(':first').text();
                post.creator = post.creator.split(",")[0];
                // Link fixing
                post.link = 'http://www.januslinjeforening.no' + post.link;
                // Image fixing
                if (typeof post.image != 'undefined') {
                  post.image = 'http://www.januslinjeforening.no' + post.image;
                }
                else {
                  post.image = aff.placeholder;
                }
                posts[count++] = post;
              }
            });
          }
          else {
            console.error('No articles found at', aff.web);
          }
          callback(posts);
        },
      },
    },

    'leonardo': {
      name: 'Leonardo',
      key: 'leonardo',
      web: 'http://industrielldesign.com/',
      logo: './org/leonardo/logo.png',
      icon: './org/leonardo/icon.png',
      symbol: './org/leonardo/symbol.png',
      placeholder: './org/leonardo/placeholder.png',
      palette: 'cyan',
      news: {
        type: 'feed',
        feed: 'http://industrielldesign.com/feed',
        imageScraping: {newsSelector:'.content-wrapper', imageIndex: 1},
      },
    },

    'mannhullet': {
      name: 'Mannhullet',
      key: 'mannhullet',
      web: 'http://mannhullet.no/',
      logo: './org/mannhullet/logo.png',
      icon: './org/mannhullet/icon.png',
      symbol: './org/mannhullet/symbol.png',
      placeholder: './org/mannhullet/placeholder.png',
      palette: 'blue',
      news: {
        type: 'website',
        scrape: function(html, limit, callback) {
          var aff = Affiliation.org['mannhullet'];
          var count = 0;
          var posts = [];
          // Add each item from news tags
          if ($(html).find('div.post').length != 0) {
            $(html).find('div.post').each( function() {
              if (count < limit) {
                var post = {};
                // The popular fields
                post.title = $(this).find("h3").text();
                post.link = $(this).find("a:first").attr('href');
                post.description = $(this).find("p").eq(1).text();
                post.image = $(this).find("pic:first").attr('src');
                // Link fixing
                post.link = 'http://mannhullet.no' + post.link;
                // Image fixing
                if (typeof post.image !== 'undefined') {
                  post.image = 'http://mannhullet.no' + post.image;
                }
                else {
                  post.image = aff.placeholder;
                }
                posts[count++] = post;
              }
            });
          }
          else {
            console.error('No articles found at', aff.web);
          }
          callback(posts);
        },
      },
    },

    'omega': {
      name: 'Omega',
      key: 'omega',
      web: 'http://omega.ntnu.no/',
      logo: './org/omega/logo.png',
      icon: './org/omega/icon.png',
      symbol: './org/omega/symbol.png',
      placeholder: './org/omega/placeholder.png',
      palette: 'grey',
      news: {
        type: 'website',
        scrape: function(html, limit, callback) {
          var aff = Affiliation.org['omega'];
          var count = 0;
          var posts = [];
          // Add each item from news tags
          if ($(html).find('div.news').length != 0) {
            $(html).find('div.news').each( function() {
              if (count < limit) {
                var post = {};
                // The popular fields
                post.title = $(this).find('h5 a').text();
                post.link = $(this).find('h5 a').attr('href');
                post.description = $(this).eq(0).find('div:first').text().trim().replace(/\s+/g, ' ');
                post.author = $(this).next().find('span i').text().trim();
                post.image = $(this).find('pic').attr('src');
                // Link fixing
                post.link = 'http://omega.ntnu.no' + post.link;
                // Image fixing
                if (typeof post.image === 'undefined') {
                  post.image = aff.placeholder;
                }
                else {
                  post.image = aff.web + post.image;
                }
                posts[count++] = post;
              }
            });
          }
          else {
            console.error('No articles found at', aff.web);
          }
          callback(posts);
        },
      },
    },

    'omegav': { // Subaffiliation of Omega
      name: 'Omega Verksted',
      key: 'omegav',
      web: 'http://omegav.no/',
      logo: './org/omegav/logo.png',
      icon: './org/omegav/icon.png',
      symbol: './org/omegav/symbol.png',
      placeholder: './org/omegav/placeholder.png',
      palette: 'grey',
      news: {
        type: 'feed',
        feed: 'http://omegav.no/newsrss',
        imageScraping: {},
      },
    },

    'online': {
      name: 'Online',
      key: 'online',
      web: 'https://online.ntnu.no',
      logo: './org/online/logo.png',
      icon: './org/online/icon.png',
      symbol: './org/online/symbol.png',
      placeholder: './org/online/placeholder.png',
      sponsor: './org/online/sponsor.png',
      palette: 'online',
      palettePath: './org/online/palette.css',
      slack: 'https://onlinentnu.slack.com/signup',
      hardware: {
        office: 'Onlinekontoret',
        statusIcons: {
          open: './org/online/icon-open.png',
          closed: './org/online/icon-closed.png',
          meeting: './org/online/icon-meeting.png',
        },
        statusMessages: {
          open: 'Gratis kaffe og te til alle!',
          closed: 'Finn et komitemedlem',
          meeting: 'Kontoret er opptatt',
        },
        memePath: './org/online/meme/',
        memeCount: 5,
      },
      news: {
        type: "json",
        url: "https://online.ntnu.no/api/v0/article/all/?format=json",
        parse: function(json, limit, callback) {
          var aff = Affiliation.org['online'];
          var posts = [];
          var count = 0;
          var articles = json.articles;
          if (articles) {
            // Add each article from the API...
            for (var i in articles) {
              if (count < 10) {
                var article = articles[i];
                var post = {};
                post.title = article.heading;
                post.link = aff.web + article.absolute_url;
                post.description = article.content;
                post.creator = article.author.first_name + ' ' + article.author.last_name;
                post.date = article.created_date;
                post.image = aff.web + article.image_article_front_featured;
                // Remove markdown from description (somewhat crude method)
                post.description = post.description.replace(/(####|###|\*\*)/gi, '');
                post.description = post.description.replace(/\[(.*)\]\(.*\)/gi, '$1');
                // Push and increment
                posts.push(post);
                count++;
              }
            }
          }
          else {
            console.error('No articles found at', aff.web);
          }
          callback(posts);
        },
      },
    },

    'nabla': {
      name: 'Nabla',
      key: 'nabla',
      web: 'http://nabla.no/',
      logo: './org/nabla/logo.png',
      icon: './org/nabla/icon.png',
      symbol: './org/nabla/symbol.png',
      placeholder: './org/nabla/placeholder.png',
      palette: 'red',
      hardware: {
        office: 'Nablakontoret',
        statusIcons: {
          open: './org/nabla/icon-open.png',
          closed: './org/nabla/icon-closed.png',
          meeting: './org/nabla/icon-meeting.png',
        },
        statusMessages: {
          open: 'Velkommen inn!',
          closed: 'Finn et komitemedlem for å åpne kontoret',
          meeting: 'Det er møte på møterommet',
        },
        memePath: './org/nabla/meme/',
      },
      news: {
        type: 'feed',
        feed: 'http://nabla.no/feed/',
        imageScraping: {newsSelector:'div.row div.col-md-8', domainUrl:'nabla.no'},
      },
    },

    'placebo': {
      name: 'MF Placebo',
      key: 'placebo',
      web: 'http://mfplacebo.no/',
      logo: './org/placebo/logo.png',
      icon: './org/placebo/icon.png',
      symbol: './org/placebo/symbol.png',
      placeholder: './org/placebo/placeholder.png',
      palette: 'red',
      news: {
        type: 'feed',
        feed: 'http://mfplacebo.no/feed/',
        imageScraping: {newsSelector:'article'},
      },
    },

    'smorekoppen': {
      name: 'A/F Smørekoppen',
      key: 'smorekoppen',
      web: 'http://www.smorekoppen.no/',
      logo: './org/smorekoppen/logo.png',
      icon: './org/smorekoppen/icon.png',
      symbol: './org/smorekoppen/symbol.png',
      placeholder: './org/smorekoppen/placeholder.png',
      palette: 'red',
      news: {
        type: 'website',
        scrape: function(html, limit, callback) {
          var aff = Affiliation.org['smorekoppen'];
          var count = 0;
          var posts = [];
          // Add each item from news tags
          if ($(html).find('li[id^="article-"]').length != 0) {
            $(html).find('li[id^="article-"]').each( function() {
              if (count < limit) {
                var post = {};
                // The popular fields
                post.title = $(this).find('h2 a').text();
                post.link = $(this).find('h2 a').attr('href');
                post.description = $(this).eq(0).find('p.subline').text().trim().replace(/\s+/g, ' ');
                post.author = $(this).next().find('p.subline').text().trim();
                post.image = $(this).find('pic').attr('src');
                // Author fixing
                post.author = post.author.match(/[a-zæøå\-'_]+ [a-zæøå\-'_]+/i);
                if (post.author !== null) {
                  post.author = post.author[0];
                }
                else {
                  post.author = 'A/F Smørekoppen';
                }
                // Image fixing
                if (typeof post.image === 'undefined') {
                  post.image = aff.placeholder;
                }
                else {
                  post.image = aff.web + post.image;
                }
                posts[count++] = post;
              }
            });
          }
          else {
            console.error('No articles found at', aff.web);
          }
          callback(posts);
        },
        imageScraping: {newsSelector:'div#main', domainUrl:'smorekoppen.no/'},
      },
    },

    'industrivinduet': { // Subaffiliation of A/F Smørekoppen
      name: 'Industrivinduet',
      key: 'industrivinduet',
      web: 'http://www.smorekoppen.no/?subsite=industrivinduet',
      logo: './org/industrivinduet/logo.png',
      icon: './org/industrivinduet/icon.png',
      symbol: './org/industrivinduet/symbol.png',
      placeholder: './org/industrivinduet/placeholder.png',
      palette: 'blue',
      news: {
        type: 'website',
        scrape: function(html, limit, callback) {
          var aff = Affiliation.org['industrivinduet'];
          var count = 0;
          var posts = [];
          // Add each item from news tags
          if ($(html).find('li[id^="article-"]').length != 0) {
            $(html).find('li[id^="article-"]').each( function() {
              if (count < limit) {
                var post = {};
                // The popular fields
                post.title = $(this).find('h2 a').text();
                post.link = $(this).find('h2 a').attr('href');
                post.description = $(this).eq(0).find('p.subline').text().trim().replace(/\s+/g, ' ');
                post.author = $(this).next().find('p.subline').text().trim();
                post.image = $(this).find('pic').attr('src');
                // Author fixing
                post.author = post.author.match(/[a-zæøå\-'_]+ [a-zæøå\-'_]+/i);
                if (post.author !== null) {
                  post.author = post.author[0];
                }
                else {
                  post.author = 'Industrivinduet';
                }
                // Image fixing
                if (typeof post.image === 'undefined') {
                  post.image = aff.placeholder;
                }
                else {
                  // Add domain URL because it's missing.
                  // Add "whatever=.jpg" to help the image past Images.control
                  post.image = 'http://smorekoppen.no/' + post.image + '&isimage=.jpg';
                }
                posts[count++] = post;
              }
            });
          }
          else {
            console.error('No articles found at', aff.web);
          }
          callback(posts);
        },
      },
    },

    'solan': {
      name: 'Solan',
      key: 'solan',
      web: 'http://solanlinjeforening.no',
      logo: './org/solan/logo.png',
      icon: './org/solan/icon.png',
      symbol: './org/solan/symbol.png',
      placeholder: './org/solan/placeholder.png',
      palette: 'blue',
      hardware: {
        office: "Solanstua",
        statusIcons: {
          open: './org/solan/icon-open.png',
          closed: './org/solan/icon-closed.png',
          meeting: './org/solan/icon-meeting.png',
        },
        statusMessages: {
          open: 'Lyset er på ved kaffemaskinen :)',
          closed: 'Det er mørkt ved kaffemaskinen :(',
          meeting: 'Møterommet er opptatt',
        },
        memePath: './org/solan/meme/',
      },
      news: {
        type: 'feed',
        feed: 'http://www.solanlinjeforening.no/feed/',
        imageScraping: {},
      },
    },

    'spanskroeret': {
      name: 'Spanskrøret',
      key: 'spanskroeret',
      web: 'http://spanskroret.no/',
      logo: './org/spanskroeret/logo.png',
      icon: './org/spanskroeret/icon.png',
      symbol: './org/spanskroeret/symbol.png',
      placeholder: './org/spanskroeret/placeholder.png',
      palette: 'green',
      news: {
        type: 'feed',
        feed: 'http://spanskroret.no/feed/',
        imageScraping: {},
      },
    },

    'timini': {
      name: 'Timini',
      key: 'timini',
      web: 'https://www.timini.no/',
      logo: './org/timini/logo.png',
      icon: './org/timini/icon.png',
      symbol: './org/timini/symbol.png',
      placeholder: './org/timini/placeholder.png',
      palette: 'cyan',
      news: {
        type: 'website',
        scrape: function(html, limit, callback) {
          var aff = Affiliation.org['timini'];
          var count = 0;
          var posts = [];
          // Add each item from news tags
          if ($(html).find('article').length != 0) {
            $(html).find('article').each( function() {
              if (count < limit) {
                var post = {};
                // The popular fields
                post.title = $(this).find("h1").filter(':first').text();
                post.link = $(this).find("h1 a").attr('href');
                post.description = $(this).find("div.news-content").filter(':first').text();
                post.image = $(this).find("pic").filter(':first').attr('src');
                // Author field
                post.creator = $(this).find("div.frontpage-metadata").filter(':first').text();
                try {
                  var creator = $(this).find("div.frontpage-metadata").filter(':first').text();
                  post.creator = creator.match(/Publisert av (.*?) i /)[1].replace(/  /g, " ");
                } catch (e) {
                  post.creator = "Timini";
                }
                posts[count++] = post;
              }
            });
          }
          else {
            console.error('No articles found at', aff.web);
          }
          callback(posts);
        },
      },
    },

    'volvox': {
      name: 'Volvox & Alkymisten',
      key: 'volvox',
      web: 'http://volvox.no/',
      logo: './org/volvox/logo.png',
      icon: './org/volvox/icon.png',
      symbol: './org/volvox/symbol.png',
      placeholder: './org/volvox/placeholder.png',
      palette: 'green',
      news: {
        type: 'feed',
        feed: 'http://org.ntnu.no/volvox/feed/',
        imageScraping: {},
      },
    },

    //
    // Linjeforeninger Dragvoll
    //

    'caf': {
      name: 'CAF',
      key: 'caf',
      web: 'https://cafidrett.wordpress.com/',
      logo: './org/caf/logo.png',
      icon: './org/caf/icon.png',
      symbol: './org/caf/symbol.png',
      placeholder: './org/caf/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'https://cafidrett.wordpress.com/feed/',
        imageScraping: {},
      },
    },

    'communitas': {
      name: 'Communitas',
      key: 'communitas',
      web: 'http://sosantntnu.wordpress.com/',
      logo: './org/communitas/logo.png',
      icon: './org/communitas/icon.png',
      symbol: './org/communitas/symbol.png',
      placeholder: './org/communitas/placeholder.png',
      palette: 'cyan',
      news: {
        type: 'feed',
        feed: 'http://sosantntnu.wordpress.com/feed/',
        imageScraping: {},
      },
    },

    'dhs': {
      name: 'Det Historiske Selskab',
      key: 'dhs',
      web: 'http://ntnuhistorie.wordpress.com/',
      logo: './org/dhs/logo.png',
      icon: './org/dhs/icon.png',
      symbol: './org/dhs/symbol.png',
      placeholder: './org/dhs/placeholder.png',
      palette: 'purple',
      news: {
        type: 'feed',
        feed: 'http://ntnuhistorie.wordpress.com/feed/',
        imageScraping: {},
      },
    },

    'dionysos': {
      name: 'Dionysos',
      key: 'dionysos',
      web: 'http://dionysosntnu.wordpress.com/',
      logo: './org/dionysos/logo.png',
      icon: './org/dionysos/icon.png',
      symbol: './org/dionysos/symbol.png',
      placeholder: './org/dionysos/placeholder.png',
      palette: 'purple',
      news: {
        type: 'feed',
        feed: 'http://dionysosntnu.wordpress.com/feed/',
        imageScraping: {},
      },
    },

    'erudio': {
      name: 'Erudio',
      key: 'erudio',
      web: 'http://erudiontnu.blogspot.com/',
      logo: './org/erudio/logo.png',
      icon: './org/erudio/icon.png',
      symbol: './org/erudio/symbol.png',
      placeholder: './org/erudio/placeholder.png',
      palette: 'red',
      news: {
        type: 'feed',
        feed: 'http://erudiontnu.blogspot.com/feeds/posts/default?alt=rss',
        imageScraping: {},
      },
    },

    'eureka': {
      name: 'Eureka',
      key: 'eureka',
      web: 'http://eurekalf.wordpress.com/',
      logo: './org/eureka/logo.png',
      icon: './org/eureka/icon.png',
      symbol: './org/eureka/symbol.png',
      placeholder: './org/eureka/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'http://eurekalf.wordpress.com/feed/',
        imageScraping: {},
      },
    },

    'geolf': {
      name: 'Geolf',
      key: 'geolf',
      web: 'http://geolf.org/',
      logo: './org/geolf/logo.png',
      icon: './org/geolf/icon.png',
      symbol: './org/geolf/symbol.png',
      placeholder: './org/geolf/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'http://geolf.org/feed/',
        imageScraping: {},
      },
    },

    'gengangere': {
      name: 'Gengangere',
      key: 'gengangere',
      web: 'http://www.gengangere.no/',
      logo: './org/gengangere/logo.png',
      icon: './org/gengangere/icon.png',
      symbol: './org/gengangere/symbol.png',
      placeholder: './org/gengangere/placeholder.png',
      palette: 'grey',
      news: {
        type: 'feed',
        feed: 'http://www.gengangere.no/feed/',
        imageScraping: {},
      },
    },

    'jump_cut': {
      name: 'Jump Cut',
      key: 'jump_cut',
      web: 'http://jumpcutdragvoll.wordpress.com/',
      logo: './org/jump cut/logo.png',
      icon: './org/jump cut/icon.png',
      symbol: './org/jump cut/symbol.png',
      placeholder: './org/jump cut/placeholder.png',
      palette: 'grey',
      news: {
        type: 'feed',
        feed: 'http://jumpcutdragvoll.wordpress.com/feed/',
        imageScraping: {},
      },
    },

    'paideia': {
      name: 'Paideia',
      key: 'paideia',
      web: 'http://paideiantnu.wordpress.com/',
      logo: './org/paideia/logo.png',
      icon: './org/paideia/icon.png',
      symbol: './org/paideia/symbol.png',
      placeholder: './org/paideia/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'http://paideiantnu.wordpress.com/rss',
        imageScraping: {},
      },
    },

    'panoptikon': {
      name: 'Panoptikon',
      key: 'panoptikon',
      web: 'http://panoptikonlinjeforening.wordpress.com/',
      logo: './org/panoptikon/logo.png',
      icon: './org/panoptikon/icon.png',
      symbol: './org/panoptikon/symbol.png',
      placeholder: './org/panoptikon/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'http://panoptikonlinjeforening.wordpress.com/feed/',
        imageScraping: {},
      },
    },

    'pareto': {
      name: 'Pareto',
      key: 'pareto',
      web: 'http://pareto-ntnu.no/',
      logo: './org/pareto/logo.png',
      icon: './org/pareto/icon.png',
      symbol: './org/pareto/symbol.png',
      placeholder: './org/pareto/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'http://pareto-ntnu.no/?format=feed&type=rss',
        // Images extracted from feed
      },
    },

    'primetime': {
      name: 'Primetime',
      key: 'primetime',
      web: 'http://www.primetime.trondheim.no/',
      logo: './org/primetime/logo.png',
      icon: './org/primetime/icon.png',
      symbol: './org/primetime/symbol.png',
      placeholder: './org/primetime/placeholder.png',
      palette: 'cyan',
      news: {
        type: 'feed',
        feed: 'http://www.primetime.trondheim.no/feed/',
        imageScraping: {},
      },
    },

    'psi': {
      name: 'PSI',
      key: 'psi',
      web: 'http://www.psintnu.no/',
      logo: './org/psi/logo.png',
      icon: './org/psi/icon.png',
      symbol: './org/psi/symbol.png',
      placeholder: './org/psi/placeholder.png',
      palette: 'red',
      news: {
        type: 'website',
        scrape: function(html, limit, callback) {
          var aff = Affiliation.org['psi'];
          var count = 0;
          var posts = [];
          // Add each item from news tags
          if ($(html).find('div#main-wrap div.paragraph').length != 0) {
            $(html).find('div#main-wrap div.paragraph').each(function() {
              if (count < limit) {
                var post = {};
                // The popular fields
                post.title = $(this).find('strong').text();
                post.link = aff.web; // All articles are just on their frontpage
                post.description = $(this).find('font').eq(1).text();
                post.author = 'PSI';
                post.image = aff.placeholder;
                posts[count++] = post;
              }
            });
          }
          else {
            console.error('No articles found at', aff.web);
          }
          callback(posts);
        },
      },
    },

    'psykolosjen': {
      name: 'Psykolosjen',
      key: 'psykolosjen',
      web: 'http://psykolosjen.no/',
      logo: './org/psykolosjen/logo.png',
      icon: './org/psykolosjen/icon.png',
      symbol: './org/psykolosjen/symbol.png',
      placeholder: './org/psykolosjen/placeholder.png',
      palette: 'blue',
      news: {
        type: 'website',
        scrape: function(html, limit, callback) {
          var aff = Affiliation.org['psykolosjen'];
          var count = 0;
          var posts = [];
          // Add each item from news tags
          if ($(html).find('#articles').children().length != 0) {
            $(html).find('#articles').children().each( function() {
              if (count < limit) {
                var post = {};
                // The popular fields
                post.title = $(this).find('.articleBody h2 a').text();
                post.link = $(this).find('.articleBody h2 a').prop('href');
                post.description = $(this).find('.articleBody p:first span').text();
                post.author = $(this).find('.articleMeta').find('a:first').text();
                post.image = $(this).find('.articleBody pic').attr('src');
                if (typeof post.image === 'undefined') {
                  post.image = aff.placeholder;
                }
                posts[count++] = post;
              }
            });
          }
          else {
            console.error('No articles found at', aff.web);
          }
          callback(posts);
        },
      },
    },

    'sturm_und_drang': {
      name: 'Sturm Und Drang',
      key: 'sturm_und_drang',
      web: 'http://www.sturm.ntnu.no/',
      logo: './org/sturm und drang/logo.png',
      icon: './org/sturm und drang/icon.png',
      symbol: './org/sturm und drang/symbol.png',
      placeholder: './org/sturm und drang/placeholder.png',
      palette: 'red',
      news: {
        type: 'feed',
        feed: 'http://www.sturm.ntnu.no/wordpress/?feed=rss2',
        imageScraping: {},
      },
    },

    'teaterlosjen': {
      name: 'Teaterlosjen',
      key: 'teaterlosjen',
      web: 'http://teaterlosjen.wordpress.com/',
      logo: './org/teaterlosjen/logo.png',
      icon: './org/teaterlosjen/icon.png',
      symbol: './org/teaterlosjen/symbol.png',
      placeholder: './org/teaterlosjen/placeholder.png',
      palette: 'red',
      news: {
        type: 'feed',
        feed: 'http://teaterlosjen.wordpress.com/feed/',
        imageScraping: {},
      },
      // TODO: This, alternate feeds per organization
      // altFeeds: {
      //   'Universitetsteatret': 'http://universitetsteatret.wordpress.com/feed/',
      // },
    },
    'universitetsteatret': {
      name: 'Universitetsteatret',
      key: 'universitetsteatret',
      web: 'http://universitetsteatret.wordpress.com',
      logo: './org/universitetsteatret/logo.png',
      icon: './org/universitetsteatret/icon.png',
      symbol: './org/universitetsteatret/symbol.png',
      placeholder: './org/universitetsteatret/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'http://universitetsteatret.wordpress.com/feed/',
        imageScraping: {},
      },
    },

    'theodor': {
      name: 'Theodor',
      key: 'theodor',
      web: 'http://lftheodor.no/',
      logo: './org/theodor/logo.png',
      icon: './org/theodor/icon.png',
      symbol: './org/theodor/symbol.png',
      placeholder: './org/theodor/placeholder.png',
      palette: 'red',
      news: {
        type: 'feed',
        feed: 'http://lftheodor.no/index.php/component/k2/itemlist?format=feed&moduleID=148',
        // Images extracted from feed
      },
    },

    //
    // Linjeforeninger HiST/DMMH/TJSF/BI
    //

    'kom': {
      name: 'KOM',
      key: 'kom',
      web: 'http://kjemiogmaterial.wordpress.com/',
      logo: './org/kom/logo.png',
      icon: './org/kom/icon.png',
      symbol: './org/kom/symbol.png',
      placeholder: './org/kom/placeholder.png',
      palette: 'cyan',
      news: {
        type: 'feed',
        feed: 'http://kjemiogmaterial.wordpress.com/feed/',
        imageScraping: {},
      },
    },

    'logistikkstudentene': {
      name: 'Logistikkstudentene',
      key: 'logistikkstudentene',
      web: 'http://logistikkstudentene.no/',
      logo: './org/logistikkstudentene/logo.png',
      icon: './org/logistikkstudentene/icon.png',
      symbol: './org/logistikkstudentene/symbol.png',
      placeholder: './org/logistikkstudentene/placeholder.png',
      palette: 'cyan',
      news: {
        type: 'feed',
        feed: 'http://logistikkstudentene.no/?feed=rss2',
        imageScraping: {},
      },
    },

    'nutrix': {
      name: 'Nutrix',
      key: 'nutrix',
      web: 'http://nutrix.hist.no/',
      logo: './org/nutrix/logo.png',
      icon: './org/nutrix/icon.png',
      symbol: './org/nutrix/symbol.png',
      placeholder: './org/nutrix/placeholder.png',
      palette: 'green',
      news: {
        type: 'feed',
        feed: 'http://nutrix.hist.no/?feed=rss2',
        imageScraping: {},
      },
    },

    'sftoh': {
      name: 'STØH',
      key: 'sftoh',
      web: 'http://www.sftoh.no/',
      logo: './org/sftoh/logo.png',
      icon: './org/sftoh/icon.png',
      symbol: './org/sftoh/symbol.png',
      placeholder: './org/sftoh/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'http://www.sftoh.no/?feed=rss2',
        // Images extracted from feed
      },
    },

    'tihlde': {
      name: 'TIHLDE',
      key: 'tihlde',
      web: 'http://tihlde.org/',
      logo: './org/tihlde/logo.png',
      icon: './org/tihlde/icon.png',
      symbol: './org/tihlde/symbol.png',
      placeholder: './org/tihlde/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'http://tihlde.org/feed/',
        imageScraping: {},
      },
    },

    'tim_og_shaenko': {
      name: 'Tim & Shænko',
      key: 'tim_og_shaenko',
      web: 'http://bygging.no/',
      logo: './org/tim og shaenko/logo.png',
      icon: './org/tim og shaenko/icon.png',
      symbol: './org/tim og shaenko/symbol.png',
      placeholder: './org/tim og shaenko/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'http://bygging.no/feed/',
        imageScraping: {},
      },
    },

    'tjsf': {
      name: 'TJSF',
      key: 'tjsf',
      web: 'http://tjsf.no/',
      logo: './org/tjsf/logo.png',
      icon: './org/tjsf/icon.png',
      symbol: './org/tjsf/symbol.png',
      placeholder: './org/tjsf/placeholder.png',
      palette: 'grey',
      news: {
        type: 'feed',
        feed: 'http://tjsf.no/feed/',
        imageScraping: {},
      },
    },

    'vivas': {
      name: 'Vivas',
      key: 'vivas',
      web: 'http://vivas.hist.no/',
      logo: './org/vivas/logo.png',
      icon: './org/vivas/icon.png',
      symbol: './org/vivas/symbol.png',
      placeholder: './org/vivas/placeholder.png',
      palette: 'cyan',
      news: {
        type: 'feed',
        feed: 'http://vivas.hist.no/?feed=rss2',
        imageScraping: {newsSelector:'.post'},
      },
    },

    // Masterforeninger, doktorforeninger, internasjonale foreninger

    'dion': {
      name: 'DION',
      key: 'dion',
      web: 'http://www.dion.ntnu.no/',
      logo: './org/dion/logo.png',
      icon: './org/dion/icon.png',
      symbol: './org/dion/symbol.png',
      placeholder: './org/dion/placeholder.png',
      palette: 'cyan',
      news: {
        type: 'feed',
        feed: 'http://www.dion.ntnu.no/feed/',
        imageScraping: {},
      },
    },

    'esn': {
      name: 'ESN',
      key: 'esn',
      web: 'http://www.trondheim.esn.no/',
      logo: './org/esn/logo.png',
      icon: './org/esn/icon.png',
      symbol: './org/esn/symbol.png',
      placeholder: './org/esn/placeholder.png',
      palette: 'cyan',
      news: {
        type: 'feed',
        feed: 'http://www.trondheim.esn.no/rss.xml',
        imageScraping: {},
      },
    },

    'iaeste': {
      name: 'IAESTE',
      key: 'iaeste',
      web: 'http://iaeste.no/',
      logo: './org/iaeste/logo.png',
      icon: './org/iaeste/icon.png',
      symbol: './org/iaeste/symbol.png',
      placeholder: './org/iaeste/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'http://iaeste.no/wp/?feed=rss2',
        imageScraping: {},
      },
    },

    'isu': {
      name: 'International Student Union',
      key: 'isu',
      web: 'http://org.ntnu.no/isu/',
      logo: './org/isu/logo.png',
      icon: './org/isu/icon.png',
      symbol: './org/isu/symbol.png',
      placeholder: './org/isu/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'http://org.ntnu.no/isu/feed/',
        imageScraping: {},
      },
    },

    'projeksjon': {
      name: 'Projeksjon',
      key: 'projeksjon',
      web: 'http://projeksjon.no/',
      logo: './org/projeksjon/logo.png',
      icon: './org/projeksjon/icon.png',
      symbol: './org/projeksjon/symbol.png',
      placeholder: './org/projeksjon/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'http://projeksjon.no/feed/',
        imageScraping: {},
      },
    },

    'signifikant': {
      name: 'Signifikant',
      key: 'signifikant',
      web: 'http://org.ntnu.no/signifikant/',
      logo: './org/signifikant/logo.png',
      icon: './org/signifikant/icon.png',
      symbol: './org/signifikant/symbol.png',
      placeholder: './org/signifikant/placeholder.png',
      palette: 'cyan',
      news: {
        type: 'feed',
        feed: 'http://org.ntnu.no/signifikant/?feed=rss2',
        imageScraping: {}, // TODO: No image pattern on their website yet, check later
      },
    },

    'soma': {
      name: 'SOMA',
      key: 'soma',
      web: 'http://somantnu.blogspot.com/',
      logo: './org/soma/logo.png',
      icon: './org/soma/icon.png',
      symbol: './org/soma/symbol.png',
      placeholder: './org/soma/placeholder.png',
      palette: 'cyan',
      news: {
        type: 'feed',
        feed: 'http://somantnu.blogspot.com/feeds/posts/default',
        // Images extracted from feed
      },
    },

    'symbiosis': {
      name: 'Symbiosis',
      key: 'symbiosis',
      web: 'http://www.ntnusymbiosis.com/',
      logo: './org/symbiosis/logo.png',
      icon: './org/symbiosis/icon.png',
      symbol: './org/symbiosis/symbol.png',
      placeholder: './org/symbiosis/placeholder.png',
      palette: 'green',
      news: {
        type: 'feed',
        feed: 'http://www.ntnusymbiosis.com/feed/',
        imageScraping: {},
      },
    },

    //
    // Studentmedier
    //

    'dusken': {
      name: 'Dusken.no',
      key: 'dusken',
      web: 'http://dusken.no/',
      logo: './org/dusken/logo.png',
      icon: './org/dusken/icon.png',
      symbol: './org/dusken/symbol.png',
      placeholder: './org/dusken/placeholder.png',
      palette: 'grey',
      news: {
        type: 'feed',
        feed: 'http://dusken.no/feed/',
        imageScraping: {directHit:'img#header-img', domainUrl:'dusken.no'},
      },
    },

    'universitetsavisa': {
      name: 'Universitetsavisa',
      key: 'universitetsavisa',
      web: 'http://www.universitetsavisa.no/',
      logo: './org/universitetsavisa/logo.png',
      icon: './org/universitetsavisa/icon.png',
      symbol: './org/universitetsavisa/symbol.png',
      placeholder: './org/universitetsavisa/placeholder.png',
      palette: 'cyan',
      news: {
        type: 'feed',
        feed: 'http://www.universitetsavisa.no/?widgetName=polarisFeeds&widgetId=40853&getXmlFeed=true',
        // Images extracted from feed
      },
    },

    'gemini': {
      name: 'Gemini',
      key: 'gemini',
      web: 'http://gemini.no/',
      logo: './org/gemini/logo.png',
      icon: './org/gemini/icon.png',
      symbol: './org/gemini/symbol.png',
      placeholder: './org/gemini/placeholder.png',
      palette: 'cyan',
      news: {
        type: 'feed',
        feed: 'http://gemini.no/feed/',
        imageScraping: {newsSelector:'header.entry-header'},
      },
    },

    'adressa': {
      name: 'Adressa Student',
      key: 'adressa',
      web: 'http://adressa.no/',
      logo: './org/adressa/logo.png',
      icon: './org/adressa/icon.png',
      symbol: './org/adressa/symbol.png',
      placeholder: './org/adressa/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'http://www.adressa.no/student/?widgetName=polarisFeeds&widgetId=3185248&getXmlFeed=true',
        imageScraping: {newsSelector:'div.image.top'},
      },
    },

    //
    // Store studentorganisasjoner
    //

    'samfundet': {
      name: 'Studentersamfundet',
      key: 'samfundet',
      web: 'http://www.samfundet.no/',
      logo: './org/samfundet/logo.png',
      icon: './org/samfundet/icon.png',
      symbol: './org/samfundet/symbol.png',
      placeholder: './org/samfundet/placeholder.png',
      palette: 'red',
      news: {
        type: 'feed',
        feed: 'http://www.samfundet.no/arrangement/rss',
        // Images extracted from feed
      },
    },

    //
    // Studentdemokrati
    //

    'velferdstinget': {
      name: 'Velferdstinget',
      key: 'velferdstinget',
      web: 'http://www.velferdstinget.no/',
      logo: './org/velferdstinget/logo.png',
      icon: './org/velferdstinget/icon.png',
      symbol: './org/velferdstinget/symbol.png',
      placeholder: './org/velferdstinget/placeholder.png',
      palette: 'cyan',
      news: {
        type: 'feed',
        feed: 'http://www.velferdstinget.no/feed/rss/',
        imageScraping: {newsSelector:'#innhold'},
      },
    },

    'studenttinget_ntnu': {
      name: 'Studenttinget NTNU',
      key: 'studenttinget_ntnu',
      web: 'http://www.studenttinget.no/',
      logo: './org/studenttinget ntnu/logo.png',
      icon: './org/studenttinget ntnu/icon.png',
      symbol: './org/studenttinget ntnu/symbol.png',
      placeholder: './org/studenttinget ntnu/placeholder.png',
      palette: 'purple',
      news: {
        type: 'feed',
        feed: 'http://www.studenttinget.no/feed/',
        imageScraping: {},
      },
    },

    'studentparlamentet_hist': {
      name: 'Studentparlamentet HiST',
      key: 'studentparlamentet_hist',
      web: 'http://studentparlamentet.com/',
      logo: './org/studentparlamentet hist/logo.png',
      icon: './org/studentparlamentet hist/icon.png',
      symbol: './org/studentparlamentet hist/symbol.png',
      placeholder: './org/studentparlamentet hist/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'http://studentparlamentet.com/?feed=rss2',
        imageScraping: {},
      },
    },

    //
    // Institusjoner
    //

    'ntnu': {
      name: 'NTNU',
      key: 'ntnu',
      web: 'http://ntnu.no/',
      logo: './org/ntnu/logo.png',
      icon: './org/ntnu/icon.png',
      symbol: './org/ntnu/symbol.png',
      placeholder: './org/ntnu/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'https://www.retriever-info.com/feed/2002900/generell_arkiv166/index.xml',
        imageScraping: {}, // All links from this feed are on different domains, so just try something, who knows, it might work.
      },
    },

    'rektoratet_ntnu': {
      name: 'Rektoratet NTNU',
      key: 'rektoratet_ntnu',
      web: 'http://www.ntnu.no/blogger/rektoratet/',
      logo: './org/rektoratet ntnu/logo.png',
      icon: './org/rektoratet ntnu/icon.png',
      symbol: './org/rektoratet ntnu/symbol.png',
      placeholder: './org/rektoratet ntnu/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'http://www.ntnu.no/blogger/rektoratet/feed/',
        imageScraping: {newsSelector:'div.entry'},
      },
    },

    'hist': {
      name: 'HiST',
      key: 'hist',
      web: 'http://hist.no/',
      logo: './org/hist/logo.png',
      icon: './org/hist/icon.png',
      symbol: './org/hist/symbol.png',
      placeholder: './org/hist/placeholder.png',
      palette: 'blue',
      news: {
        type: 'feed',
        feed: 'http://hist.no/rss.ap?thisId=1393',
        imageScraping: {newsSelector:'div.nyhet', domainUrl:'hist.no'},
      },
    },

    'dmmh': {
      name: 'DMMH',
      key: 'dmmh',
      web: 'http://www.dmmh.no/',
      logo: './org/dmmh/logo.png',
      icon: './org/dmmh/icon.png',
      symbol: './org/dmmh/symbol.png',
      placeholder: './org/dmmh/placeholder.png',
      palette: 'red',
      news: {
        type: 'feed',
        feed: 'http://dmmh.no/hva-skjer?rss=true',
        imageScraping: {domainUrl:'dmmh.no'},
      },
    },

  },

  //
  // Affiliations above
  //
  // Functions below
  //

  _autoLoadDefaults_: function() {
    if (ls.affiliationKey1 === undefined)
      ls.affiliationKey1 = (DEBUG ? 'DEBUG' : 'online');
    if (ls.showAffiliation2 === undefined)
      ls.showAffiliation2 = 'true';
    if (ls.affiliationKey2 === undefined)
      ls.affiliationKey2 = (DEBUG ? 'online' : 'dusken');
  },

  clearAffiliationData: function() {
    // Clear values that should be empty
    // Meeting
    ls.removeItem('meetingData');
    ls.removeItem('meetingString');
    // Servant
    ls.removeItem('servantData');
    ls.removeItem('servantString');
    // Coffee
    ls.removeItem('coffeeData');
    ls.removeItem('coffeePotsString');
    ls.removeItem('coffeeDateString');
    // Status
    ls.removeItem('statusData');
    ls.removeItem('statusStrings');
    // Remove statuses held by background.js (this is a bit of a hack, should perhaps not be dealt with here)
    ls.removeItem('backgroundLastStatusCode');
    ls.removeItem('backgroundLastStatusMessage');
  },

  get: function(affiliation, callback) {
    if (this.org[affiliation] === undefined) {
      console.error(this.msgUnsupportedAffiliation);
      return;
    }

    var self = this;

    Ajaxer.getJson({
      url: this.api + affiliation,
      success: function(json) {
        self.parse(json, callback);
      },
      error: function() {
        console.error(self.msgConnectionError);
        // Create error messages as the expected json object, this allows each item-parser to handle errors individually
        var errors = {
          meeting: {error: self.msgConnectionError},
          servant: {error: self.msgConnectionError},
          coffee: {error: self.msgConnectionError},
          status: {error: self.msgConnectionError},
        };
        self.parse(errors, callback);
      },
    });
  },

  parse: function(json, callback) {
    // First, run a data check and add error messages where necessary
    for (var i = 0; i < json.length; i++) {
      // Looping through items in the json
      var item = json[i];
      // New item?
      if (Object.keys(this.msgError).indexOf(item) === -1) {
        console.warn('There is new data in town:', item);
      }
      // Missing item?
      if (!json[item]) {
        // Add error message to the json, this allows each item-parser to handle errors individually
        json[item] = {error: this.msgError[item]};
      }
    }

    // Parse each item individually
    this.parseMeeting(json.meeting);
    this.parseServant(json.servant);
    this.parseCoffee(json.coffee);
    this.parseStatus(json.meeting, json.status); // Needs the meeting data as well

    // Call it back
    callback();
  },

  parseMeeting: function(meetingData) {
    // Save object
    ls.meetingData = JSON.stringify(meetingData);
    // Save stringified version from A), B) or C)
    if (meetingData.error) {
      // A) It's an error message
      ls.meetingString = meetingData.error;
    }
    else {
      // B) It's meetings objects
      if (meetingData.meetings) {
        var htmlMeeting = '';
        for (var i in meetingData.meetings) {
          htmlMeeting += (i!=="0"?"\n":"") + meetingData.meetings[i].message;
        }
        ls.meetingString = htmlMeeting;
      }
      // C) It's just a message
      else {
        ls.meetingString = meetingData.message;
      }
    }
  },

  parseServant: function(servantData) {
    // Save object
    ls.servantData = JSON.stringify(servantData);
    // Save stringified version from A), or B)
    if (servantData.error) {
      // A) It's an error message
      ls.servantString = servantData.error;
    }
    else {
      // B) It's a servant or a message
      ls.servantString = servantData.message;
    }
  },

  parseCoffee: function(coffeeData) {
    // Save object
    ls.coffeeData = JSON.stringify(coffeeData);
    // Save stringified version from A) or B)
    if (coffeeData.error) {
      // A) It's an error message
      ls.coffeePotsString = coffeeData.error;
      ls.coffeeDateString = Coffee.msgComforting;
    }
    else {
      // B) It's pots and a date
      var coffeePotsString = '';
      var coffeeDateString = '';

      var pots = coffeeData.pots;
      var date = coffeeData.date;
      if (pots === 0 || date === null) {
        coffeePotsString = Coffee.msgNoPots;
        coffeeDateString = Coffee.msgNoCoffee;
      }
      else {
        // Parse that date
        var d = new Date(date);
        date = Coffee.minuteDiff(d);

        // We have pots and age, now get pretty versions
        var prettyPots = Coffee.prettyPotsString(pots);
        var hours = d.getHours(); hours = (hours < 10 ? '0' + hours : hours);
        var minutes = d.getMinutes(); minutes = (minutes < 10 ? '0' + minutes : minutes);
        var prettyAge = Coffee.prettyAgeString(date, [hours, minutes])

        coffeePotsString = prettyPots;
        coffeeDateString = prettyAge;
      }
      ls.coffeePotsString = coffeePotsString;
      ls.coffeeDateString = coffeeDateString;
    }
  },

  parseStatus: function(meetingData, statusData) {
    // Save object
    ls.statusData = JSON.stringify(statusData);

    // Calculate (smash together) the following:
    // [statusCode, statusTitle, statusMessage, meeting]

    // Presume the worst
    var statusCode = 'error';
    var statusTitle = Affiliation.statuses['error'].title;
    var statusMessage = Affiliation.statuses['error'].message;
    var meeting = Affiliation.msgError['meeting'];

    // Prepare affiliation status messages
    var affiliationMessages = null;
    var affiliationHardware = Affiliation.org[ls.affiliationKey1].hardware;
    if (affiliationHardware && affiliationHardware.statusMessages) {
      affiliationMessages = Affiliation.org[ls.affiliationKey1].hardware.statusMessages;
    }

    // status: meeting || food
    if (meetingData.free === false) {
      statusCode = 'meeting'; // TODO: FOOD
      statusTitle = Affiliation.statuses[statusCode].title;
      
      // Get specific meeting message
      if (meetingData.meetings) {
        statusMessage = meetingData.meetings[0].summary;
      }
      // Or less specific affiliation status message
      else if (affiliationMessages) {
        statusMessage = affiliationMessages[statusCode];
      }
      // Or even less specific generic message
      else if (meetingData.message) {
        statusMessage = meetingData.message;
      }
      // Least specific, entirely generic message stored here
      else {
        statusMessage = Affiliation.statuses[statusCode].message;
        console.warn("Least specific message was used, poor data, meetingData:", meetingData);
      }
    }
    // status: open || closed || error
    else {
      if (statusData.error) {
        // statusCode and statusTitle is already error, just get the message
        statusMessage = statusData.error;
      }
      else {
        if (statusData.status === true) {
          // No meeting, office is open
          statusCode = 'open';
        }
        else if (statusData.status === false) {
          // No meeting, but office is closed
          statusCode = 'closed';
        }
        else if (statusData.status === null) {
          // Notipi is offline, all variables default to error
        }
        else {
          console.error("Malformed data from API, statusData:", statusData);
        }
        statusTitle = Affiliation.statuses[statusCode].title;
        statusMessage = Affiliation.statuses[statusCode].message;
        if (affiliationMessages && affiliationMessages[statusCode]) {
          statusMessage = affiliationMessages[statusCode];
        }
      }
    }

    // Save as strings
    ls.statusStrings = JSON.stringify({
      statusCode: statusCode,
      statusTitle: statusTitle,
      statusMessage: statusMessage,
      meeting: meeting,
    });
  },

  getMemeCount: function(affiliation) {
    if (Affiliation.org[affiliation].hardware.memePath && Affiliation.org[affiliation].hardware.memeCount) {
      return Affiliation.org[affiliation].hardware.memeCount;
    }
    else {
      console.warn('Affiliation', affiliation, 'have not made their own coffee memes yet');
      return 0;
    }
  },

}

// Auto-load self
Affiliation._autoLoadDefaults_();
