MM.add 'interface/chatbox', (opts) ->

  class Chatbox
    constructor: (data) ->
      @$el = data.el
      @$bg = @$el.find('.ui-chatbox:first')
      @$log = @$el.find('.ui-chatlog:first')
      @height = MM.settings.partyBox.height
      @width = $(window).width() - MM.settings.partyBox.width * 2 - 12
      @create()
    create: ->
      @$bg.css
        width: @width
        height: @height
      @$log.css
        width: @width
        height: @height

  MM.require 'interface/chatbox', 'css'
  MM.run ->
    MM.render opts.el, 'interface/chatbox'

    chatbox = new Chatbox
      el: opts.el