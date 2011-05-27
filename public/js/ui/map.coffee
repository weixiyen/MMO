MM.ui 'map', (opts) ->
  
  class Map
    constructor: (@el) ->
      @top = 0
      @left = 0
      @tick = 50
    pan: (direction) ->
      if direction == 'left'
        @left+=@tick
      if direction == 'right'
        @left-=@tick
      if direction == 'up'
        @top+=@tick
      if direction == 'down'
        @top-=@tick
      properties = 
        left: @left
        top: @top
      @el.animate properties,
        queue: false
        easing: false
      
  ui_path = 'maps/map_' + opts.map_id
  MM.require ui_path, 'css'
  
  MM.run ->
    MM.render opts.el, ui_path
    
    # json data to initialize map
    MM.map = new Map opts.el