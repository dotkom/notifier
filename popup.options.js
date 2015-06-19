popup.options = {

  //
  // Cantinas
  //

  cantinaChangeHandler: function(which, cantina) {
    var titleDropdown = '#cantinas ' + which + ' .titleDropdown';
    var hoursBox = '#cantinas ' + which + ' .hours';
    var dinnerBox = '#cantinas ' + which + ' #dinnerbox';
    $(titleDropdown).change(function () {
      // Save
      ls[cantina] = this.value;
      // Add loading bar
      $(hoursBox).html('');
      $(dinnerBox).html('<img class="loadingLeft" src="img/loading.gif" />');
      window.cantinaTimeout = setTimeout(function() {
        $(hoursBox).html('');
        $(dinnerBox).html(Cantina.msgConnectionError);
      }, 6000);
      // Apply
      Browser.getBackgroundProcess().updateCantinas(function () {
        clearTimeout(window.cantinaTimeout);
        popup.update.cantinas();
      });
    });
  },
  cantinaChangeHandler('.first', 'cantina1');
  cantinaChangeHandler('.second', 'cantina2');

};
