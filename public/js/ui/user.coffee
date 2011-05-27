MM.ui 'user', (opts) ->

  class User
    constructor: (data) ->
      @el = data.el
      @height = data.height
      @width = data.width
      @imgpath = data.imgpath
      @id = data.id
      @anim = data.anim
      
      @el.css
        height: @height
        width: @width
        background: 'no-repeat url(' + @imgpath + ')'
        
      @center()
    center: ->
      left = $(window).width() / 2 - @width / 2
      top = $(window).height() / 2 - @height / 2
      @put left, top
    put: (x, y) ->
      @el.css
        left: x
        top: y
    move: (direction) ->
      MM.map.panStart direction
      # start an animation function
    stop: (direction) ->
      MM.map.panStop direction
      # stop an animation function
  
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
          {l:"-72px", t:"-32px"},
          {l:"-96px", t:"-32px"},
          {l:"-120px", t:"-32px"}
        ],
        left: [
            {l:"-72px", t:"-96px"},
            {l:"-96px", t:"-96px"},
            {l:"-120px", t:"-96px"}
        ],
        up: [
            {l:"-72px", t:"0"},
            {l:"-96px", t:"0"},
            {l:"-120px", t:"0"}
        ],
        down: [
            {l:"-72px", t:"-64px"},
            {l:"-96px", t:"-64px"},
            {l:"-120px", t:"-64px"}
        ]
    
    # make public data for others to use  
    MM.user = new User data
    
    # bind some controls for movement
    doc = $(document)
    
    doc.keydown (e) ->
      #e.preventDefault()
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
      #e.preventDefault()
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