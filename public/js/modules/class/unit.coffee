MM.add 'class/unit', (opts) ->

  class Unit
    constructor: (data) ->

      # ATTRIBUTES
      @id = data.id
      @height = data.height
      @width = data.width
      @imgpath = data.imgpath
      @anim = data.anim
      @pos = data.pos
      @el = data.el
      @speed = data.speed
      @name = data.name
      @skip = data.skip
      @moving = false
      @tag =
        pathloop: 'unit:'+@id+':path:loop'
        node1: 'unit:'+@id+':path:node:1'
        node2: 'unit:'+@id+':path:node:2'
        move: 'unit:'+@id+':move'
        anim: 'unit:'+@id+':anim'
        chase: 'unit:'+@id+':chase'
        
      @elBody = @el.append('<div class="body"><div class="name"><span>'+@name+'</span></div></div>').find('.body:first')
      @elName = @el.find('.name:first')

      # METHODS
      @create()

    create: ->
      @el.css
        left: @pos[0]
        top: @pos[1]
        zIndex: @pos[1]
        height: 0
        width: 0

      @elBody.css
        height: @height
        width: @width
        background: 'no-repeat url(' + @imgpath + ')'
        left: @width / 2 * -1
        top: @height / 2 * -1

      @elName.css
        left: @width / 2 - 50
        top: -10

    stop: ->
      $.loop.remove @tag.move
      MM.sprite.stop @tag.anim

    move: (direction) ->
      $.loop.add @tag.move, =>
        @walk direction
      MM.sprite.start @tag.anim,
        el: @elBody
        queue: @anim[ direction ]
        skip: @skip
 
    walk: (direction) ->
      if direction == 'w'
        @pos[0] -= @speed
      else if direction == 'e'
        @pos[0] += @speed
      else if direction == 'n'
        @pos[1] -= @speed
      else if direction == 's'
        @pos[1] += @speed
      @el.css
        left: @pos[0]
        top: @pos[1]
        zIndex: @pos[1]

    walkTo: (coords) ->
    
      LOOPID = @tag.pathloop
      NODE1 = @tag.node1
      NODE2 = @tag.node2

      $.loop.remove LOOPID
      @stop()

      divisor = MM.map.tileSize
      x1 = Math.floor( @pos[0] / divisor )
      y1 = Math.floor( @pos[1] / divisor )
      x2 = Math.floor( coords[0] / divisor )
      y2 = Math.floor( coords[1] / divisor )
      path = MM.map.getPath [x1,y1], [x2,y2]

      # check for bad path
      if path.length < 2
        return

      # get new path segment & move the user
      walk = =>
        if path.length < 2
          $.loop.remove LOOPID
          @stop()
          return
        MM.global[NODE1] = path.shift()
        MM.global[NODE2] = path[0]
        @move MM.map.getDirection MM.global[NODE1], MM.global[NODE2]

      walk()
      
      $.loop.add LOOPID, =>
        # detect if current path segment is completed
        # if so, then stop the user, then run new direction
        if MM.map.completedPath MM.global[NODE1], MM.global[NODE2], [@pos[0], @pos[1]]
          @stop()
          walk()

    doAbility: ->
      MM.log 'do ability'
      
    teleport: ->
      MM.log 'teleport'

    show: ->
      MM.log 'show'

    remove: ->
      MM.log 'remove'

    target: (id)->
      MM.log 'target'

    chase: ( obj ) ->
      
      if !( obj instanceof Unit )
        obj = MM.map

      $.loop.add @tag.chase, 35, =>
        @walkTo obj.pos

    stopChase: ->
      $.loop.stop @tag.chase
      @stop()

  class PC extends Unit
    eat: ->
      MM.log 'fooofofo'

  class NPC extends Unit
    eat: ->
      MM.log 'eat'

  if opts.type == 'pc'
    return PC

  if opts.type == 'npc'
    return NPC

  return Unit