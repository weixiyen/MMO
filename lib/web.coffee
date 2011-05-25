util = require 'util'
http = require 'http'
fs = require 'fs'
parseUrl = require('url').parse
jade = require 'jade'
querystring = require 'querystring'
handlers = [] # instantiate the handlers queue
frontend_queue = [] # middleware function queue
frontends = {} # the middleware dictionary
middleware_queue = [] # middleware function queue
middlewares = {} # the middleware dictionary
templates = {} # the templates dictionary
ENV = process.env.ENV

# DEFAULTS
# -------------------------------------------------
settings = 
  port: 5100
  dir:
    templates: 'templates'

# EXPORTS
# -------------------------------------------------
exports.start = (opts=settings) ->
  settings = settings extends opts
  server = http.createServer (req, res) ->
    handler_found = false
    # add req.pathname, req.query, and req.body
    req.addParams ->
      async.loop frontend_queue, {req:req, res:res}, (data) ->
        req = data.req
        res = data.res
        
        for handler in handlers
          # does the url request match one of our handlers?
          # if so, make all GET and POST variables accessible on req.params
          if req.method == handler.options.method and req.pathname.match handler.pattern_regex
            handler_found = true
            req.params = handler.buildParams req

            # Execute the useMiddleware function which
            # uses async recursion to ensure the req, res, and handler
            # go through the entire middleware process.
            # Middleware is defined by users in their apps with the "use" function
            async.loop middleware_queue, {req:req, res:res, handler:handler}, (data) ->
              req = data.req
              res = data.res
              handler = data.handler						
              handler.fn req, res

            # stop the for...in loop on handlers
            # unnecessary processing
            break
					
        if !handler_found
          res.notFound()
        
  server.listen settings.port
  compileTemplates settings.dir.templates
	

# create a RESTful handler object and add it to 
# the handlers queue
exports.get = (pattern, options, fn) ->
  createHandler 'GET', pattern, options, fn
exports.post = (pattern, options, fn) ->
  createHandler 'POST', pattern, options, fn
exports.put = (pattern, options, fn) ->
  createHandler 'PUT', pattern, options, fn
exports.del = (pattern, options, fn) ->
  createHandler 'DELETE', pattern, options, fn
createHandler = (method, pattern, options, fn) ->
  handler = new Handler pattern, options, fn
  handler.options.method = method
  handlers.push handler


# add a middleware to the queue
exports.use = (ware) ->
  middleware_queue.push middlewares[ware]

# offers an API for users to create middleware functions
exports.createMiddleware = (name, fn) ->
  middlewares[name] = fn

# add a middleware to the queue
exports.front = (ware) ->
  frontend_queue.push frontends[ware]

# offers an API for users to create middleware functions
exports.createFrontend = (name, fn) ->
  frontends[name] = fn

# renders html templates and provides include & inheritance features
exports.render = (key, locals={}) ->
  html = ''
  path = settings.dir.templates + '/' + key + '.jade'
  options = 
    locals: locals

  if ENV == 'dev'
    template = fs.readFileSync path, 'utf8'
    html = jade.render template, options
  else
    html = jade.render templates[path], options

  if html.match '%inherit:'
    inherit_tag = (html.match new RegExp '%inherit:[-_a-zA-Z0-9]+', 'g')[0]
    parent = exports.render inherit_tag.split(':')[1], locals
    return parent.replace '%body', html.replace inherit_tag, ''
	
  if html.match '%include:'
    include_tags = html.match new RegExp '%include:[-_a-zA-Z0-9]+', 'g'
    for tag in include_tags
      filepath = tag.split(':')[1]
      child = exports.render filepath, locals
      html = html.replace tag, child
    return html
	
  return html

exports.requireDir = (dirname) ->
  require.paths.unshift(process.cwd() + '/' + dirname)
  files = fs.readdirSync dirname
  if files
    for filename in files
      if filename.match new RegExp '.js$'
        require filename.slice 0, -3

