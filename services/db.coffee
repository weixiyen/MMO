###
DB.js opens a zmq socket which allows
other services to use the data access layer.
###
require.paths.unshift(process.cwd() + '/lib')
db = require 'db'
zmq = require 'zeromq'
app = require 'web'
settings = require('settings').db
mongo = require 'mongoose'

# make the connection to mongodb
mongo.connect settings.mongo

# require from models directory
app.requireDir settings.dir.models

# receive zmq req
rep = zmq.createSocket 'rep'
rep.bind settings.socket, (err) ->
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