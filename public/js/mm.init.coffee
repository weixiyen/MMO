WEB.namespace 'MM'

$.loop.setInterval 40

# global dictionary
MM.global = {}

MM.addRoute '/', (tokens) ->
  MM.ui 'page.main',
    title: 'RPG Demo'

MM.addRoute '/login', (tokens) ->
  MM.ui 'login',
    title: 'Login'
    fancy: true

MM.route()