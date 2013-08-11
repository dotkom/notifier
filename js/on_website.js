// This is a injected script.

// That means the script is called when any page is loaded. This script does
// not have access to the rest of the extension's stuff, like localStorage.
// Therefore the script needs to send requests about variables in storage
// to the extension.

// It is important to just use regular javascript here, at most some jQuery.
// Remember that the environment you are in here is NOT the extension, it
// might be an old, insecure website. Except, of course, if we are visiting
// the Online website which is secured by our most paranoid guy, Rockj ;)

var host = window.location.host;

if (host == 'online.ntnu.no') {
  if (typeof chrome != "undefined") {
    // Reset badge counter
    chrome.extension.sendMessage({'action':'resetCounterWhenOnWebsite'});
    // Hide Notifier install button
    $('#install_notifier').hide();
  }
}
else if (host == 'www.sit.no') {
  var callback = function(clickedCantina) {
    // Kick out SiTs own change function, which doesn't play
    // well with our more updated version of jQuery
    $('#displayWeek').unbind('change');
    // Rebind the cantina selector with SiT's own function
    $('#displayWeek').change(function(){
      var selectedDiner = $(this).val();
      $.ajax({
        url: 'ajaxdinner/get',
        type: 'POST',
        data: { diner: selectedDiner, trigger: 'week' },
        success: function(menu){
          $('#dinner-output').html(menu.html);
        }
      });
    });
    // Change cantina and trigger the change
    $('#displayWeek').val(clickedCantina).trigger('change');
  };
  if (typeof chrome != "undefined") {
    chrome.extension.sendMessage({'action':'getClickedCantina'}, callback);
  }
}
