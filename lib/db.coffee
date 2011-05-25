mongo = require 'mongoose'
models = {}
exports.model = ( name, obj=null ) ->
  if obj?
    models[ name ] = new obj
    mongo.model name, models[ name ].Schema
  models[ name ]