WEB.namespace 'SB'

SB.addRoute '/', (tokens) ->
  SB.ui 'page.main',
    title: 'SleeperBot Fantasy Sports'

SB.addRoute '/login', (tokens) ->
  SB.ui 'login',
    title: 'Login'
    fancy: true

SB.route()