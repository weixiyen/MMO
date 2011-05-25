exports.app =
  port: 5000
  dir: 
    handlers: 'handlers'
    middleware: 'middleware'
    templates: 'templates'

exports.db = 
  socket: 'tcp://127.0.0.1:5555'
  dir:
    models: 'models'
  mongo: 'mongodb://localhost/sleeperbot'

exports.stream =
  port: 5100
		