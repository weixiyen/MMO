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
        right: false
        left: false
        down: false
        up: false
        
      @el.css
        height: @height
        width: @width
        background: 'no-repeat url(' + @imgpath + ')'
        
      @center()
    center: ->
      left = $(window).width() / 2 - @width / 2
      top = 250 - @height / 2
      @put left, top
    put: (x, y) ->
      @el.css
        left: x
        top: y
    move: (direction) ->
      # check to see if button is already pressed
      if @pressed[ direction ] == true
        return
      @pressed[ direction ] = true
      
      MM.map.panStart direction
      
      # start an animation function
      stub = 'user_' + direction
      MM.counter[ stub ] = 0
      $.loop.add stub, ->
        
        if 0 != $.loop.count % 4
          return
          
        MM.user.el.css
          'background-position': MM.user.anim[direction][ MM.counter[ stub ] ]
        if MM.counter[ stub ] == 2
          MM.counter[ stub ] = 0
        else
          MM.counter[ stub ] += 1
          
    stop: (direction) ->
      @pressed[ direction ] = false
      MM.map.panStop direction
      $.loop.remove 'user_' + direction
  
  MM.require 'user', 'css'
  MM.require 'sprites', 'css'
  
  MM.run ->
    
    # pull from DB in production
    data = 
      el: opts.el
      height: 32
      width: 24
      imgpath: '/img/sprites.png'
      anim:
        right: [
          "-72px -32px",
          "-96px -32px",
          "-120px -32px"
        ],
        left: [
          "-72px -96px",
          "-96px -96px",
          "-120px -96px"
        ],
        up: [
          "-72px 0",
          "-96px 0",
          "-120px 0"
        ],
        down: [
          "-72px -64px",
          "-96px -64px",
          "-120px -64px"
        ]
    
    # make public data for others to use  
    MM.user = new User data
    
    # bind some controls for movement
    doc = $(document)
    
    doc.keydown (e) ->
      e.preventDefault()
      e.stopPropagation()
      code = e.keyCode
      if code == 37
        MM.user.move 'left'
      else if code == 38
        MM.user.move 'up'
      else if code == 39
        MM.user.move 'right'
      else if code == 40
        MM.user.move 'down'
        
    doc.keyup (e) ->
      e.preventDefault()
      e.stopPropagation()
      code = e.keyCode
      if code == 37
        MM.user.stop 'left'
      else if code == 38
        MM.user.stop 'up'
      else if code == 39
        MM.user.stop 'right'
      else if code == 40
        MM.user.stop 'down'
    
    $(window).blur ->
      MM.user.stop 'left'
      MM.user.stop 'up'
      MM.user.stop 'right'
      MM.user.stop 'down'