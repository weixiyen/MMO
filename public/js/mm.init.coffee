WEB.namespace 'MM'

MM.addRoute '/', (tokens) ->
  MM.ui 'page.main',
    title: 'RPG Demo'

MM.addRoute '/login', (tokens) ->
  MM.ui 'login',
    title: 'Login'
    fancy: true

MM.route()