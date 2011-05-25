var ObjectId, Schema, Topic, async, db, mongo, redis;
require.paths.unshift(process.cwd() + '/lib');
db = require('db');
async = require('async');
redis = require('redis');
mongo = require('mongoose');
Schema = mongo.Schema;
ObjectId = Schema.ObjectId;
Topic = (function() {
  function Topic() {}
  Topic.prototype.Schema = new Schema({
    channel: String,
    comment: String,
    commenters: [ObjectId],
    comments: Array,
    cookies: {
      upvoted: [ObjectId],
      received: Number
    },
    created: {
      type: Date,
      "default": Date.now
    },
    news: {
      active: Boolean,
      created: Date
    },
    sport: String,
    user_id: ObjectId,
    user_name: String
  });
  Topic.prototype.getTopicsByUser = function(params, end) {
    return end(['t11', 't12', 't13']);
  };
  Topic.prototype.getMostRecentTopics = function(params, end) {
    return end(['t99', 't123', 't333']);
  };
  Topic.prototype.getTopics = function(params, end) {
    var topic;
    topic = mongo.model('Topic');
    return topic.find({
      sport: params.sport
    }).sort('created', 'descending').skip(params.skip).limit(params.limit).find(function(err, docs) {
      return end(docs);
    });
  };
  return Topic;
})();
db.model('Topic', Topic);