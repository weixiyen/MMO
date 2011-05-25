require.paths.unshift(process.cwd() + '/lib')
app = require 'web'

app.createMiddleware 'auth', (mw) ->
  mw.req.userid = 'whatever'
  mw.req.foo = 'bar'
  mw.next()
	
# create the protect middleware
app.createMiddleware 'protect', (mw) ->
  mw.req.fan = 'baz'
  mw.req.foo = 'baz'

  # middleware interception
  if mw.handler.options.intercept == true
    mw.res.end 'middleware interception'
    return

  # otherwise continue
  mw.next()