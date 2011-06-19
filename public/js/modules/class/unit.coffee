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
      
      @elBody = @el.append('<div class="body"></div>').find('.body:first')

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

      direction = ['n','e','w','s'][MM.random 0, 3]
      
      MM.sprite.start @id,
        el: @elBody
        queue: @anim[ direction ]
        skip: 10

    walkTo: ->
      MM.log 'walking'
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
    chase: (id)->
      MM.log 'chase'
    stopChase: ->
      MM.log 'stopchase'

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