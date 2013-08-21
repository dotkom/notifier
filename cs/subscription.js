// Generated by CoffeeScript 1.4.0
(function() {
  var $, ls, setSubscription;

  $ = jQuery;

  ls = localStorage;

  setSubscription = function() {
    var amount, image, memes, num, path, random, width, _i, _j;
    memes = [];
    amount = MEME_AMOUNT;
    for (num = _i = 1; 1 <= amount ? _i <= amount : _i >= amount; num = 1 <= amount ? ++_i : --_i) {
      memes.push('./meme/' + num + '.jpg');
    }
    if (Affiliation.org[ls.affiliationKey1].hasMemes) {
      amount = Affiliation.org[ls.affiliationKey1].numberOfMemes;
      path = Affiliation.org[ls.affiliationKey1].memePath;
      for (num = _j = 1; 1 <= amount ? _j <= amount : _j >= amount; num = 1 <= amount ? ++_j : --_j) {
        memes.push(path + num + '.jpg');
      }
    }
    random = 1 + Math.floor(Math.random() * memes.length);
    if (DEBUG) {
      console.log('memes[', random - 1, '] of', 0, '-', memes.length - 1, '-> we found', memes[random - 1]);
    }
    image = memes[random - 1];
    $('#subscription').click(function() {
      if (!DEBUG) {
        _gaq.push(['_trackEvent', 'subscription', 'clickMeme', image]);
      }
      Browser.openTab('options.html');
      return window.close;
    });
    width = $('#subscription').width();
    return $('#subscription').html('<img src="' + image + '" width="' + width + '" />');
  };

  $(function() {
    $.ajaxSetup(AJAX_SETUP);
    setSubscription();
    return setTimeout((function() {
      return window.close();
    }), 6000);
  });

}).call(this);
