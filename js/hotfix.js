"use strict";

// HOTFIXING CANTINA MENU
// a cantina was removed
// REMOVE AFTER MAY 2015

if (localStorage.leftCantina === 'ranheimsveien')
	localStorage.leftCantina = 'tungasletta';
if (localStorage.rightCantina === 'ranheimsveien')
	localStorage.rightCantina = 'tungasletta';
