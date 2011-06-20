MM.add 'page.main', (opts) ->
  MM.require 'page.main', 'css'
  MM.require 'map'
  MM.require 'interface'
  MM.run ->

    MM.render $('#main'), 'page.main'

    MM.use 'map',
      el: $('#map')
      map_id: 1

    MM.use 'interface'
      el: $('#interface')
