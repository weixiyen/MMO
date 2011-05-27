MM.ui 'user', (opts) ->

  class User
    constructor: (data) ->
      @el = data.el
      @height = data.height
      @width = data.width
  
  MM.require 'user', 'css'
  
  MM.run ->
    
    # pull from DB in production
    data = 
      height: 100
      width: 50
    
    # make public data for others to use  
    MM.user = new User
      el: opts.el
      height: data.height
      width: data.width
    
    # bind some controls for movement
    $(document).keydown (e) ->
      e.preventDefault()
      code = e.keyCode
      if code == 37
        MM.map.pan 'left'
      else if code == 38
        MM.map.pan 'up'
      else if code == 39
        MM.map.pan 'right'
      else if code == 40
        MM.map.pan 'down'
        
    $(document).keyup (e) ->
      e.preventDefault()
  