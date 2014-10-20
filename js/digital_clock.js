"use strict";

var pushExtra = 0;

var updateTime = function() {
	var now = new Date();

	var hour = now.getHours();
	var minute = now.getMinutes();
	var second = now.getSeconds();

	if (hour < 10) { hour = "0" + hour; }
	if (minute < 10) { minute = "0" + minute; }
	if (second < 10) { second = "0" + second; }

	pushExtra = 0;

	$("#hh").html(digitDiv(String(hour)));
	$("#mm").html(digitDiv(String(minute)));
	$("#ss").html(digitDiv(String(second)));
};

function digitDiv(val) {
	var first = '<div class="digit">' + val.substring(0,1) + '</div>';
	var second = '<div class="digit">' + val.substring(1,2) + '</div>';
	return first + second;
}

setInterval(function() { updateTime(); }, 1000);