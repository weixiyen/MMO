Overview
=======
The purpose of the web server is to provide the minimum features possible to run SleeperBot.com.

Features
--------------
- regex match web handlers (like Django)
- ability to extend web.js with middleware (such as authentication)
- better access in web handlers to POST and GET vars
- template engine based on jade
- ability to create models so it can be imported later for use

API Samples
------------
- require web.start
- require web.use
- require web.model
- require web.handler
- require web.async
	- web.async.loop

web.createServer
-----------
Sample use for create server
	
	app = web.server
	app.listen 6000
	
web.use
-----------
Sample code for web.use
	
	# this is how web.js knows to look for 'auth' hooks for web handler
	app.use "auth"	

web.model
-----------
Sample code for web.model
	
	model = app.model
	model.Comment 
		create: ->
			# code to create the comment
			# in the database
		update: ->
			# update the comment in database
		getById: ->
			# getCommentById

Create a Topic object
	
	Topic = app.model.Topic
	topic = Topic.create()
	
	# one way to assign data
	topic.title = stupid
	topic.created = new Date()
	
	# another way to assign data
	topic.data = 
		key: value
		key2: value2
		
	# sample save function
	topic.save (err) ->
		if err
			res.end 'fail'
			return
		res.end 'ok'

Update a Topic object
	
	Topic = app.model.Topic
	
	topic = Topic.find { id:'2343934abcef34' }
	topic.foo = 'baz'
	topic.save (err) ->
		res.end 'ok'
	

Updating multiple topics
	
	Topic = app.model.Topic
	
	# query for ineffective users
	query = 
		created: 
			$gt: Date.OneMonthAgo()
		cookies: 
			$lt: 2
	
	topics = Topic.findAll query
	topics.fetch (topics) ->
		# access to topics found

Deleting topics
	
	Topic = app.model.Topic
	
	query = 
		created:
			$lt: Date.OneYearAgo()
	topics = Topic.findAll query
	topics.delete (err) ->
		res.end 'deleted'

web.handler
----------
Sample code for web.handler
	
	handler = require web.handler
	
	# OR this
	handler '/login', options, (req, res) ->
     	# code goes here
     	# execute logic

Server Execution Sequence
----------
Middleware functionality is provided by the 'use' method web.use.
Following is the execution sequence of a request response cycle.

1.	request / response object prototypes are modified for better functionality
2.	handler objects are loaded into memory and the current handler based on path is chosen based on regex
3. 	request, response, and handler objects are passed through middleware loop with a callback function
	until all middleware actions are complete.
4.	handler action is executed depending on the path.

This allows maximum control of the request response cycle 
through middleware, so custom authentication can be used.

Writing Async Middleware
------
We must keep in mind the async nature of node.js.  
It's important that middleware operates on callbacks and that we cannot
sequentially loop through the middlewares in a stack.

Thus, it becomes important that all middleware are written in such a way that a callback must
be taken at all times and passed back to the main web.js application to finish execution.

Sample web.js middleware:
	
	app.createMiddleware 'auth', (mw) ->
		# req has now been modified
		mw.req.name = 'moo'
		mw.next()

Templating - web.render
----------
Render sample.jade into HTML
	
	options = 
		name: weixi
		age: 22
		
	web.render 'sample', options

Jade uses mako template style inheritance:
	
	# include another template
	%include path/to/header 
	
	# parent template to be inherited has %body
	%body 
	
	# inherit a parent template and replace it's %body
	%inherit base 

This works just like include and inherit in mako templates.  

Async
------------
Provides tools for asynchronous traversal (used internally by web.js)
This API is also exposed for end users.

**Example 1) Async.loop** - Implemented

	async = require 'web.async'
	
	fn1 = (loop) ->
		if loop.data.foo == 'bar'
			loop.continue()
		else
			loop.fail()
	
	fn2 = (loop) ->
		loop.data.foo = 'BAZ'
		loop.continue()
		
	async.loop [fn1, fn2], data, (data) ->
		# modified data here