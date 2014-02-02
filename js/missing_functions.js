
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
