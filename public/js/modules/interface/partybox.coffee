MM.add 'interface/partybox', (opts) ->

  class Partybox
    constructor: (data) ->
      @$el = data.el
      @$bg = @$el.find('.ui-partybox:first')
      @height = MM.settings.partyBox.height
      @width = MM.settings.partyBox.width
      @create()
    create: ->
      @$bg.css
        width: @width
        height: @height

  MM.require 'interface/partybox', 'css'
  MM.run ->
    MM.render opts.el, 'interface/partybox'

    partybox = new Partybox
      el: opts.el
