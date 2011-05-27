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
        MM.map.panStart 'left'
      else if code == 38
        MM.map.panStart 'up'
      else if code == 39
        MM.map.panStart 'right'
      else if code == 40
        MM.map.panStart 'down'
        
    $(document).keyup (e) ->
      e.preventDefault()
      code = e.keyCode
      if code == 37
        MM.map.panStop 'left'
      else if code == 38
        MM.map.panStop 'up'
      else if code == 39
        MM.map.panStop 'right'
      else if code == 40
        MM.map.panStop 'down'
  