MM.ui 'map', (opts) ->
  
  class Map
        
    constructor: (options) ->
      @change = options.change
      @$map = options.$map
      @$tileMap = options.$tileMap
      @tileSize = options.tileSize
      @tileMap = options.tileMap
      @generateTiles()
      @goTo options.xcoord, options.ycoord
      @generateCollisionMap options.tileMap, options.collisionTypes
      @userXBound = 12 + options.change
      @userYBound = 16 + options.change
    
    accessible: (xcoord, ycoord) ->
      tileSize = @tileSize
      x = Math.floor( xcoord / @tileSize )
      y = Math.floor( ycoord / @tileSize )
      if undefined == @collisionMap[ y ]
        return true
      @collisionMap[ y ][ x ]
    
    canShift: (direction) ->
      newXcoord = @xcoord
      newYcoord = @ycoord
      
      if direction == 'left'
        newXcoord -= @userXBound
      else if direction == 'right'
        newXcoord += @userXBound
      else if direction == 'up'
        newYcoord -= @userYBound
      else if direction == 'down'
        newYcoord += @userYBound
      
      @accessible newXcoord, newYcoord
    
    generateCollisionMap: (tiles, types) ->
      collisionMap = []
      x = y = 0
      len = tiles[0].length

      getAccessible = (type) ->
        -1 == $.inArray( type, types )
      createRow = ( row ) ->
        collisionMap.push []
        createTile( tile ) for tile in row
        y += 1
      createTile = ( tile ) ->
        collisionMap[y][x] = getAccessible tile
        x += 1
        if x == len
          x = 0
      createRow( row ) for row in tiles
      @collisionMap = collisionMap
    
    generateTiles: ->
      tileSize = @tileSize
      tiles = @tileMap
      mapHtml = []
      x = y = 0
      len = tiles[0].length
      
      processRow = (row) ->
        createTile( tile ) for tile in row
        y += 1
      createTile = (tile) ->
        left = (x * tileSize) + 'px'
        top = (y * tileSize) + 'px'
        tileHtml = '<div class="tile type-'+tile+'" style="left:'+left+';top:'+top+';"></div>'
        mapHtml.push tileHtml 
        x += 1
        if x == len
          x = 0
          
      processRow( row ) for row in tiles
      
      @$tileMap.html mapHtml.join ''
      
    goTo: (xcoord, ycoord) ->
      @setCoords xcoord, ycoord
      @$map.css
        left: @left
        top: @top
      
    panStart: (direction) ->
      map = @$map
      loopId = 'pan_map_' + direction
      $.loop.add loopId, ->
        if MM.map.canShift direction
          map.css MM.map.shift direction

    panStop: (direction) ->
      $.loop.remove 'pan_map_' + direction
    
    setCoords: (xcoord, ycoord) ->
      @xcoord = xcoord
      @ycoord = ycoord
      @left = xcoord * -1 + $(window).width() / 2
      @top = ycoord * -1 + $(window).height() / 2
    
    shift: (direction) ->
      change = @change
      if direction == 'left'
        @xcoord -= change
        @left += change
      else if direction == 'right'
        @xcoord += change
        @left -= change
      else if direction == 'up'
        @ycoord -= change
        @top += change
      else if direction == 'down'
        @ycoord += change
        @top -= change
      pos = 
        left: @left
        top: @top
      return pos
    
      
  ui_path = 'maps/map_' + opts.map_id
  MM.require ui_path, 'css'
  
  MM.run ->
  
    MM.render opts.el, ui_path
        
    MM.map = new Map 
      $map: opts.el
      $tileMap: $('#ui-map-1')
      xcoord: 0
      ycoord: 0
      change: 3
      tileSize: 50
      tileMap: [
        [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5]
        [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5]
        [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5]
        [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5]
      ]
      collisionTypes: [99, 98]