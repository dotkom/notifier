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

