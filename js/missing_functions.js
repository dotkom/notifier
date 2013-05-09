
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
