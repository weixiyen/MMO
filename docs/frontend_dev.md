Overview
=======

SB is the global namespace (window.SB or this.SB)

SleeperBot is an application that does not require refreshing the browser.
It uses html5 pushState to swap from page to page.  
SB to the user is not a network of pages, but one single online application.

SleeperBot's front-end consists of the following concepts

- UI modules
- Helper Functions

UI Modules
------
Everything in SleeperBot is a UI Module.
The page layout is 1 UI Module.
The feed widget is another UI Module.
The account bar at the top is another UI Module.
The Navigation bar is another UI Module.

UI Modules can have different types.
Different types of the same UI module can look slightly different.
For example, the navigation may look different depending on what page is using it.

UI Modules usually consists of:

- html
- css
- javascript
- images

When a UI Module is declared in javascript, all HTML / CSS / JS dependencies are also
declared.

Here is a sample UI Module that will load the feed.

	MM.ui 'feed', options

When this MM.ui function is called, the module will load with options.

Options:
	
	history - what to show in the URL bar with html5 pushState
	type - the type of module (types are defined by you when you make modules)
	el - the dom element to append the result to

This is how you create a module
	
	cd public/js/ui
	touch feed.coffee # compiles to feed.js

in feed.coffee

	MM.ui 'feed', (opts) ->
		# code goes here
		# you will have access to 'opts.type' and 'opts.ctx' if the options are passed
		# use your own logic to decide what to do with it

Basically when you run MM.ui 'feed', options, the above function (opts) -> will execute.

MM.require
--------
Some modules depend on other modules.

	MM.ui 'football', options, ->
		MM.require 'account'
		MM.require 'menu'
		MM.require 'feed'
		MM.run ->
			MM.ui 'feed'
				el: $('#feed')
				type: 'narrow'
			MM.ui 'menu'
				el: $('#menu')
				type: 'horizontal'

MM.ajax
--------
Wrapper around jQuery's ajax function with default params set.
Used to make requests to the server to fetch data but not reload the UI.

	var result = MM.ajax options
	result.ok(function( data ){
		# success code
	});
	result.fail(function(){
		# fail code
	});

MM.comet
--------
The web client interacts with the stream server
by sending messages, and passing a callback to be 
executed at a later time.

Here's some example code:

	MM.comet(channel, function( data ){
		// do stuff after getting data
	});
	
	MM.comet(channel, function( data ){
		// do stuff after getting data
	});

Whenever we receive data from certain channel, that function will run
with the data.

MM.render
--------
Renders a jade template with that name

	MM.render 'feed/football/template', options
	# renders /tpl/feed/football/template.jade

Handling CSS
--------
CSS is done on a per ui basis and prefixed with 'ui'
All are in the .css file

We uses stylus which compiles to css

	.uiFeed
		.cool
			background red
			color white

css for each module is lazyloaded in at runtime
