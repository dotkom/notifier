"use strict";

// HOTFIXING CANTINA MENU
// a cantina was removed
// REMOVE AFTER MAY 2015

if (localStorage.leftCantina === 'ranheimsveien')
	localStorage.leftCantina = 'tungasletta';
if (localStorage.rightCantina === 'ranheimsveien')
	localStorage.rightCantina = 'tungasletta';

// REMOVING PINK PALETTE
// it never really fit, was also the least used one (0.70%)
// REMOVE AFTER MAY 2015

if (localStorage.affiliationPalette === 'pink')
	localStorage.affiliationPalette = 'purple';

// RENAMING LOCALSTORAGE VARS
// it was an awful naming convention, numbering is better
// REMOVE AFTER MAY 2015

if (localStorage.leftCantina)
	localStorage.cantina1 = localStorage.leftCantina;
if (localStorage.rightCantina)
	localStorage.cantina2 = localStorage.rightCantina;

// RENAMING LOCALSTORAGE VARS
// conforming to new convention in Notiwire
// REMOVE AFTER JUNE 2015

if (localStorage.showOffice)
	localStorage.showStatus = localStorage.showOffice;
