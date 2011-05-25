SB.ui 'login', (opts) ->
  
  SB.require 'sample', 'css'
  
  SB.run ->    
    SB.render $('#main'), 'login'
    title = prompt 'Give page new title'
    SB.go
      title: title
      path: '/'
      ui: 'feed'
