var ObjectId, Schema, User, async, db, mongo, redis;
require.paths.unshift(process.cwd() + '/lib');
db = require('db');
async = require('async');
redis = require('redis');
mongo = require('mongoose');
Schema = mongo.Schema;
ObjectId = Schema.ObjectId;
User = (function() {
  function User() {}
  User.prototype.Schema = new Schema({
    activated: Boolean,
    alerts: {
      topics: [ObjectId]
    },
    codes: {
      activation: String,
      beta: String,
      password: String
    },
    cookies: {
      football: Number,
      basketball: Number,
      baseball: Number
    },
    created: {
      type: Date,
      "default": Date.now
    },
    display_name: String,
    email: String,
    password: String,
    permissions: Array,
    topics: [ObjectId]
  });
  User.prototype.getNameById = function(params, end) {
    console.log('roflmaobbq');
    console.log('sunny');
    return end('Sunnykit ' + params.id);
  };
  User.prototype.getTopicsFromUsers = function(params, end) {
    return end(['t1', 't2', 't3']);
  };
  User.prototype.getRecentTopics = function(params, end) {
    var seq;
    seq = async.seq;
    seq.step(function() {
      db.model('User').getTopicsFromUsers({}, function(topics) {});
      seq.topics = topics;
      return seq.next();
    });
    seq.step(function() {
      seq.user = 'haha';
      return seq.next();
    });
    return seq.last(function() {
      return end({
        topics: seq.topics,
        user: seq.user
      });
    });
  };
  return User;
})();
db.model('User', User);