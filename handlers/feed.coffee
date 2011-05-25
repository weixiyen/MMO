require.paths.unshift(process.cwd() + '/lib')
app = require 'web'
mq = require 'mq'

app.get '/api/feed/topics', (req, res) ->
  query = mq.query 'Topic:getTopics',
    sport: req.params.sport
    skip: req.params.skip
    limit: req.params.limit
  query.ok (data) ->
    res.json data

###
app.get '/feed/:sport', (req, res) ->
  res.end 'your sport is => ' + req.params.sport
  
app.get '/feed/:sport/:topic', (req, res) ->
  res.end req.params.sport + '/' + req.params.topic + '?' + req.params.name

app.get '/login', (req,res) ->
	json = 
		asdf: 'asdf',
		kkk: 'okdsf'
	res.json json
	
app.get '/', (req, res) ->
	html = app.render 'marketing/homepage'
	res.html html

app.get '/redirect', (req, res) ->
	res.redirect '/'
	
app.get '/send/:message', (req, res) ->
	mq.stream
	  channel: 'football:fantasy'
		data: req.params.message
	res.end 'sent to football:fantasy'
	
app.get '/db', (req, res) ->	
	query = mq.query 'User:getRecentTopics', id: 4
	query.ok (name) ->
		mq.stream 
			channel: 'football:fantasy'
			data: name
		res.end 'success'
	query.fail (err) ->
		res.end 'error'

# only give access to member
app.get '/foo', {intercept: true}, (req,res) ->
	res.end req.session + ' ' + req.foo + ' ' + req.fan
###