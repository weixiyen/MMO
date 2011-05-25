/*
DB.js opens a zmq socket which allows
other services to use the data access layer.
*/var app, db, mongo, rep, settings, zmq;
require.paths.unshift(process.cwd() + '/lib');
db = require('db');
zmq = require('zeromq');
app = require('web');
settings = require('settings').db;
mongo = require('mongoose');
mongo.connect(settings.mongo);
app.requireDir(settings.dir.models);
rep = zmq.createSocket('rep');
rep.bind(settings.socket, function(err) {
  return rep.on('message', function(_msg) {
    var callback, method, mm, model, msg, query;
    msg = JSON.parse(_msg);
    mm = msg.method.split(':');
    model = mm[0];
    method = mm[1];
    callback = function(data) {
      msg.data = data;
      return rep.send(JSON.stringify(msg));
    };
    query = db.model(model);
    query[method](msg.params, callback);
    delete msg.method;
    return delete msg.params;
  });
});