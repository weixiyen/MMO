/*
 * jQuery pretty date plug-in 1.0.0
 * 
 * http://bassistance.de/jquery-plugins/jquery-plugin-prettydate/
 * 
 * Based on John Resig's prettyDate http://ejohn.org/blog/javascript-pretty-date
 *
 * Copyright (c) 2009 Jörn Zaefferer
 *
 * $Id: jquery.validate.js 6096 2009-01-12 14:12:04Z joern.zaefferer $
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

(function() {

$.prettyDate = {
	
	template: function(source, params) {
		if ( arguments.length == 1 ) 
			return function() {
				var args = $.makeArray(arguments);
				args.unshift(source);
				return $.prettyDate.template.apply( this, args );
			};
		if ( arguments.length > 2 && params.constructor != Array  ) {
			params = $.makeArray(arguments).slice(1);
		}
		if ( params.constructor != Array ) {
			params = [ params ];
		}
		$.each(params, function(i, n) {
			source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
		});
		return source;
	},
	
	now: function( type ) {
		// gets GMT time
		var now = new Date();
		if ( type === 'GMT' ) {
			var offset = now.getTimezoneOffset() * 60 * 1000;
			return now.getTime() + offset;
		}
		return now;
	},
	
	// Takes an ISO time and returns a string representing how
	// long ago the date represents.
	format: function(time) {
		var date = Date.parse(time.substr(0,19)); // GMT
		var diff = ($.prettyDate.now('GMT') - date.getTime()) / 1000, // LOCAL TIME
			day_diff = Math.floor(diff / 86400);
		
		if ( isNaN(day_diff) || day_diff < 0 )
			return;

		var messages = $.prettyDate.messages;
		return day_diff == 0 && (
				diff < 60 && messages.now ||
				diff < 120 && messages.minute ||
				diff < 3600 && messages.minutes(Math.floor( diff / 60 )) ||
				diff < 7200 && messages.hour ||
				diff < 86400 && messages.hours(Math.floor( diff / 3600 ))) ||
			day_diff == 1 && messages.yesterday ||
			day_diff < 7 && messages.days(day_diff) ||
			day_diff < 31 && messages.weeks(Math.ceil( day_diff / 7 )) ||
			day_diff >= 31 && messages.months;
	}
	
};

$.prettyDate.messages = {
	now: "now",
	minute: "1 min",
	minutes: $.prettyDate.template("{0} min"),
	hour: "1 hr",
	hours: $.prettyDate.template("{0} hr"),
	yesterday: "1 d",
	days: $.prettyDate.template("{0} d"),
	weeks: $.prettyDate.template("{0} wk"),
	months: "> 1 mo"
};
	
$.fn.prettyDate = function(options) {
	options = $.extend({
		value: function() {
			return $(this).attr("title");
		}
	}, options);
	var elements = this;
	function format() {
		elements.each(function() {
			var date = $.prettyDate.format(options.value.apply(this));
			if ( date && $(this).text() != date )
				$(this).text( date );
		});
	}
	format();
	return this;
};

})();
