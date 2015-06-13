popup.options = {

  adjustDropdownWidths: function() {
    adjustCantinaTitleWidth(ls.cantina1, '#cantinas .first');
    adjustCantinaTitleWidth(ls.cantina2, '#cantinas .second');
  },

  //
  // Text width measuring for title dropdowns
  //

  getTitleWidth: function (title) {
    var width = $('#titleMeasure').text(title).width();
    $('#titleMeasure').text('');
    return width * 1.1 + 30; // Buffer estimated to 1.1x real text length + 30px
  },

  //
  // Cantinas
  //

  adjustCantinaTitleWidth: function(title, element) {
    var wrapper = element + ' .dropdownWrapper';
    var dropdown = element + ' .dropdownWrapper .titleDropdown';
    var cantinaName = Cantina.names[title];
    var width = getTitleWidth(cantinaName);
    $(wrapper).width(width);
    $(dropdown).width(width - 23);
  },

  cantinaChangeHandler: function(which, cantina) {
    var titleDropdown = '#cantinas ' + which + ' .titleDropdown';
    var hoursBox = '#cantinas ' + which + ' .hours';
    var dinnerBox = '#cantinas ' + which + ' #dinnerbox';
    $(titleDropdown).change(function () {
      // Save
      ls[cantina] = this.value;
      // Measure
      adjustCantinaTitleWidth(ls[cantina], '#cantinas ' + which);
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
