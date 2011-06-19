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
      @NPC = options.NPC
      @Player = options.Player
      @npcs = {}
      @players = {}
      @unitStub = 'unit-'

      # initialize functions
      @setViewportInfo()
      @goTo options.xcoord, options.ycoord
      @startUIGenerator()
      @generateCollisionGraph @tileMap
      
    accessible: (xcoord, ycoord) ->
      tileType = @getTileType xcoord, ycoord
      if tileType == false
        return false
      -1 == $.inArray( tileType, @collisionTypes )

    addNpc: (data) ->

      tag = @unitStub + data.id
      data.el = $('<div id="'+ tag + '" class="unit"></div>')
      @npcs[data.id] = new @NPC data
      @$map.append @npcs[data.id].el
      
    addPlayer: (data) ->

      tag = @unitStub + data.id
      data.el = $('<div id="'+ tag + '" class="unit"></div>')
      @npcs[data.id] = new @NPC data
      @$map.append @npcs[data.id].el

    addUnits: (arrData) ->
      addHtml = []
      if false == arrData instanceof Array
        arrData = [ arrData ]
      for data in arrData
        if !@npcs[data.id]? and !@players[data.id]
          
          if data.type == 'npc'
            @addNpc data
          if data.type == 'player'
            @addPlayer data
    
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
    
    generateUI: ->
      
      tileSize = @tileSize
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

      topLeftCoord = [x1,y1]
      bottomRightCoord = [x2,y2]

      tiles = @getTilesToAddAndRemove topLeftCoord, bottomRightCoord
      addHtml = tiles[0]
      purgeIds = tiles[1]
      
      @$tileMap.append addHtml.join ''
      $( purgeIds.join(',') ).remove()
    
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

    getTilesToAddAndRemove: (topLeftCoord, bottomRightCoord) ->

      x1 = topLeftCoord[0]
      y1 = topLeftCoord[1]
      x2 = bottomRightCoord[0]
      y2 = bottomRightCoord[1]

      tileSize = @tileSize
      addHtml = []
      purgeIds = []
      newViewableTiles = {}

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
            addHtml.push '<div id="'+stub+'" class="tile type-'+tile+'" style="left:'+left+';top:'+top+';"></div>'

          x++
        y++

      for k, v of @viewableTiles
        if !newViewableTiles[k]?
          delete @viewableTiles[k]
          purgeIds.push('#'+k)

      return [addHtml, purgeIds]
        
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
      loopId = 'pan_map_' + direction
      $.loop.add loopId, =>
        if @canShift direction, xBound, yBound
          @$map.css @shift direction
          MM.user.el.css
            zIndex: @ycoord

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

    removeUnit: (id) ->
      delete @npcs[id]
      delete @players[id]
      $('#' + @unitStub + id).remove()

    startUIGenerator: ->
      @generateUI()
      $.loop.add 'map:ui:generator', 40, =>
        @generateUI()
    
      
  ui_path = 'maps/map_' + opts.map_id
  MM.require ui_path, 'css'
  MM.require 'map', 'css'
  MM.require 'class/unit'
  MM.require 'sprite'
  MM.require 'user'
  
  MM.run ->

    MM.use 'sprite'

    NPC = MM.use 'class/unit', 'npc'
    Player = MM.use 'class/unit', 'pc'

    MM.render opts.el, ui_path
    MM.extend 'map', new Map
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
      NPC: NPC
      Player: Player

    MM.use 'user'

    arrPos = [
      [750, 750]
      [800, 800]
      [600, 750]
      [600, 600]
      [550, 500]
      [550, 700]
      [800, 550]
      [800, 575]
      [450, 750]
      [800, 850]
      [900, 900]
      [634, 622]
      [544, 537]
      [673, 839]
      [546, 574]
      [675, 584]
      [630, 752]
      [654, 834]
      [300, 430]
      [843, 450]
      [784, 434]
      [534, 400]
      [400, 530]
      [300, 525]
      [550, 730]
      [600, 860]
      [300, 970]
      [434, 682]
      [544, 537]
      [373, 829]
      [446, 534]
      [575, 524]

      [950, 750]
      [1000, 800]
      [1100, 750]
      [1000, 600]
      [1150, 500]
      [1050, 700]
      [1100, 550]
      [1000, 575]
      [1150, 750]
      [1100, 850]
      [1000, 900]
      [1034, 622]
      [1144, 537]
      [1073, 839]
      [1146, 574]
      [1175, 584]
      [1130, 752]
      [954, 834]
      [900, 430]
      [943, 450]
      [1184, 434]
      [1034, 400]
      [900, 530]
      [900, 525]
      [950, 730]
      [1100, 860]
      [1000, 970]
      [934, 682]
      [1144, 537]
      [973, 829]
      [1046, 534]
      [1175, 524]
    ]
    id = 0
    for pos in arrPos
      MM.map.addUnits
        id: 'npc-' + id
        type: 'npc'
        height: 60
        width: 65
        imgpath: '/img/sprite_monster.png'
        pos: pos
        anim:
          s: [
            "0 0",
            "-65px 0",
            "-130px 0"
          ],
          n: [
            "-195px 0",
            "-260px 0",
            "-325px 0"
          ],
          w: [
            "-390px 0",
            "-455px 0",
            "-520px 0"
          ],
          e: [
            "-585px 0",
            "-650px 0",
            "-715px 0"
          ]
      id++
    MM.log 'total sprites', id
    
    MM.map.$tileMap.delegate '.tile', 'click', (e) ->
      tgt = $(e.target)
      left = parseInt tgt.css('left'), 10
      top = parseInt tgt.css('top'), 10
      MM.user.runTo [left, top]