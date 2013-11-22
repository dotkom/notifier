
// Small function library for Online Notifier
// http://github.com/dotkom/online-notifier
// dotkom@online.ntnu.no

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isEmpty(v) {
  if (typeof v == 'undefined' || v == null) return true;
  if (typeof v == 'string' && v.trim() == '') return true;
  if (typeof v == 'number' && (isNaN(v) || v == 0)) return true;
  if (typeof v == 'boolean' && v == false) return true;
  return false;
}

function hotFixBusLines() {
  // Active and inactive bus lines will sometimes be null (will show as NaN in options page)
  // This isn't fixable yet because of some missing API features. For now we have to counter
  // the effects by emptying the arrays for active and inactive bus lines, which will result
  // in Notifier including all lines.
  if (DEBUG) console.log('hotfixing!');
  var active1 = JSON.parse(localStorage.firstBusActiveLines);
  var inactive1 = JSON.parse(localStorage.firstBusInactiveLines);
  var active2 = JSON.parse(localStorage.secondBusActiveLines);
  var inactive2 = JSON.parse(localStorage.secondBusInactiveLines);
  if (active1.indexOf(null) != -1) {
    if (DEBUG) console.log('hotfixing activelines 1 ...');
    localStorage.firstBusActiveLines = JSON.stringify([]);
  }
  if (inactive1.indexOf(null) != -1) {
    if (DEBUG) console.log('hotfixing inactivelines 1 ...');
    localStorage.firstBusInactiveLines = JSON.stringify([]);
  }
  if (active2.indexOf(null) != -1) {
    if (DEBUG) console.log('hotfixing activelines 2 ...');
    localStorage.secondBusActiveLines = JSON.stringify([]);
  }
  if (inactive2.indexOf(null) != -1) {
    if (DEBUG) console.log('hotfixing inactivelines 2 ...');
    localStorage.secondBusInactiveLines = JSON.stringify([]);
  }
  if (DEBUG) console.log('hotfixed!')
}

// HOTFIX affiliation stuff, remove after november 2013
if (localStorage.affiliationKey1 == 'entreprenoerskolen')
  localStorage.affiliationKey1 = 'solan';
if (localStorage.affiliationKey2 == 'entreprenoerskolen')
  localStorage.affiliationKey2 = 'solan';
if (localStorage.affiliationKey1 == 'kwakiutl')
  localStorage.affiliationKey1 = 'utopia';
if (localStorage.affiliationKey2 == 'kwakiutl')
  localStorage.affiliationKey2 = 'utopia';