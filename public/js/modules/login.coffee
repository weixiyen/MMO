MM.add 'login', (opts) ->
  
  MM.require 'sample', 'css'
  
  MM.run ->    
    MM.render $('#main'), 'login'
    title = prompt 'Give page new title'
    MM.go
      title: title
      path: '/'
      ui: 'feed'
