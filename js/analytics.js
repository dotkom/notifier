// Tracking Basics (Asynchronous Syntax)
// https://developers.google.com/analytics/devguides/collection/gajs/
// Event Tracking - Web Tracking (ga.js):
// https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide

if (DEBUG) {
  // Empty array which allows us to check values during debugging
  var _gaq = [];
}
else {
  // Create google analytics queue
  var _gaq = _gaq || [];

  // Set account vars and set to track page views
  _gaq.push(['_setAccount', 'UA-9905766-3']);
  _gaq.push(['_gat._anonymizeIp']); // Proper anonymization
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
  })();

  // Preventing incorrect bounce statistics
  // A bounce is registered if no event is fired and no other page is visited,
  // however no page in Notifier leads to other pages and not all pages fire
  // events unless necessary. Therefore we fire a 'read'-event after 3 seconds.
  var timeout = 3000;
  setTimeout(function() {
    _gaq.push(['_trackEvent', 'analytics', 'antibounce', timeout])
  }, timeout);
}

Analytics = {

  trackEvent: function(action, label, value) {
    var category = window.location.pathname; // chrome-extension://dohbapaojpimhoikcihglgkicjolfajj/options.html
    category = category.split('/').pop(); // options.html
    category = category.replace('.html',''); // options

    // Event tracking:
    // Params: "_trackEvent", "category", "action", "label", value (num), noninteraction (bool)
    // Snippet: _gaq.push(['_trackEvent', 'subscription', 'click', image, bytes]);
    if (label) {
      if (value) {
        _gaq.push(['_trackEvent', category, action, label, value]);
      }
      else {
        _gaq.push(['_trackEvent', category, action, label]);
      }
    }
    else {
      _gaq.push(['_trackEvent', category, action]);
    }

    // If just debugging, empty the array once in a while
    if (DEBUG) {
      if (_gaq.length > 1000) {
        _gaq = [];
      }
    }
  },

};
