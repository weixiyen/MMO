MM.add 'user', (opts) ->
  
  class User
    constructor: (data) ->
      @name = data.name
      @map = data.map
      @el = $('<div id="user" class="user"><div class="name">'+@name+'</div></div>').appendTo(MM.map.$map)
      @elName = @el.find '.name:first'
      @height = data.height
      @width = data.width
      @imgpath = data.imgpath
      @id = data.id
      @anim = data.anim
      @spriteQueue = []
      @stub = 'user-'
      @moving =
        n: false
        e: false
        s: false
        w: false
      
      @el.css
        height: @height
        width: @width
        background: 'no-repeat url(' + @imgpath + ')'
        position: 'fixed'
        zIndex: MM.map.ycoord

      @elName.css
        left: @width / 2 - 50
        top: -10
        
      @tag = 
        automove: 'user:path:automove'
        pathloop: 'user:path:loop'
        
      @center()
      @face data.facing
      
    center: ->
      left = $(window).width() / 2 - @width / 2
      top = $(window).height() / 2 - @height / 2
      @put left, top
    
    # relative to screen
    put: (x, y) ->
      @el.css
        left: x
        top: y
    
    runTo: (coords) ->
      
      LOOPID = @tag.pathloop
      NODE1 = 'user:path:node:1'
      NODE2 = 'user:path:node:2'
      
      $.loop.remove LOOPID
      @stopAll()
      
      divisor = MM.map.tileSize
      x1 = Math.floor( MM.map.pos[0] / divisor )
      y1 = Math.floor( MM.map.pos[1] / divisor )
      x2 = Math.floor( coords[0] / divisor )
      y2 = Math.floor( coords[1] / divisor )
      path = MM.map.getPath [x1,y1], [x2,y2]

      # check for bad path
      if path.length < 2
        return
      
      # get new path segment & move the user
      run = =>
        if path.length < 2
          $.loop.remove LOOPID
          MM.user.stopAll()
          return
        MM.global[NODE1] = path.shift() 
        MM.global[NODE2] = path[0]
        @move MM.map.getDirection MM.global[NODE1], MM.global[NODE2]
      
      # GO!!!
      MM.global[ @tag.automove ] = true
      run()
      
      $.loop.add LOOPID, ->
        # detect if current path segment is completed
        # if so, then stop the user, then run new direction
        if MM.map.completedPath MM.global[NODE1], MM.global[NODE2]
          MM.user.stopAll()
          run()
          
    keyMove: (direction) ->
      
      $.loop.remove @tag.pathloop
      if MM.global[ @tag.automove ] == true
        MM.user.stopAll()
      MM.global[ @tag.automove ] = false
      @move (direction)
      
    move: (direction) ->
      # check to see if button is already pressed
      if @moving[ direction ] == true
        return
      else 
        @moving[ direction ] = true
      
      xBound = Math.floor( @width/2 )
      yBound = Math.floor( @height/2 )
      
      MM.map.panStart direction, xBound, yBound
      
      @stopAllSprites direction
      
      # begin animation
      @spriteStart @map.getSimpleDirection direction
    
    movingDiagonally: ->
      i = 0
      for k, v of @moving
        if v is true
          i+=1
      return i >= 2
      
    stop: (direction) ->
      @moving[ direction ] = false
      MM.map.panStop direction
      @spriteStop direction
    
    spriteStart: (direction) ->
      loopid = @stub + direction
      MM.sprite.start loopid,
        el: @el
        queue: @anim[direction]
        skip: 4
      @spriteQueueAdd direction
    
    spriteStop: (direction) ->
      MM.sprite.stop @stub+direction
      @spriteQueueRemove direction
      if @spriteQueue.length
        @spriteStart @spriteQueue[0]

      if MM.global[ @tag.automove ] == false
        @face direction
      
    spriteQueueAdd: (direction) ->
      if !@spriteQueueHas(direction)
        @spriteQueue.push direction
    
    spriteQueueRemove: (direction) ->
      index = @getSpriteQueueIndex direction
      @spriteQueue.splice index, 1
    
    getSpriteQueueIndex: (direction) ->
      return $.inArray direction, @spriteQueue
    
    spriteQueueHas: (direction) ->
      -1 != @getSpriteQueueIndex direction

    stopAllSprites: (direction) ->
      for k, v of @moving
        if @moving[ k ] == true
          MM.sprite.stop (@stub+k)
    
    stopAll: ->
      for k, v of @moving
        if @moving[ k ] == true
          @stop k
    
    teleport: (xcoord, ycoord) ->
      MM.map.goTo xcoord, ycoord
      
    face: (direction) ->
      direction = @map.getSimpleDirection direction
      @el.css
        'background-position': @anim[direction][1]
  
  MM.require 'user', 'css'
  
  MM.run ->

    # make public data for others to use  
    MM.user = new User
      map: MM.map
      height: 64
      width: 40
      imgpath: '/img/sprite_user.png'
      facing: 's'
      name: MM.global['username']
      anim:
        w: [
          "0 0",
          "-50px 0",
          "-100px 0"
        ],
        n: [
          "-150px 0",
          "-200px 0",
          "-250px 0"
        ],
        s: [
          "-300px 0",
          "-350px 0",
          "-400px 0"
        ],
        e: [
          "-450px 0",
          "-500px 0",
          "-550px 0"
        ]
    
    # bind some controls for movement
    $doc = $(document)
    
    $doc.keydown (e) ->
      e.preventDefault()
      e.stopPropagation()
      code = e.keyCode
      if code == 37
        MM.user.keyMove 'w'
      else if code == 38
        MM.user.keyMove 'n'
      else if code == 39
        MM.user.keyMove 'e'
      else if code == 40
        MM.user.keyMove 's'
        
    $doc.keyup (e) ->
      e.preventDefault()
      e.stopPropagation()
      code = e.keyCode
      if code == 37
        MM.user.stop 'w'
      else if code == 38
        MM.user.stop 'n'
      else if code == 39
        MM.user.stop 'e'
      else if code == 40
        MM.user.stop 's'
    
    $(window).blur ->
      MM.user.stopAll()