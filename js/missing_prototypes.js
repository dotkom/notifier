
// Small prototype library for Online Notifier
// http://github.com/dotkom/online-notifier
// dotkom@online.ntnu.no

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.startsWith = function (string) {
  return this.indexOf(string) == 0;
}
