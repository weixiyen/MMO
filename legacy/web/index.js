var sys = require('sys'),
    path = require('path'),
    createServer = require('http').createServer,
    addMetaData = require('./request').addMetaData,
    show500 = require('./serve').show500,
    serveFile = require('./serve').serveFile,
    serveHandler = require('./handler').serveHandler;

var startServer = function( settings ) {
    
    createServer(function( req, res ){
        
        addMetaData(req, res, function(req, res) {
            
            if (settings.env === 'dev') {
                catchStaticFile( req, res );
            } else {
                serveHandler( req, res );
            }

        });
        
        process.on('uncaughtException', function (err) {
            show500(res, 'Caught Exception: ' + err);
        });
        
    }).listen( settings.port );

};

this.start = startServer;

/*  Catch static files.
------------------------------------*/
var catchStaticFile = function(req, res) {
    var pathname = req.pathname,
        filename = path.join(process.cwd(), 'static/' + pathname );

    path.exists(filename, function( exists ) {
        
        if (exists && pathname !== '/') {
            serveFile( res, filename );
        } else {
            serveHandler( req, res );
        }
        
    });
}

process.on('uncaughtException', function (err) {
  sys.log('Caught exception: ' + err);
});