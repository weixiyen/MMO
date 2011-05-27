MM.ui 'map', (opts) ->
  
  class Map
    
    constructor: (@el) ->
      @top = 0
      @left = 0
      @change = 2
      
    panStart: (direction) ->
      if direction == 'left'
        $.loop.add 'pan_map_left', ->
          MM.map.el.css
            left: MM.map.left += MM.map.change
      if direction == 'right'
        $.loop.add 'pan_map_right', ->
          MM.map.el.css
            left: MM.map.left -= MM.map.change
      if direction == 'up'
        $.loop.add 'pan_map_up', ->
          MM.map.el.css
            top: MM.map.top += MM.map.change
      if direction == 'down'
        $.loop.add 'pan_map_down', ->
          MM.map.el.css
            top: MM.map.top -= MM.map.change

    panStop: (direction) ->
      handle = 'pan_map_' + direction
      $.loop.remove handle
      
  ui_path = 'maps/map_' + opts.map_id
  MM.require ui_path, 'css'
  
  MM.run ->
    MM.render opts.el, ui_path
    
    # json data to initialize map
    MM.map = new Map opts.el