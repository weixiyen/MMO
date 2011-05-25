var Query, queries, queries_err, query, redis, settings, stream, uuid, zmq;
settings = require('./settings').db;
redis = require('redis');
zmq = require('zeromq');
uuid = require('uuid');
stream = redis.createClient();
exports.stream = function(data) {
  return stream.publish('stream', JSON.stringify(data));
};
queries = {};
queries_err = {};
query = zmq.createSocket('req');
query.connect(settings.socket);
query.on('message', function(_msg) {
  var msg;
  msg = JSON.parse(_msg);
  if (msg.data instanceof Error) {
    queries_err[msg.id](msg.data);
  } else {
    queries[msg.id](msg.data);
  }
  delete queries[msg.id];
  return delete queries_err[msg.id];
});
Query = (function() {
  function Query(method, params) {
    this.method = method;
    this.params = params != null ? params : {};
    this.id = uuid.generate();
  }
  Query.prototype.ok = function(callback) {
    query.send(JSON.stringify({
      id: this.id,
      method: this.method,
      params: this.params
    }));
    return queries[this.id] = callback;
  };
  Query.prototype.fail = function(callback) {
    return queries_err[this.id];
  };
  return Query;
})();
exports.query = function(method, params) {
  return new Query(method, params);
};