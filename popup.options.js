popup.options = {

  loadAll: function() {
    this.loadBigOptionValues();
    this.loadCoffeeOptionValues();
    this.loadCantinaOptionValues();
    this.loadAffiliationOptionValues();
  },

  bindAll: function() {
    this.bindBigOptions();
    this.bindCoffeeOptions();
    this.bindCantinaOptions();
    // this.bindAffiliationOptions();
  },

  //
  // Big options
  //

  loadBigOptionValues: function () {
    var showCantina = ('true' === ls.showCantina);
    $('input#showCantina').prop('checked', showCantina);
    var showBus = ('true' === ls.showBus);
    $('input#showBus').prop('checked', showBus);
  },

  bindBigOptions: function () {
    $('input#showCantina').click(function() {
      // Save
      ls[this.name] = this.checked;
      // Animate
      if (this.checked === true) {
        $('#cantinas').slideDown();
      }
      else {
        $('#cantinas').slideUp();
      }
      // Track
      Analytics.trackEvent('toggleCantinas', this.checked);
    });
    $('input#showBus').click(function() {
      // Save
      ls[this.name] = this.checked;
      // Animate
      if (this.checked === true) {
        $('#bus').slideDown();
      }
      else {
        $('#bus').slideUp();
      }
      // Track
      Analytics.trackEvent('toggleBus', this.checked);
    });
  },

  //
  // Coffee
  //

  loadCoffeeOptionValues: function() {
    var checked = ('true' === ls.coffeeSubscription);
    $('input#coffeeSubscription').prop('checked', checked);
  },

  bindCoffeeOptions: function() {
    var self = this;
    $('input#coffeeSubscription').click(function() {
      // Save
      ls[this.name] = this.checked;
      // Demo
      if (this.checked === true) {
        ls.activelySetCoffee = 'true';
        Coffee.showNotification();
      }
      else {
        // Note: activelySetCoffee is a reminder about what concious choice the user has made.
        // Don't override that choice with defaults later.
        ls.activelySetCoffee = 'true';
      }
      // Track
      Analytics.trackEvent('clickCoffeeOption', this.checked);
    });
  },

  //
  // Cantinas
  //

  loadCantinaOptionValues: function() {
    // Dropdowns
    $('#cantinas .first .options select').val(ls.cantina1);
    $('#cantinas .second .options select').val(ls.cantina2);
  },

  bindCantinaOptions: function() {
    
    var bindOption = function(selector, storageKey) {
      var cantina = '#cantinas ' + selector + ' ';

      // Content
      var title = cantina + '.title';
      var hoursBox = cantina + '.hours';
      var mealBox = cantina + '.mealBox';

      // Options
      var selectCantina = cantina + 'select';

      // Handle change
      $(selectCantina).change(function () {
        // Save
        ls[storageKey] = this.value; // ls.cantina1, ls.cantina2
        // Set new title
        var name = Cantina.names[this.value];
        $(title).text(name);
        // Add loading bar
        $(hoursBox).html('');
        $(mealBox).html('<img class="loadingLeft" src="img/loading.gif" />');
        // Prepare for connection error
        window._cantinaOptionTimeout_ = setTimeout(function() {
          $(hoursBox).html('');
          $(mealBox).html(Cantina.msgConnectionError);
        }, 6000);
        // Load
        Browser.getBackgroundProcess().updateCantinas(function () {
          clearTimeout(window._cantinaOptionTimeout_);
          popup.update.cantinas();
        });
        // Track
        Analytics.trackEvent('clickCantinaOption', name);
      });
    }
    // Hit it
    bindOption('.first', 'cantina1');
    bindOption('.second', 'cantina2');
  },

  //
  // Affiliation
  //

  loadAffiliationOptionValues: function() {
    // Show affiliation 2?
    var showAffiliation2 = ('true' === ls.showAffiliation2);
    $('input#showAffiliation2').prop('checked', showAffiliation2);
    if (!showAffiliation2) {
      $('select#affiliationKey2').prop('disabled', 'disabled');
      $('input#showNotifications2').prop('disabled', 'disabled');
      $('label[for="showNotifications2"]').css('color', 'grey');
    }

    // Affiliations
    $('select#affiliationKey1').val(ls.affiliationKey1);
    $('select#affiliationKey2').val(ls.affiliationKey2);
    
    // Notifications
    var showNotifications1 = ('true' === ls.showNotifications1);
    console.warn('showNotifications1', showNotifications1)
    $('input#showNotifications1').prop('checked', showNotifications1);
    var showNotifications2 = ('true' === ls.showNotifications2);
    $('input#showNotifications2').prop('checked', showNotifications2);
  },

  bindAffiliationOptions: function() {
    // Allow user to change affiliation and palette
    bindAffiliationSelector('1', true);
    bindAffiliationSelector('2', false);
    bindPaletteSelector();
    if (ls.showAffiliation2 !== 'true') {
      $('#affiliationKey2').attr('disabled', 'disabled');
      ////////////.css('-webkit-filter', 'grayscale(100%)');
    }
    // Catch new clicks
    $('input:checkbox').click(function() {
      var _capitalized = this.id.charAt(0).toUpperCase() + this.id.slice(1);
      Analytics.trackEvent('click'+_capitalized, this.checked);

      ls[this.id] = this.checked;

      if (this.id === 'showAffiliation2' && this.checked === false) {
        $('#affiliationKey2').attr('disabled', 'disabled');

      }
      if (this.id === 'showAffiliation2' && this.checked === true) {
        $('#affiliationKey2').removeAttr('disabled');

      }











      if (this.id === 'showNotificationsXXXXXXX' && this.checked === true) {
        this.testDesktopNotification();
      }
    });
  },

  bindAffiliationSelector: function(number, isPrimaryAffiliation) {
    var id = 'affiliationKey'+number;
    var affiliationKey = ls[id];
    // Default values, set only the chosen affiliation as selected, because it is the Chosen One
    $('#'+id).val(affiliationKey);
    // React to change
    $('#'+id).change(function() {
      var affiliationKey = $(this).val();
      var oldAffiliation = ls[id];
      // Save the change
      ls[id] = affiliationKey;

      if (isPrimaryAffiliation) {











        // Check if switching from or to an affiliation with hardware features
        var old_has_hardware = (Affiliation.org[oldAffiliation].hw ? true : false);
        var new_has_hardware = (Affiliation.org[affiliationKey].hw ? true : false);
        if (old_has_hardware && !new_has_hardware) {
          disableHardwareFeatures();
        }
        else if (!old_has_hardware && new_has_hardware) {
          enableHardwareFeatures();
        }
        // either way, change the icons shown in the office status feature
        if (new_has_hardware) {
          changeStatusIcons();
          // Clear and update affiliation data
          Affiliation.clearAffiliationData();
          Browser.getBackgroundProcess().updateAffiliation();
        }

        // Palette
        var palette = Affiliation.org[affiliationKey].palette;
        if (typeof palette !== 'undefined') {
          $('#affiliationPalette').val(palette);
          ls.affiliationPalette = palette;
          // Applying chosen palette
          $('#palette').attr('href', Palettes.get(palette));
        }

        // Extension icon
        var icon = Affiliation.org[affiliationKey].icon;
        Browser.setIcon(icon);













        // Name to badge title and localstorage
        var newExtensionName = Affiliation.org[affiliationKey].name + ' Notifier';
        Browser.setTitle(newExtensionName);
        ls.extensionName = newExtensionName;
      }

      // Throw out old news
      ls.removeItem('affiliationNews'+number);

      if (ls['showAffiliation'+number] === 'true') {
        // Update to new feed
        Browser.getBackgroundProcess().updateAffiliationNews(number);
      }



      // Analytics
      Analytics.trackEvent('clickAffiliation'+number, affiliationKey);


    });
  },

  bindAffiliationNotifications: function(number) {

  },

  disableHardwareFeatures: function() {
    ls.showStatus = 'false';
    ls.coffeeSubscription = 'false';
















  },

  enableHardwareFeatures: function(quick) {
    ls.showStatus = 'true';
    ls.coffeeSubscription = 'true';

    if (quick) {




    }
    else {
      // Update office status
      Browser.getBackgroundProcess().updateStatusAndMeetings(true);








    }
  },

  changeStatusIcons: function() {
    if (Affiliation.org[ls.affiliationKey1].hw) {
      var statusIcons = Affiliation.org[ls.affiliationKey1].hw.statusIcons;
      $('img.icon.open').attr('src', statusIcons.open);
      $('img.icon.closed').attr('src', statusIcons.closed);
      $('img.icon.meeting').attr('src', statusIcons.meeting);
      $('#statusOverlay').attr('src', statusIcons.open);
    }
  },

  testDesktopNotification: function() {
    News.showNotification();
  },

};
