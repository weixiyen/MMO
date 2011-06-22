require.paths.unshift(process.cwd() + '/lib')
util = require 'util'
redis = require 'redis'
ENV = process.env.ENV
settings = require('settings').stream

# DEFAULT SETTINGS
# -------------------------------------------------
settings.port = process.argv[2] if process.argv[2]?

io = require('socket.io').listen Number(settings.port)

# SOCKET SERVER
# -------------------------------------------------
channels = {}

io.sockets.on 'connection', (client) ->
	
	# when a client connects
	sid = client.sessionId
	
	# when a message is received
	client.on 'message', (data) ->
		if data.channel?
			channel = data.channel
			channels[ channel ] = {} if !channels[ channel ]?
			channels[ channel ][ sid ] = client
	
	# when a client disconnects
	client.on 'disconnect', () ->
		for tag, channel of channels
			delete channel[ sid ]
	
# SUBSCRIBER FUNCTION
# -------------------------------------------------
flushChannel = ( msg ) ->
	try
		channel = channels[ msg.channel ]
		for sid, client of channel
			client.send msg

subscriber = redis.createClient()
subscriber.subscribe 'stream'
subscriber.on 'message', ( channel, raw_data ) ->
	msg = JSON.parse raw_data
	flushChannel msg
		

# UTILITY STUFF FOR DEVELOPMENT
# -------------------------------------------------
log = (thing) ->
	util.log util.inspect thing, true, 3