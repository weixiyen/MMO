require.paths.unshift(process.cwd() + '/lib')
settings = require('settings').app
app = require 'web'
mq = require 'mq'

# take the argument if it exists
if process.argv[2]? 
  settings.port = process.argv[2]
  
app.start settings

app.requireDir settings.dir.handlers
app.requireDir settings.dir.middleware
app.front 'interceptor'
app.use 'auth'
app.use 'protect'

process.on 'uncaughtException', (err) ->
	console.log err.stack