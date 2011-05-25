var models, mongo;
mongo = require('mongoose');
models = {};
exports.model = function(name, obj) {
  if (obj == null) {
    obj = null;
  }
  if (obj != null) {
    models[name] = new obj;
    mongo.model(name, models[name].Schema);
  }
  return models[name];
};