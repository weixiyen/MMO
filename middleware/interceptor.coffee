###

DESCRIPTION:
Intercept the request and determine if it's allowed to reach any further.

REASON:
SB route navigation is completely handled on the client

###
require.paths.unshift(process.cwd() + '/lib')
app = require 'web'
uuid = require('uuid').generate()

app.createFrontend 'interceptor', (mw) ->
  
  dir = mw.req.pathname.split('/')[1]
  
  # if the path IS NOT of the no_intercept_list
  if -1 == no_intercept_list.indexOf dir
    html = app.render 'marketing/homepage',
      uuid: uuid
    return mw.res.html html

  # otherwise continue
  mw.next()

no_intercept_list = [
  'api'
]