# SERVER HELPERS
# -------------------------------------------------
# provides helper functionality
# to work with handlers
class Handler
  constructor: (@pattern, @options, @fn={}) ->
    if typeof @options == 'function'
      [@fn, @options] = [@options, @fn]
		
    # set the pattern_regex for this handler
    alnum_pattern = '[-_a-zA-Z0-9]+'
    token_re = new RegExp ':' + alnum_pattern, 'g'
    pattern_re = @pattern.replace token_re, alnum_pattern
    @pattern_regex = new RegExp '^' + pattern_re + '$'
		
  buildParams: (req) ->
    params = @getUrlParams req.pathname
    params = req.query extends params if req.query
    req.body extends params if req.body
  getUrlParams: (url) ->
    params = {}
    h_frags = @pattern.split '/'
    u_frags = url.split '/'
    for h_frag in h_frags
      if h_frag.substr(0, 1) == ':'
        h_frag = h_frag.substr 1
        params[h_frag] = u_frags[_i]
    params

# assigns req.pathname, req.query, and req.body
http.IncomingMessage::addParams = (callback) ->
  url = parseUrl @url, true
  @pathname = url.pathname
  @query = url.query
  body = ''
  @addListener 'data', (chunk) ->
    body += chunk
  @addListener 'end', ->
    @body = querystring.parse body
    callback()

# res.html()
http.ServerResponse::html = (html, status_code=200) ->
  @statusCode = status_code
  @setHeader 'Content-Type', 'text/html'
  @end html, 'utf8'

# res.json()
http.ServerResponse::json = (json, status_code=200) ->
  @statusCode = status_code
  @setHeader 'Content-Type', 'application/json'
  @end JSON.stringify json, 'json'

# res.redirect()
http.ServerResponse::redirect = (path) ->
  @statusCode = 302
  @setHeader 'Location', path
  @setHeader 'Content-Type', 'text/html'
  @end 'Redirecting...'

# res.notFound()
http.ServerResponse::notFound = () ->
  @statusCode = 404
  @setHeader 'Content-Type', 'text/html'
  @end '404 - file not found', 'utf8'
	
# TEMPLATE HELPERS
# -------------------------------------------------
compileTemplates = (dir) ->
  path = process.cwd() + '/' + dir + '/'
  filenames = fs.readdirSync path
  if filenames.length == 0
    return
  for filename in filenames
    key = dir+'/'+filename
    if (filename.substr filename.length-5) == '.jade'
      filepath = path + filename
      templates[ key ] = fs.readFileSync filepath, 'utf8'
    else
      compileTemplates key

	
# ASYNC HELPER FUNCTIONS
# -------------------------------------------------
exports.async = async = 
  # async loop
  # takes a function queue, data object, and final callback
  # loops through function queue using .continue()
  # to move on to the next function in sequential order
  # uses 1 isntance of AsyncLoop
  # OPTIONAL - data, default is {}
  loop: (fn_queue, data, last) ->
    new AsyncLoop fn_queue.slice(), data, last
		
# provides functionality to help
# developers create middleware
class AsyncLoop
  constructor: (@fn_queue, @data, @last={}) ->
    if typeof @data == 'function'
      [@last, @data] = [@data, @last]
    for k, v of @data 
      @[k] = v if @[k] != 'next'
    @next()
  next: ->
    if @fn_queue.length == 0
      @end()
      return
    @fn_queue.shift() @
  end: ->
    @last @


# UTILITY STUFF FOR DEVELOPMENT
# -------------------------------------------------
log = (thing) ->
  util.log util.inspect thing, true, 3

# memory consumption of this process
oldheap = 0
printMemory = ->
  usage = process.memoryUsage()
  newheap = usage.heapUsed
  log usage
  log ''
  log '>>>>>>>' + (newheap - oldheap) + '<<<<<<'
  log ''
  oldheap = newheap
#setInterval printMemory, 2000