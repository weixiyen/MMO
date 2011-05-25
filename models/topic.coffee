require.paths.unshift(process.cwd() + '/lib')
db = require 'db'
async = require 'async'
redis = require 'redis'
mongo = require 'mongoose'
Schema = mongo.Schema
ObjectId = Schema.ObjectId

class Topic
  
  Schema: new Schema
    channel: String
    comment: String
    commenters: [ ObjectId ]
    comments: Array
    cookies:
      upvoted: [ ObjectId ]
      received: Number
    created: 
      type: Date
      default: Date.now
    news:
      active: Boolean
      created: Date
    sport: String
    user_id: ObjectId
    user_name: String
    
  getTopicsByUser: ( params, end ) ->
    end ['t11', 't12', 't13']
		
  getMostRecentTopics: ( params, end ) ->
    end ['t99', 't123', 't333']
  
  getTopics: (params, end) ->
    topic = mongo.model 'Topic'
    topic.find( {sport:params.sport} ).sort('created', 'descending').skip( params.skip ).limit( params.limit ).find (err, docs)->
      end docs

db.model 'Topic', Topic