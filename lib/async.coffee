###
Async.js is a collection of simple async patterns
built to combat callback hell
###

###
ASYNC SEQUENCE
Allows a user to define a sequence of async functions.
EXAMPLE:
  async = require 'async'
  seq = async.seq
  seq.next ->
    seq.val1 = 'a'
    seq.next()
  seq.next ->
    seq.val2 = 'b'
    seq.next()
  seq.last ->
    console.log( seq.val1 + seq.valb + ' should be ab' )
###
class Sequence
  constructor: ->
    @fn_queue = []
  step: (fn) ->
    @fn_queue.push fn
  next: ->
    if @fn_queue.length > 0
      @fn_queue.shift()()
  last: (fn) ->
    @step fn
    @next()
exports.seq = new Sequence

###
ASYNC LOOP
takes a function queue, data object, and final callback
loops through function queue using .next()
to move on to the next function in sequential order
uses 1 isntance of AsyncLoop
OPTIONAL - data, default is {}
###
class Loop
  constructor: (@fn_queue, @data, @last={}) ->
    if typeof @data == 'function'
      [@last, @data] = [@data, @last]
    for k, v of @data 
      @[k] = v if @[k] != 'next'
    @next()
  next: ->
    if @fn_queue.length == 0
      @end()
      return
    @fn_queue.shift() @
  end: ->
    @last @
exports.loop = (fn_queue, data, last) ->
  new Loop fn_queue.slice(), data, last