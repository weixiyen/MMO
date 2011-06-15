MM.add 'map', (opts) ->
  
  class Map
        
    constructor: (options) ->
      
      @change = options.change
      @$map = options.$map
      @$tileMap = options.$tileMap
      @tileSize = options.tileSize
      @halfTileSize = Math.floor( options.tileSize / 2 )
      @tileMap = options.tileMap
      @viewableTiles = {}
      @collisionTypes = options.collisionTypes
      @dir = 
        N: 'n'
        E: 'e'
        S: 's'
        W: 'w'
      
      @setViewportInfo()
      @goTo options.xcoord, options.ycoord
      @startTileGenerator()
      @generateCollisionGraph @tileMap
      
    accessible: (xcoord, ycoord) ->
      tileType = @getTileType xcoord, ycoord
      if tileType == false
        return false
      -1 == $.inArray( tileType, @collisionTypes )
    
    canShift: (direction, xBound, yBound) ->
      newXcoord = @xcoord
      newYcoord = @ycoord
      xBound += @change
      yBound += @change
      
      if direction == @dir.W
        newXcoord -= xBound
      else if direction == @dir.E
        newXcoord += xBound
      else if direction == @dir.N
        newYcoord -= yBound
      else if direction == @dir.S
        newYcoord += yBound
      
      @accessible newXcoord, newYcoord
    
    completedPath: (node1, node2) ->
      direction = MM.user.getSimpleDirection @getDirection node1, node2
      if direction == @dir.W and @xcoord <= node2[0]
        return true
      else if direction == @dir.E and @xcoord >= node2[0]
        return true
      else if direction == @dir.N and @ycoord <= node2[1]
        return true
      else if direction == @dir.S and @ycoord >= node2[1]
        return true
      return false
    
    generateCollisionGraph: (tiles) ->
      collisionMap = []
      collisionTypes = @collisionTypes
      x = y = 0
      len = tiles[0].length

      getAccessible = (type) ->
        if -1 == $.inArray( type, collisionTypes ) then 0 else 1
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
      @collisionGraph = $.astar.graph collisionMap
    
    generateTiles: ->
      tileSize = @tileSize
      mapHtml = []
      purgeList = []
      newViewableTiles = {}
      x2max = @tileMap[0].length
      y2max = @tileMap.length
      
      x1 = @xcoord - @viewportHalfWidth
      y1 = @ycoord - @viewportHalfHeight
      x2 = @xcoord + @viewportHalfWidth
      y2 = @ycoord + @viewportHalfHeight
      
      x1 = Math.floor( x1 / tileSize ) - 3
      y1 = Math.floor( y1 / tileSize ) - 3
      x2 = Math.floor( x2 / tileSize ) + 3
      y2 = Math.floor( y2 / tileSize ) + 3
      
      x1 = if x1 < 0 then 0 else x1
      y1 = if y1 < 0 then 0 else y1
      x2 = if x2 > x2max then x2max else x2
      y2 = if y2 > y2max then y2max else y2
      
      y = y1
      while y <= y2
        x = x1
        while x <= x2
          
          stub = 't_'+x+'_'+y
          tile = @tileMap[y][x]
          newViewableTiles[stub] = tile
          
          if !@viewableTiles[stub]?
            @viewableTiles[stub] = tile
            left = (x * tileSize) + 'px'
            top = (y * tileSize) + 'px'
            mapHtml.push '<div id="'+stub+'" class="tile type-'+tile+'" style="left:'+left+';top:'+top+';"></div>'
              
          x++
        y++
      
      for k, v of @viewableTiles
        if !newViewableTiles[k]?
          delete @viewableTiles[k]
          purgeList.push('#'+k)
      
      @$tileMap.append mapHtml.join ''
      $( purgeList.join(',') ).remove()
    
    getCoordsByPos: (left, top) ->
      xcoord = Math.floor( left / @tileSize )
      ycoord = Math.floor( top / @tileSize )
      return [ xcoord, ycoord ]
    
    getDirection: (from, to) ->
      direction = ''
      if from[1] > to[1]
        direction += @dir.N
      else if from[1] < to[1]
        direction += @dir.S
      if from[0] > to[0]
        direction += @dir.W
      else if from[0] < to[0]
        direction += @dir.E
      return direction
    
    getPath: (start, end) ->
      a = @collisionGraph.nodes[ start[1] ][ start[0] ]
      b = @collisionGraph.nodes[ end[1] ][ end[0] ]
      path = $.astar.search @collisionGraph.nodes, a, b
      nodepath = []
      tileSize = @tileSize
      halfTileSize = @halfTileSize
      
      # XXX
      @$tileMap.find('.path').remove()
      html = [] 

      for node in path
        # XXX
        left = node[0] * tileSize + 'px'
        top = node[1] * tileSize + 'px'
        tileHtml = '<div class="tile path" style="left:'+left+';top:'+top+';"></div>'
        html.push tileHtml
        
        x = node[0] * tileSize + halfTileSize
        y = node[1] * tileSize + halfTileSize
        nodepath.push [x, y]
      
      # XXX
      @$tileMap.append html.join ''
      
      return nodepath
        
    getTileType: (xcoord, ycoord) ->
      x = Math.floor( xcoord / @tileSize )
      y = Math.floor( ycoord / @tileSize )
      if undefined == @tileMap[ y ] or undefined == @tileMap[ y ][ x ]
        return false
      @tileMap[ y ][ x ]
      
    goTo: (xcoord, ycoord) ->
      @setCoords xcoord, ycoord
      @$map.css
        left: @left
        top: @top
    
    panStart: (direction, xBound=0, yBound=0) ->
      map = @$map
      loopId = 'pan_map_' + direction
      $.loop.add loopId, =>
        if @canShift direction, xBound, yBound
          map.css @shift direction

    panStop: (direction) ->
      $.loop.remove 'pan_map_' + direction
    
    setCoords: (xcoord, ycoord) ->
      @xcoord = xcoord
      @ycoord = ycoord
      @left = xcoord * -1 + @viewportHalfWidth 
      @top = ycoord * -1 + @viewportHalfHeight
    
    setViewportInfo: ->
      @viewportWidth = $(window).width()
      @viewportHeight = $(window).height()
      @viewportHalfWidth = parseInt @viewportWidth / 2, 10
      @viewportHalfHeight = parseInt @viewportHeight / 2, 10
    
    shift: (direction) ->

      change = @change
      
      if MM.user.movingDiagonally()
        change -= 1
        
      if direction == @dir.W
        @xcoord -= change
        @left += change
      else if direction == @dir.E
        @xcoord += change
        @left -= change
      else if direction == @dir.N
        @ycoord -= change
        @top += change
      else if direction == @dir.S
        @ycoord += change
        @top -= change

      pos = 
        left: @left
        top: @top
      return pos
    
    startTileGenerator: ->
      @generateTiles()
      $.loop.add 'map:tileGenerator', 40, =>
        @generateTiles()
    
      
  ui_path = 'maps/map_' + opts.map_id
  MM.require ui_path, 'css'
  
  MM.run ->
  
    MM.render opts.el, ui_path
        
    MM.map = new Map 
      $map: opts.el
      $tileMap: $('#ui-map-1')
      xcoord: 700
      ycoord: 650
      change: 3
      tileSize: 75
      tileMap: [
        [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5]
        [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5]
        [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5]
        [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5]
        [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5]
        [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5]
        [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5]
        [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5]
        [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5]
        [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5]
        [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5]
        [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5]
        [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5]
        [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5]
        [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5]
        [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5]
        [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5]
        [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5]
        [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
        [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]
      ]
      collisionTypes: [99, 98]
    
    MM.map.$tileMap.delegate '.tile', 'click', (e) ->
      tgt = $(e.target)
      left = parseInt tgt.css('left'), 10
      top = parseInt tgt.css('top'), 10
      MM.user.runTo [left, top]
      