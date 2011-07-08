MM.add 'interface/minimap', (opts) ->

  class Minimap
    constructor: (data) ->
      @$el = data.el
      @$bg = @$el.find('.ui-minimap:first')
      @height = MM.settings.partyBox.height
      @width = MM.settings.partyBox.width
      @create()
    create: ->
      @$bg.css
        width: @width
        height: @height

  MM.require 'interface/minimap', 'css'
  MM.run ->
    MM.render opts.el, 'interface/minimap'

    minimap = new Minimap
      el: opts.el
