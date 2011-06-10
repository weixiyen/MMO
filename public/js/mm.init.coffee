WEB.namespace 'MM'

$.loop.setInterval 20

# global dictionary
MM.global = {}

MM.addRoute '/', (tokens) ->
  MM.use 'page.main',
    title: 'RPG Demo'

MM.addRoute '/login', (tokens) ->
  MM.use 'login',
    title: 'Login'
    fancy: true

MM.route()