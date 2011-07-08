var io, redis, settings, subscriber;
require.paths.unshift(process.cwd() + '/lib');
redis = require('redis');
settings = require('settings').stream;
if (process.argv[2] != null) {
  settings.port = process.argv[2];
}
io = require('socket.io').listen(Number(settings.port));
subscriber = redis.createClient();
io.sockets.on('connection', function(client) {
  subscriber.subscribe('stream');
  return subscriber.on('message', function(channel, raw_data) {
    var msg;
    msg = JSON.parse(raw_data);
    return client.emit(msg.channel, msg.data);
  });
});
process.on('uncaughtException', function(err) {
  return console.log(err.stack);
});