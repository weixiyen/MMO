SB.ui 'feed', (opts) ->

  SB.require 'feed', 'css'

  SB.run ->
    
    request = SB.get
      url: '/api/feed/topics'
      data:
        sport: 'football'
        skip: 0
        limit: 25
    
    request.success (topics) ->
      SB.render opts.el, 'feed',
        locals: 
          topics: topics
        