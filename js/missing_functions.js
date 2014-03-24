
// Small function library for Online Notifier

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

function stacktrace() {
  var e = new Error('dummy');
  var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '').replace(/^\s+at\s+/gm, '').replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@').split('\n');
  stack = stack.slice(1);
  console.log(stack);
}

function hotFixBusLines() {
  // Active and inactive bus lines will sometimes be null (will show as NaN in options page)
  // This isn't fixable yet because of some missing API features. For now we have to counter
  // the effects by emptying the arrays for active and inactive bus lines, which will result
  // in Notifier including all lines.
  console.lolg('hotfixing!');
  var active1 = JSON.parse(localStorage.firstBusActiveLines);
  var inactive1 = JSON.parse(localStorage.firstBusInactiveLines);
  var active2 = JSON.parse(localStorage.secondBusActiveLines);
  var inactive2 = JSON.parse(localStorage.secondBusInactiveLines);
  if (active1.indexOf(null) != -1) {
    console.lolg('hotfixing activelines 1 ...');
    localStorage.firstBusActiveLines = JSON.stringify([]);
  }
  if (inactive1.indexOf(null) != -1) {
    console.lolg('hotfixing inactivelines 1 ...');
    localStorage.firstBusInactiveLines = JSON.stringify([]);
  }
  if (active2.indexOf(null) != -1) {
    console.lolg('hotfixing activelines 2 ...');
    localStorage.secondBusActiveLines = JSON.stringify([]);
  }
  if (inactive2.indexOf(null) != -1) {
    console.lolg('hotfixing inactivelines 2 ...');
    localStorage.secondBusInactiveLines = JSON.stringify([]);
  }
  console.lolg('hotfixed!')
}

// HOTFIXING AFFILIATION KEYS
// changing spaces to underscores for easier URLs in Notiwire
// REMOVE AFTER APRIL 2014

if (localStorage.affiliationKey1 == 'de folkevalgte')
  localStorage.affiliationKey1 = 'de_folkevalgte';
if (localStorage.affiliationKey2 == 'de folkevalgte')
  localStorage.affiliationKey2 = 'de_folkevalgte';

if (localStorage.affiliationKey1 == 'jump cut')
  localStorage.affiliationKey1 = 'jump_cut';
if (localStorage.affiliationKey2 == 'jump cut')
  localStorage.affiliationKey2 = 'jump_cut';

if (localStorage.affiliationKey1 == 'sturm und drang')
  localStorage.affiliationKey1 = 'sturm_und_drang';
if (localStorage.affiliationKey2 == 'sturm und drang')
  localStorage.affiliationKey2 = 'sturm_und_drang';

if (localStorage.affiliationKey1 == 'tim og shaenko')
  localStorage.affiliationKey1 = 'tim_og_shaenko';
if (localStorage.affiliationKey2 == 'tim og shaenko')
  localStorage.affiliationKey2 = 'tim_og_shaenko';

if (localStorage.affiliationKey1 == 'studentparlamentet hist')
  localStorage.affiliationKey1 = 'studentparlamentet_hist';
if (localStorage.affiliationKey2 == 'studentparlamentet hist')
  localStorage.affiliationKey2 = 'studentparlamentet_hist';

if (localStorage.affiliationKey1 == 'studenttinget ntnu')
  localStorage.affiliationKey1 = 'studenttinget_ntnu';
if (localStorage.affiliationKey2 == 'studenttinget ntnu')
  localStorage.affiliationKey2 = 'studenttinget_ntnu';

if (localStorage.affiliationKey1 == 'rektoratet ntnu')
  localStorage.affiliationKey1 = 'rektoratet_ntnu';
if (localStorage.affiliationKey2 == 'rektoratet ntnu')
  localStorage.affiliationKey2 = 'rektoratet_ntnu';

// HOTFIXING UTOPIA, REMOVE AFTER MAY 2014

if (localStorage.affiliationPalette == 'utopia')
  localStorage.affiliationPalette = 'blue';
if (localStorage.affiliationKey1 == 'utopia')
  localStorage.affiliationKey1 = 'communitas';
if (localStorage.affiliationKey2 == 'utopia')
  localStorage.affiliationKey2 = 'communitas';

