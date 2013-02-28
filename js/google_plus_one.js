if (BROWSER == "Chrome") {
  window.___gcfg = {lang: 'no'};

  (function() {
    
    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);
    
  })();
}
else if (BROWSER == "Opera") {
  // Wontfix for Opera 12.40, bad inline CSS bugs
  console.log("ERROR: Google +1 button not working in Opera 12.40 because of bad inline CSS bugs");
}