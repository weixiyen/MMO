var ENV, channels, flushChannel, http, io, log, redis, server, settings, socket, subscriber, util;
require.paths.unshift(process.cwd() + '/lib');
http = require('http');
io = require('socket.io');
util = require('util');
redis = require('redis');
ENV = process.env.ENV;
settings = require('settings').stream;
if (process.argv[2] != null) {
  settings.port = process.argv[2];
}
server = http.createServer(function(req, res) {
  return res.end(null);
});
server.listen(settings.port);
channels = {};
socket = io.listen(server);
socket.on('connection', function(client) {
  var sid;
  sid = client.sessionId;
  client.on('message', function(data) {
    var channel;
    if (data.channel != null) {
      channel = data.channel;
      if (!(channels[channel] != null)) {
        channels[channel] = {};
      }
      return channels[channel][sid] = client;
    }
  });
  return client.on('disconnect', function() {
    var channel, tag, _results;
    _results = [];
    for (tag in channels) {
      channel = channels[tag];
      _results.push(delete channel[sid]);
    }
    return _results;
  });
});
flushChannel = function(msg) {
  var channel, client, sid, _results;
  try {
    channel = channels[msg.channel];
    _results = [];
    for (sid in channel) {
      client = channel[sid];
      _results.push(client.send(msg));
    }
    return _results;
  } catch (_e) {}
};
subscriber = redis.createClient();
subscriber.subscribe('stream');
subscriber.on('message', function(channel, raw_data) {
  var msg;
  msg = JSON.parse(raw_data);
  return flushChannel(msg);
});
log = function(thing) {
  return util.log(util.inspect(thing, true, 3));
};