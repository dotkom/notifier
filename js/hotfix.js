"use strict";

// MERGING STUDENTPARLAMENTET HIST INTO STUDENTTINGET NTNU
// REMOVE AFTER MAY 2016
if (localStorage.affiliationKey1 === 'studentparlamentet_hist') {
	localStorage.affiliationKey1 = 'studenttinget_ntnu';
}
if (localStorage.affiliationKey2 === 'studentparlamentet_hist') {
	localStorage.affiliationKey2 = 'studenttinget_ntnu';
}
if (localStorage.affiliationKey1 === 'hist') {
	localStorage.affiliationKey1 = 'rektoratet_ntnu';
}
if (localStorage.affiliationKey2 === 'hist') {
	localStorage.affiliationKey2 = 'rektoratet_ntnu';
}
