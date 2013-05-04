
// Create google analytics array
var _gaq = _gaq || [];

// Set account vars and set to track page views
_gaq.push(['_setAccount', 'UA-9905766-3']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();
