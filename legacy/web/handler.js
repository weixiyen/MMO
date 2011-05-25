var sys = require('sys'),
    fs = require('fs'),
    path = require('path'),
    serve = require('./serve'),
    settings = require('../settings').web,
    auth = require('../middleware/auth');

var Handler = {
    
    handlers: {},
    
    /*  load modules which include code to run
        Handlers.add() to populate the handlers
        object.
    -------------------------------------------------*/
    loadAll: function() {
        
        var modules_path = path.join(process.cwd(), 'modules'),
            modules = fs.readdirSync(modules_path),
            modules_len = modules.length,
            handler = undefined;
            
        for (var i=0; i < modules_len; i+=1) {
            try {
                require('../modules/'+modules[i]+'/handlers');
            } catch (e) {
                sys.log(e);
            }
        }
        
    },
    
    /*  add a K:V pair to the Handler.handlers obj
    -------------------------------------------------*/
    add: function( handler ) {
        var url = handler.url,
            url = url.split(':'),
            len = url.length;
        
        handler.params = [];
        if (len > 1) {
            for (var i=1; i < len; i+=1) {
                var param = url[i].replace('/','');
                handler.params.push( param );
            }
            url[0] = url[0].substr(0, url[0].length - 1);
        }

        Handler.handlers[ url[0] ] = handler;
    },
    
    /*  serve the request + response.
    -------------------------------------------------*/
    serve: function( req, res ) {
                
        var handlers = Handler.handlers,
            pathname = removeTrailingSlash(req.pathname),
            params = [],
            handler_obj = _processRoute(pathname, handlers, params),
            handler = handler_obj.handler; // calls recursive loop for URL params pattern matching
        
        if (!handler_obj) {
            serve.show404(res, 'No Matching Handler for ' + req.pathname + '.');
            return;
        }
                
        req = _processParams( req, handler, handler_obj.params );
        
        auth.execute( req, res, handler, function(req, res){
            var content_type = handler.dataType || 'text/html';
            content_type = content_type === 'json' ? 'application/json' : content_type;
            res.writeHead('200',{'Content-Type':content_type});
            
            /*  rest API support for
               - create
               - update
               - remove (delete)
               GET simply uses handler.action 
                as it normally is
            -------------------------------------------------*/
            var respond = handler.action;
            
            if (req.method === 'POST' && req.post.action) {
                
                switch( req.post.action ){
                    case 'create': respond = handler.create; break;
                    case 'update': respond = handler.update; break;
                    case 'remove': respond = handler.remove; break;
                }
            }
            
            if (settings.env === 'dev') {
                respond(req, res);
            } else {
                try {
                    respond(req, res);
                } catch (e) {
                    serve.show500(res, 'Server error at ' + handler.url + ': ' + e.message);
                }
            }
            
        });
        
    }
}

this.serveHandler = Handler.serve;
this.addHandler = Handler.add;

Handler.loadAll();



/*  Recursively process params based on pathname
    returns an object of {handler, params}
-------------------------------------------------*/
function _processRoute(pathname, handlers, params) {

    if (!handlers[ pathname ] && pathname != undefined) {
        
        var pathname_arr = pathname.split('/');
        if (pathname_arr.length > 10) return false;
        params.push( pathname_arr.pop() );
        
        if (pathname.length > 1) {
            pathname = pathname_arr.join('/');
            return _processRoute(pathname, handlers, params);
        }
    }
    
    if (handlers[ pathname ] && params.length === handlers[ pathname ].params.length) {
            return {handler: handlers[ pathname ],
                    params: params};
    }
    return false;
    
}


/*  Tacks on params to the handler object
    for use by handler.
-------------------------------------------------*/
function _processParams(req, handler, params) {
    var handler_params = handler.params,
        len = handler_params.length;
    
    req.params = {};
    
    if (len > 0) {
        params.reverse();
        for (var i=0; i < len; i+=1) {
            req.params[ handler_params[i] ] = params[i];
        }
    }
    
    return req;
}



/*  removes trailing slash for pathname
-------------------------------------------------*/
function removeTrailingSlash( url ) {
    var pathname = url,
        len = url.length,
        last_char = url.charAt( len - 1 ),
        has_trailing_slash = last_char === '/' ? true : false;
    if (has_trailing_slash && len > 1) pathname = url.substr( 0, len - 1 );
    return pathname;
}