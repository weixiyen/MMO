# include zmq and redis
settings = require('./settings').db
redis = require 'redis'
zmq = require 'zeromq'
uuid = require 'uuid'

# stream server connection
stream = redis.createClient()
exports.stream = ( data ) ->
  stream.publish 'stream', JSON.stringify data

# data access layer connection
queries = {}
queries_err = {}
query = zmq.createSocket 'req'
query.connect settings.socket
query.on 'message', (_msg) ->
  msg = JSON.parse _msg
  if msg.data instanceof Error
    queries_err[ msg.id ] msg.data
  else
    queries[ msg.id ] msg.data
  delete queries[ msg.id ]
  delete queries_err[ msg.id ]
	
class Query
  constructor: ( @method, @params={} ) ->
    @id = uuid.generate()
  ok: (callback) ->
    query.send JSON.stringify
      id: @id
      method: @method
      params: @params
    queries[ @id ] = callback
  fail: (callback) ->	
    queries_err[ @id ]
		
exports.query = ( method, params )->
  return new Query method, params