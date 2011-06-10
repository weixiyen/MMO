MM.add 'sprite', (opts) ->
  
  class Sprite
    constructor: ->
    start: (id, opts, callback) ->
      
      id = 'mm-anim-' + id
      el = opts.el
      queue = opts.queue
      len = queue.length
      skip = opts.skip || 1
      
      MM.global[ id ] = 0
      $.loop.add id, skip, ->
        el.css
          'background-position': queue[ MM.global[ id ] ]
        if MM.global[ id ] == len
          return MM.global[ id ] = 0
        MM.global[ id ] += 1
      
      if callback?
        @callback( opts )
        
    stop: (id) ->
      $.loop.remove 'mm-anim-' + id     
    once: (options, callback) ->
      
      
  MM.extend 'sprite', new Sprite