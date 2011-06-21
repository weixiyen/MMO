MM.add 'map', (opts) ->
  
  class Map
        
    constructor: (options) ->
      
      @change = options.change
      @$map = options.$map
      @$tileMap = options.$tileMap
      @tileWidth = options.tileWidth
      @tileHeight = options.tileHeight
      @halfTileWidth = Math.floor( options.tileWidth / 2 )
      @halfTileHeight = Math.floor( options.tileHeight / 2 )
      @nodeWidth = @halfTileWidth
      @nodeHeight = @halfTileHeight
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
      @pos = [options.xcoord, options.ycoord]
      @xOffset = -1 * Math.ceil( MM.settings.partyBox.width / 2.5 )
      @yOffset = 0
      @tileEagerloadDepth = 6

      
      # initialize functions
      @setViewportInfo()
      @goTo @pos[0], @pos[1]
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
      newXcoord = @pos[0]
      newYcoord = @pos[1]
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
      
    
    completedPath: (node1, node2, coords) ->

      if !coords?
        coords = [@pos[0], @pos[1]]

      direction = @getSimpleDirection @getDirection node1, node2
      if direction == @dir.W and coords[0] <= node2[0]
        return true
      else if direction == @dir.E and coords[0] >= node2[0]
        return true
      else if direction == @dir.N and coords[1] <= node2[1]
        return true
      else if direction == @dir.S and coords[1] >= node2[1]
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

      tileEagerloadDepth = @tileEagerloadDepth
      nodeWidth = @nodeWidth
      nodeHeight = @nodeHeight
      x2max = @tileMap[0].length    # only consider tiles
      y2max = @tileMap.length       # only consider tiles
      
      x1 = @pos[0] - @viewportHalfWidth
      y1 = @pos[1] - @viewportHalfHeight
      x2 = @pos[0] + @viewportHalfWidth
      y2 = @pos[1] + @viewportHalfHeight

      x1 = Math.floor( x1 / nodeWidth ) - tileEagerloadDepth
      y1 = Math.floor( y1 / nodeHeight ) - tileEagerloadDepth
      x2 = Math.floor( x2 / nodeWidth ) + tileEagerloadDepth
      y2 = Math.floor( y2 / nodeHeight ) + tileEagerloadDepth

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
      xcoord = Math.floor( left / @nodeWidth )
      ycoord = Math.floor( top / @nodeHeight )
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

    getSimpleDirection: (direction) ->
      return if direction.length == 2 then direction.substr 0, 1 else direction
    
    getPath: (start, end) ->
      try
        a = @collisionGraph.nodes[ start[1] ][ start[0] ]
        b = @collisionGraph.nodes[ end[1] ][ end[0] ]
        path = $.astar.search @collisionGraph.nodes, a, b
        nodepath = []
        nodeWidth = @nodeWidth
        nodeHeight = @nodeHeight

        #@$tileMap.find('.path').remove()
        #html = []

        for node in path
          #left = node[0] * tileWidth + 'px'
          #top = node[1] * tileHeight + 'px'
          #tileHtml = '<div class="tile path" style="left:'+left+';top:'+top+';"></div>'
          #html.push tileHtml

          x = node[0] * nodeWidth
          y = node[1] * nodeHeight
          nodepath.push [x, y]

        #@$tileMap.append html.join ''

        return nodepath
      catch error
        return []

    getTilesToAddAndRemove: (topLeftCoord, bottomRightCoord) ->

      x1 = topLeftCoord[0]
      y1 = topLeftCoord[1]
      x2 = bottomRightCoord[0]
      y2 = bottomRightCoord[1]

      nodeWidth = @nodeWidth
      nodeHeight = @nodeHeight
      tileWidth = @tileWidth
      tileHeight = @tileHeight
      addHtml = []
      purgeIds = []
      newViewableTiles = {}

      y = y1
      while y < y2
        x = x1
        while x < x2
          if (0 == y % 2 and 0 == x % 2) or (0 != y % 2 and 0 != x % 2)
            stub = 't_'+x+'_'+y
            tile = @tileMap[y][x]
            newViewableTiles[stub] = tile

            if !@viewableTiles[stub]?
              @viewableTiles[stub] = tile
              left = (x * nodeWidth - nodeWidth/2) + 'px'
              top = (y * nodeHeight - nodeHeight/2) + 'px'
              addHtml.push '<div id="'+stub+'" class="tile type-'+tile+'" style="z-index:'+y+';left:'+left+';top:'+top+';width:'+tileWidth+'px;height:'+tileHeight+'px;"></div>'
          x++
        y++

      for k, v of @viewableTiles
        if !newViewableTiles[k]?
          delete @viewableTiles[k]
          purgeIds.push('#'+k)

      return [addHtml, purgeIds]
        
    getTileType: (xcoord, ycoord) ->
      x = Math.floor( xcoord / @nodeWidth )
      y = Math.floor( ycoord / @nodeHeight )
      if undefined == @tileMap[ y ] or undefined == @tileMap[ y ][ x ]
        return false
      @tileMap[ y ][ x ]
      
    goTo: (xcoord, ycoord) ->
      @setCoords xcoord, ycoord
      @$map.css
        left: @left + @xOffset
        top: @top + @yOffset
    
    panStart: (direction, xBound=0, yBound=0) ->
      loopId = 'pan_map_' + direction
      $.loop.add loopId, =>
        if @canShift direction, xBound, yBound
          @$map.css @shift direction
          MM.user.el.css
            zIndex: @pos[1]

    panStop: (direction) ->
      $.loop.remove 'pan_map_' + direction
    
    setCoords: (xcoord, ycoord) ->
      @pos[0] = xcoord
      @pos[1] = ycoord
      @left = xcoord * -1 + @viewportHalfWidth
      @top = ycoord * -1 + @viewportHalfHeight
    
    setViewportInfo: ->
      @viewportWidth = $(window).width()
      @viewportHeight = $(window).height()
      @viewportHalfWidth = parseInt @viewportWidth / 2, 10
      @viewportHalfHeight = parseInt @viewportHeight / 2, 10
    
    shift: (direction) ->

      change = @change
      changeX = change+1
      
      if MM.user.movingDiagonally()
        change -= 2
        changeX -= 1
        
      if direction == @dir.W
        @pos[0] -= changeX
        @left += changeX
      else if direction == @dir.E
        @pos[0] += changeX
        @left -= changeX
      else if direction == @dir.N
        @pos[1] -= change
        @top += change
      else if direction == @dir.S
        @pos[1] += change
        @top -= change

      pos = 
        left: @left + @xOffset
        top: @top + @yOffset
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

    
    # TESTING
    # MM.global['username'] = prompt('Enter Your Character Name:')
    MM.global['username'] = 'Player 1'
    tileMap = []
    wMax = 50
    hMax = 50
    w = 0
    h = 0
    while h < hMax
      tileMap.push []
      w = 0
      while w < wMax
        if (0 == h % 2 and 0 == w % 2) or (0 != h % 2 and 0 != w % 2)
          random = MM.random 0, 2
          if 0 == random
            tileMap[h][w] = 99 # blocked tile
          else
            tileMap[h][w] = random
        else
          tileMap[h][w] = 1 # non-tiles
        w++
      h++
      
    arrPos = []
    totalSprites = 25
    xMax = tileMap[0].length * 64
    yMax = tileMap.length * 32

    # END TESTING

    MM.extend 'map', new Map
      $map: opts.el
      $tileMap: $('#ui-map-1')
      xcoord: MM.random 0, xMax / 2
      ycoord: MM.random 0, yMax / 2
      change: 4
      tileWidth: 128
      tileHeight: 64
      tileMap: tileMap
      collisionTypes: [99, 98]
      NPC: NPC
      Player: Player

    MM.use 'user'

    ###
    MM.map.$tileMap.delegate '.tile', 'click', (e) ->
      tgt = $(e.target)
      tgt.parent().find('.path').removeClass('path')
      tgt.addClass('path')
      left = (parseInt tgt.css('left'), 10) + MM.map.nodeWidth
      top = (parseInt tgt.css('top'), 10) + MM.map.nodeHeight / 2
      MM.user.runTo [left, top]
    ###


    ###
    Testing purposes!!! BELOW
    ###


    
    i = 0
    while i < totalSprites
      x = MM.random 0, xMax / 2
      y = MM.random 0, yMax / 2
      arrPos.push [x, y]
      i++
    id = 0
    for pos in arrPos
      id++
      MM.map.addUnits
        id: 'npc-' + id
        type: 'npc'
        height: 60
        width: 65
        imgpath: '/img/sprite_monster.png'
        pos: pos
        speed: if id == 1 then 4 else if id < 11 then 3 else 2
        name: if id == 1 then 'Leaping Lizzy' else if id < 11 then 'Fast Lizard' else 'Lizard'
        skip: if id == 1 then 3 else if id < 11 then 4 else 5
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
      x = MM.random 0, xMax / 2
      y = MM.random 0, yMax / 2

      #MM.map.npcs['npc-'+id].chase MM.map.npcs['npc-'+ (id-1)]
      MM.map.npcs['npc-'+id].chase()

    MM.log 'total sprites', id
    
