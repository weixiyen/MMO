MM.add 'interface', (opts) ->

  MM.require 'interface/chatbox'
  MM.require 'interface/partybox'
  MM.require 'interface/minimap'

  MM.run ->

    MM.render opts.el, 'interface'
    
    MM.use 'interface/chatbox',
      el: $('#chatbox')

    MM.use 'interface/partybox',
      el: $('#partybox')

    MM.use 'interface/minimap',
      el: $('#minimap')