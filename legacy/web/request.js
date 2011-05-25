var sys = require('sys'),
    parseUrl = require('url').parse,
    querystring = require('querystring');

var addMetaData = function(req, res, callback) {
    
    var url = parseUrl(req.url, true);
    
    req.pathname = url.pathname;
    req.get = url.query;
    
    switch( req.method ) {
        case 'GET':
            callback(req, res);
            break;
        case 'POST':
            var data = '';
            req.addListener('data', function(chunk) { data += chunk; });
            req.addListener('end', function() {
                req.post = querystring.parse( data );
                callback(req, res);
            });
            break;
    }
};

this.addMetaData = addMetaData;