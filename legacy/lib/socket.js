var client = require('../contrib/redis').createClient(),
    uuid = require('../contrib/uuid').uuid;

function send(msg) {
    msg.cursor = uuid();
    msg = JSON.stringify(msg);
    client.publish('stream', msg, function(){});
}

exports.send = send;