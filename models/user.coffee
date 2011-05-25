require.paths.unshift(process.cwd() + '/lib')
db = require 'db'
async = require 'async'
redis = require 'redis'
mongo = require 'mongoose'
Schema = mongo.Schema
ObjectId = Schema.ObjectId

class User
  
  Schema: new Schema
    activated: Boolean
    alerts:
      topics: [ ObjectId ]
    codes:
      activation: String
      beta: String
      password: String
    cookies:
      football: Number
      basketball: Number
      baseball: Number
    created:
      type: Date
      default: Date.now
    display_name: String
    email: String
    password: String
    permissions: Array
    topics: [ ObjectId ]
    
  getNameById: ( params, end ) ->
    console.log 'roflmaobbq'
    console.log 'sunny'
    end 'Sunnykit ' + params.id

  getTopicsFromUsers: ( params, end ) ->
    end ['t1', 't2', 't3']

  getRecentTopics: ( params, end ) ->
    seq = async.seq
    seq.step ->
      db.model('User').getTopicsFromUsers {}, (topics) ->
      seq.topics = topics
      seq.next()
    seq.step ->
      seq.user = 'haha'
      seq.next()
    seq.last ->
      end
        topics: seq.topics
        user: seq.user

db.model 'User', User