MM.ui 'user', (opts) ->

  class User
    constructor: (data) ->
      @el = data.el
      @height = data.height
      @width = data.width
      @imgpath = data.imgpath
      @id = data.id
      @anim = data.anim
      @pressed =
        n: false
        e: false
        s: false
        w: false
      @el.css
        height: @height
        width: @width
        background: 'no-repeat url(' + @imgpath + ')'
        
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
    
    move: (direction) ->
      # check to see if button is already pressed
      if @pressed[ direction ] == true
        return
      @pressed[ direction ] = true
      
      xBound = Math.floor( @width/2 )
      yBound = Math.floor( @height/2 )
      
      MM.map.panStart direction, xBound, yBound
      
      # start an animation function
      direction = @getSimpleDirection direction
      stub = 'user_' + direction
      MM.global[ stub ] = 0
      $.loop.add stub, 2, ->
          
        MM.user.el.css
          'background-position': MM.user.anim[direction][ MM.global[ stub ] ]
        if MM.global[ stub ] == 2
          MM.global[ stub ] = 0
        else
          MM.global[ stub ] += 1
      return direction
          
    stop: (direction) ->
      @pressed[ direction ] = false
      MM.map.panStop direction
      $.loop.remove 'user_' + direction
      @face direction
    
    teleport: (xcoord, ycoord) ->
      MM.map.goTo xcoord, ycoord
      
    getSimpleDirection: (direction) ->
      return if direction.length == 2 then direction.substr 0, 1 else direction
    
    face: (direction) ->
      direction = @getSimpleDirection direction
      @el.css
        'background-position': @anim[direction][1]
  
  MM.require 'user', 'css'
  MM.require 'sprites', 'css'
  
  MM.run ->
    
    # make public data for others to use  
    MM.user = new User 
      el: opts.el
      height: 32
      width: 24
      imgpath: '/img/sprites.png'
      facing: 'e'
      anim:
        e: [
          "-72px -32px",
          "-96px -32px",
          "-120px -32px"
        ],
        w: [
          "-72px -96px",
          "-96px -96px",
          "-120px -96px"
        ],
        n: [
          "-72px 0",
          "-96px 0",
          "-120px 0"
        ],
        s: [
          "-72px -64px",
          "-96px -64px",
          "-120px -64px"
        ]
    
    # bind some controls for movement
    $doc = $(document)
    
    $doc.keydown (e) ->
      e.preventDefault()
      e.stopPropagation()
      code = e.keyCode
      if code == 37
        MM.user.move 'w'
      else if code == 38
        MM.user.move 'n'
      else if code == 39
        MM.user.move 'e'
      else if code == 40
        MM.user.move 's'
        
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
      MM.user.stop 'w'
      MM.user.stop 'n'
      MM.user.stop 'e'
      MM.user.stop 's'