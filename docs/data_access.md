Data Access Layer 
=================

Overview
--------
The concept of a data access layer is to provide a single entry point
for all clients to access SleeperBot Data securely in a way that is
language agnostic.

How does it work?
-----------------
The data access layer is in its current form a single node.js process residing on
the same server as the master database that holds all the business logic 
calls to the database.

The data access layer accepts 0mq requests and sends 0mq replies back to the
calls origination once data is fetched from our database (or cache).

Protocol API for the Data Access Layer
-----------------
We will use 0mq to handle all communication.  
Requests and replies are all handled in JSON format.

**Sample Request** located in lib/mq.coffee

	{
		id: <uuid>,
		method: 'User:getNameById',
		params: {param1: 'param1', param2: 'param2' ...}
	}

**Sample Response**
	
	{
		id: <uuid>,
		data: data // data from DB
	}

Sample Client API from Web Server
------------------
** sending data **

	query.send({
		id: <uuid>,
		method: 'User:getNameById',
		params: {id:234}
	});
	
	message_list[ <uuid> ] = callback;
	
** getting a response **

	message.on('reply', function(msg){
		message_list[ msg.id ]( msg.data );
	});

API
------------------

Usage from a web.js app:
	
	query = mq.query 'User:getRecentTopics', id: 4
	query.ok (name) ->
		mq.stream 
			channel: 'football:fantasy'
			data: name
		res.end 'success'
	query.fail (err) ->
		res.end 'error'

Usage from within the data access layer:

	db = require 'db'
	zmq = require 'zeromq'
	
	# require from models directory
	require '../models/user'
	require '../models/topic'
	
	# receive zmq req
	rep = zmq.createSocket 'rep'
	rep.bind 'tcp://127.0.0.1:5555', (err) ->
		rep.on 'message', (_msg) ->
			msg = JSON.parse _msg
			
			# figure out the model and method
			mm = msg.method.split ':'
			model = mm[0]
			method = mm[1]
			
			# define the callback function
			callback = (data) ->
				msg.data = data
				rep.send JSON.stringify msg
				
			# send query to the database with callback
			query = db.model model
			query[ method ] msg.params, callback
			
			# gets deleted before the callback executes
			delete msg.method
			delete msg.params
		

Writing Models in the Data Access Layer
-------------------
	
	require.paths.unshift(process.cwd() + '/lib')
	mongo = require 'mongoose'
	redis = require 'redis'
	db = require 'db'
	async = require 'async'
	
	class User
	
		getNameById: ( params, end ) ->
			console.log 'roflmaobbq'
			console.log 'sunny'
			end 'Sunnykit ' + params.id
			
		getTopicsFromUsers: ( params, end ) ->
			end ['t1', 't2', 't3']
			
		###
		COMMAND: User:getRecentTopics
		DESCRIPTION: Gets the most recent topics of users
		###
		getRecentTopics: ( params, end ) ->
			seq = async.seq
			seq.step ->
				db.model('User').getTopicsFromUsers {}, (topics) ->
					seq.topics = topics
					seq.next()
			seq.step ->
				seq.user = 'haha'
				seq.next()
			seq.last ->
				end
					topics: seq.topics
					user: seq.user
					
	db.model 'User', User

Inside the 'db' helper
-------------------
This file stores the models in memory to be accessed later

	models = {}
	exports.model = ( name, obj=null ) ->
		if obj?
			return models[ name ] = new obj
		models[ name ]