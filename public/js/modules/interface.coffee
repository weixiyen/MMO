MM.add 'interface', (opts) ->

  MM.require 'interface/chatbox'
  MM.require 'interface/partybox'

  MM.run ->

    MM.render opts.el, 'interface'
    
    MM.use 'interface/chatbox',
      el: $('#chatbox')

    MM.use 'interface/partybox',
      el: $('#partybox')