MM.ui 'page.main', (opts) ->
  MM.require 'page.main', 'css'
  MM.run ->
    MM.render $('#main'), 'page.main'
    MM.ui 'map',
      el: $('#map')
      map_id: 1
    MM.ui 'user'
      el: $('#user')