"use strict";

//
// Debugging
//

// Declare DEBUG constant, but be sure we aren't in production
const DEBUG = Browser.inProduction() ? false : true;

// Disable logging if in production
if (!DEBUG) {
	window.console = {};
	window.console.log = function(){};
	window.console.info = function(){};
	window.console.warn = function(){};
	window.console.error = function(){};
}

//
// All other constants
//

// API servers
const API_SERVER_2 = 'http://passoa.online.ntnu.no/api/';
const API_SERVER_1 = 'http://online.duvholt.net/api/';

// Loops & intervals
const BACKGROUND_LOOP = 60000; // 60s
const BACKGROUND_LOOP_DEBUG = 5000; // 5s, respond fairly quickly for us developers
const PAGE_LOOP = 10000; // 10s
const PAGE_LOOP_DEBUG = 5000; // 5s
const ONLINE_MESSAGE = '\nNow online, run mainloop\n';
const OFFLINE_MESSAGE = '\nNow offline, stop execution\n';

// Update stuff at every X intervals
const UPDATE_AFFILIATION_INTERVAL = 1; // recommended: 1
const UPDATE_CANTINAS_INTERVAL = 60; // recommended: 60
const UPDATE_BUS_INTERVAL = 2; // recommended: 1
const UPDATE_NEWS_INTERVAL = 20; // recommended: 20

// Hard totals
const MEME_AMOUNT = 30;
