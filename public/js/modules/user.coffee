MM.add 'user', (opts) ->
  
  class User
    constructor: (data) ->
      @el = data.el
      @height = data.height
      @width = data.width
      @imgpath = data.imgpath
      @id = data.id
      @anim = data.anim
      @sprite = data.sprite
      @stub = 'user-'
      @moving =
        n: false
        e: false
        s: false
        w: false
      @moveQueue = []
      @el.css
        height: @height
        width: @width
        background: 'no-repeat url(' + @imgpath + ')'
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
      MM.user.stopAll()
      
      divisor = MM.map.tileSize
      x1 = Math.floor( MM.map.xcoord / divisor )
      y1 = Math.floor( MM.map.ycoord / divisor )
      x2 = Math.floor( coords[0] / divisor )
      y2 = Math.floor( coords[1] / divisor )
      path = MM.map.getPath [x1,y1], [x2,y2]

      # check for bad path
      if path.length < 2
        return
      
      # get new path segment & move the user
      run = -> 
        if path.length < 2
          $.loop.remove LOOPID
          MM.user.stopAll()
          return
        MM.global[NODE1] = path.shift() 
        MM.global[NODE2] = path[0]
        MM.user.move MM.map.getDirection MM.global[NODE1], MM.global[NODE2]
      
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
        ### 
        @moveQueue.push direction
        ###
      
      xBound = Math.floor( @width/2 )
      yBound = Math.floor( @height/2 )
      
      MM.map.panStart direction, xBound, yBound
      
      # stop all other animations
      for k, dir of MM.map.dir
        @sprite.stop @stub + dir
        
      # start an animation function
      direction = @getSimpleDirection direction
      loopid = @stub + direction
      opts =
        el: @el
        queue: @anim[direction]
        skip: 3

      @sprite.start loopid, opts 
      ###
      stub = 'user_' + direction
      MM.global[ stub ] = 0
      $.loop.add stub, 3, ->
        MM.user.el.css
          'background-position': MM.user.anim[direction][ MM.global[ stub ] ]
        if MM.global[ stub ] == 2
          return MM.global[ stub ] = 0
        MM.global[ stub ] += 1
      ###
      return direction
          
    stop: (direction) ->
      @moving[ direction ] = false
      
      ###
      index = @moveQueue.indexOf direction
      @moveQueue.splice index, 1
      if @moveQueue.length
        @stop @moveQueue[0]
        @move @moveQueue[0]
      ###
      
      MM.map.panStop direction
      @sprite.stop @stub + direction
      if MM.global[ @tag.automove ] == false
        @face direction
    
    stopAll: ->
      for k, v of @moving
        if @moving[ k ] == true
          @stop k
    
    teleport: (xcoord, ycoord) ->
      MM.map.goTo xcoord, ycoord
      
    getSimpleDirection: (direction) ->
      return if direction.length == 2 then direction.substr 0, 1 else direction
    
    face: (direction) ->
      direction = @getSimpleDirection direction
      @el.css
        'background-position': @anim[direction][1]
  
  MM.require 'sprite'
  MM.require 'user', 'css'
  MM.require 'sprites', 'css'
  
  MM.run ->
  
    MM.use 'sprite'
    
    # make public data for others to use  
    MM.user = new User 
      el: opts.el
      height: 64
      width: 40
      imgpath: '/img/sprite_user.png'
      facing: 's'
      sprite: MM.sprite
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