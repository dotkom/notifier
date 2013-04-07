
// Small prototype library for Online Notifier
// http://github.com/dotkom/online-notifier
// dotkom@online.ntnu.no

// For capitalizing the first letter of a string
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
