MM.ui 'map', (opts) ->
  
  class Map
    
    constructor: (options) ->
      @change = options.change
      @el = options.el
      @goTo options.xcoord, options.ycoord
      
    panStart: (direction) ->
      el = @el
      if direction == 'left'
        $.loop.add 'pan_map_left', ->
          el.css
            left: MM.map.left += MM.map.change
      if direction == 'right'
        $.loop.add 'pan_map_right', ->
          el.css
            left: MM.map.left -= MM.map.change
      if direction == 'up'
        $.loop.add 'pan_map_up', ->
          el.css
            top: MM.map.top += MM.map.change
      if direction == 'down'
        $.loop.add 'pan_map_down', ->
          el.css
            top: MM.map.top -= MM.map.change

    panStop: (direction) ->
      $.loop.remove 'pan_map_' + direction
    
    setCoords: (xcoord, ycoord) ->
      @left = xcoord * -1 + $(window).width() / 2
      @top = ycoord * -1 + $(window).height() / 2
    
    goTo: (xcoord, ycoord) ->
      @setCoords xcoord, ycoord
      @el.css
        left: @left
        top: @top
      
  ui_path = 'maps/map_' + opts.map_id
  MM.require ui_path, 'css'
  
  MM.run ->
    MM.render opts.el, ui_path
    
    # json data to initialize map
    data = 
      el: opts.el
      xcoord: 60
      ycoord: 1400
      change: 2
    MM.map = new Map data