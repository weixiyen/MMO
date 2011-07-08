require.paths.unshift(process.cwd() + '/lib')
redis = require 'redis'
settings = require('settings').stream

# DEFAULT SETTINGS
# -------------------------------------------------
settings.port = process.argv[2] if process.argv[2]?
io = require('socket.io').listen Number(settings.port)

subscriber = redis.createClient()

io.sockets.on 'connection', (client) ->
  subscriber.subscribe 'stream'
  subscriber.on 'message', ( channel, raw_data ) ->
    msg = JSON.parse raw_data
    client.emit msg.channel, msg.data

process.on 'uncaughtException', (err) ->
	console.log err.stack