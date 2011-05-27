MM.ui 'map', (opts) ->
  
  class Map
    
    constructor: (@el) ->
      @top = 0
      @left = 0
      @change = 2
      
    panStart: (direction) ->
      user = @el
      if direction == 'left'
        $.loop.add 'pan_map_left', ->
          user.css
            left: MM.map.left += MM.map.change
      if direction == 'right'
        $.loop.add 'pan_map_right', ->
          user.css
            left: MM.map.left -= MM.map.change
      if direction == 'up'
        $.loop.add 'pan_map_up', ->
          user.css
            top: MM.map.top += MM.map.change
      if direction == 'down'
        $.loop.add 'pan_map_down', ->
          user.css
            top: MM.map.top -= MM.map.change

    panStop: (direction) ->
      $.loop.remove 'pan_map_' + direction
      
  ui_path = 'maps/map_' + opts.map_id
  MM.require ui_path, 'css'
  
  MM.run ->
    MM.render opts.el, ui_path
    
    # json data to initialize map
    MM.map = new Map opts.el