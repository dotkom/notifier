popup.options = {

  loadAll: function() {
    this.loadCantinaOptionValues();
  },

  bindAll: function() {
    this.bindCantinaOptions();
  },

  //
  // Cantinas
  //

  loadCantinaOptionValues: function() {
    // Dropdowns
    $('#cantinas .first .options select').val(ls.cantina1);
    $('#cantinas .second .options select').val(ls.cantina2);
    // Lunch and dinner checkboxes
  },

  bindCantinaOptions: function() {
    
    var bindOption = function(selector, storageKey) {
      var cantina = '#cantinas ' + selector + ' ';

      // Content
      var title = cantina + '.title';
      var hoursBox = cantina + '.hours';
      var dinnerBox = cantina + '.dinnerBox';

      // Options
      var selectCantina = cantina + 'select';
      var showLunch = cantina + 'input[name="showLunch"]';
      var showDinner = cantina + 'input[name="showDinner"]';

      // Handle change
      $(selectCantina).change(function () {
        // Save
        ls[storageKey] = this.value; // ls.cantina1, ls.cantina2
        // Set new title
        var name = Cantina.names[this.value];
        $(title).text(name);
        // Add loading bar
        $(hoursBox).html('');
        $(dinnerBox).html('<img class="loadingLeft" src="img/loading.gif" />');
        // Prepare for connection error
        window._cantinaOptionTimeout_ = setTimeout(function() {
          $(hoursBox).html('');
          $(dinnerBox).html(Cantina.msgConnectionError);
        }, 6000);
        // Load
        Browser.getBackgroundProcess().updateCantinas(function () {
          clearTimeout(window._cantinaOptionTimeout_);
          popup.update.cantinas();
        });
      });
    }
    // Hit it
    bindOption('.first', 'cantina1');
    bindOption('.second', 'cantina2');
  },

};
