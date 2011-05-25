SB.ui 'page.main', (opts) ->
  SB.require 'page.main', 'css'
  SB.run ->
    SB.log 'okay...'
    ###
    SB.render $('#main'), 'page.main'
    SB.ui 'feed',
      el: $('#feed')
    ###