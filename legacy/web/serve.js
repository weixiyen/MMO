var sys = require('sys'),
    fs = require('fs');

var serveFile = function( res, filename ) {
    fs.readFile(filename, 'binary', function( err, file ){
        if ( err ) show500( res, err );
        res.writeHead(200);
        res.end( file, 'binary' );
    });
};

var show302 = function(res, path) {
    res.writeHead(302,{'Location':path});
    res.end('Redirecting...');
};

var show403 = function(res, err) {
    sys.log(err);
    res.writeHead(403);
    res.end();
};

var show404 = function(res, err) {
    sys.log(err);
    res.writeHead(404);
    res.end();
};

var show500 = function(res, err) {
    sys.log(err);
    res.writeHead(500);
    res.end();
};

this.serveFile = serveFile;
this.show302 = show302;
this.show403 = show403;
this.show404 = show404;
this.show500 = show500;
