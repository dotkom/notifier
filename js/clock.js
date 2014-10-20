"use strict";

var Clock = {
	pushExtra: 0,

	start: function() {
		var self = this;
		setInterval(function() {
			self.updateTime();
		}, 1000);
	},

	updateTime: function() {
		var now = new Date();

		var hour = now.getHours();
		var minute = now.getMinutes();
		var second = now.getSeconds();

		if (hour < 10) { hour = "0" + hour; }
		if (minute < 10) { minute = "0" + minute; }
		if (second < 10) { second = "0" + second; }

		var pushExtra = 0;

		$("#hh").html(this.digitDiv(String(hour)));
		$("#mm").html(this.digitDiv(String(minute)));
		$("#ss").html(this.digitDiv(String(second)));
	},

	digitDiv: function(val) {
		var first = '<div class="digit">' + val.substring(0,1) + '</div>';
		var second = '<div class="digit">' + val.substring(1,2) + '</div>';
		return first + second;
	},

}.start();
