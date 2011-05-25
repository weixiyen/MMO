var mailer = require('mailer'),
    settings = require('../settings');
    
var send = function(opts) {
    opts.host = settings.email.host;
    opts.port = settings.email.port;
    opts.domain = settings.email.domain;
    mailer.send( opts );
};

this.send = send;