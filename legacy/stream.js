var sys = require('sys'),
    createServer = require('http').createServer,
    settings = require('./settings').stream,
    parseUrl = require('url').parse,
    auth = require('./middleware/auth/'),
    countTopicAlerts = require('./modules/members/model').countTopicAlerts,
    cache_expires = 100000,                         // expire user cache after 1min 40sec
    response_expires = 50000,                       // expire responses after 50 sec
    clean_queue_timer = 60000,                      // clean response_queue once a minute
    max_cache_size = 50,                            // don't let user cache pass 50 objects
    _ = require('./web/underscore')._,
    fake_users = 40;

/*  variables
--------------------------------------------*/
var response_queue = [],
    user_cache = {},
    expire_cache = {};

createServer(function( req, res ){ try{

    req.get = parseUrl(req.url, true).query;                                    // req.get holds all GET variables
    var callback_name = req.get.callback || 'jsonCallback',                     // assign the callback name to callback_name
        user_id = auth.processCookie('userid',req.get.user_id) || null,         // get the REAL user_id
        cursor = req.get.cursor || null,                                        // assign cursor local variable
        channels = req.get.channels || [],                                      // assign channels local variable (array of channels)
        first_load = parseInt(req.get.first_load) || 0;                         // figure out if it is first_load

    /*  create user cache if it doesn't exist
    --------------------------------------------*/
    if ( user_id && !user_cache[ user_id ] ) {
        user_cache[ user_id ] = [];
    }
    
    /*  reset cache expiry
    --------------------------------------------*/
    if ( expire_cache[ user_id ] ) clearTimeout( expire_cache[ user_id ] );
    expire_cache[ user_id ] = setTimeout( function(){
        delete user_cache[ user_id ];
    }, cache_expires);
    
    /*  return the first load to get rid of loading sign
    --------------------------------------------*/
    if (first_load) {
        var cache_len = user_cache[ user_id ].length,
            cursor = cache_len > 0 ? user_cache[ user_id ][ cache_len - 1 ].cursor : 0,
            response = {
                online_members: _.size( user_cache ) + fake_users,
                cursor: cursor
            };
        countTopicAlerts( user_id, function( inbox_alerts ){
            response.inbox_alerts = inbox_alerts;
            res.writeHead(200, {'Content-Type':'application/x-javascript'});
            res.end( callback_name + '(' + JSON.stringify( response ) + ')' );
        });
        return;
    }

    /*  push to response_queue
    --------------------------------------------*/
    response_queue.push({
        user_id: user_id,
        channels: channels,
        expires: (new Date()).getTime() + response_expires,
        action: function(data){
    
            var my_cache = [].concat( user_cache[ user_id ] ),
                cache_len = my_cache.length,
                keys = _.map( my_cache, function(obj) { return obj.cursor } );
            
            /* see if cursor is defined...
            --------------------------------------------*/
            if ( cursor ) {
                var index = _.indexOf( keys, cursor ),
                    list = index !== -1 ? my_cache.slice( index + 1, cache_len ) : [];
                
                /* reduce the returned items to only relevant items XXX
                --------------------------------------------------*/
                var i = 0;
                _.each(list, function(item) {
                    if ( _.intersect( item.channels, channels ).length === 0 && item.affected === 'all' ) list.splice(i, 1);
                    i += 1;
                });
                data.list = list;
            } else {
                data.list = [ my_cache[ my_cache.length - 1 ] ]; // if there is no cursor passed back return the entire cache
            }
            
            data.cursor = keys[ cache_len - 1 ];
            
            /*  count mongodb user topic alerts
            --------------------------------------------*/
            countTopicAlerts( user_id, function( inbox_alerts ){
                data.inbox_alerts = inbox_alerts;
                res.writeHead(200, {'Content-Type':'application/x-javascript'});
                res.end( callback_name + '(' + JSON.stringify( data ) + ')' );
            });
            
        }
    });
} catch (e) {
    sys.log('Stream server Invalid Request: ' + e.message);
}}).listen( settings.port );

/*  flush responses
--------------------------------------------*/
function flush_responses ( data ) {
    
    var affected = data.affected,
        data_channels = data.channels,
        resque = [].concat( response_queue ),
        response_data = {
            online_members : _.size( user_cache ) + fake_users
        },
        now = (new Date).getTime();
    
    var i = 0;
    _.each(resque, function( obj ){
        var user_id = obj.user_id,
            action = obj.action,
            channels = obj.channels;
        
        /*  We do 2 checks here:
           1) is user still connected?
           2) is the response expired?
           if so, remove response from queue
        --------------------------------------------*/
        if ( !user_cache[ user_id ] || obj.expires < now ) { 
            response_queue.splice(i, 1); // remove response from queue
            return;
        }

        if ( !userAffected(user_id, affected) ) { // user is not affected, continue to next user
            i++;
            return;
        }
        
        /*  all blast but not all subscribers
           e.g. if topic:134345 got updated
           but joe was not on topic page, we don't send
           the response...
           
           however, if affected = specific users
           like inbox mail coming in, even if channels
           are not subscribed to it'll still work...
        --------------------------------------------*/
        if ( _.intersect( channels, data_channels ).length === 0 && affected === 'all' ) { 
            i++;
            return;
        }
        
        action( response_data );
        response_queue.splice(i, 1); // remove response from queue
    });
    
}

/*  send fake data to
    clean the response queue
--------------------------------------------*/
setInterval(function(){
    flush_responses({
        affected: 'all',
        channels: ['flush']
    });
}, clean_queue_timer);

var client = require('./contrib/redis').createClient();
client.subscribeTo("stream", function (channel, unparsed_json) {
    
    var data = JSON.parse( unparsed_json ),
        user_ids = _.keys( user_cache ),
        len = user_ids.length,
        affected = data.affected;
        
    for (var i=0; i<len; i++) {
        var user_id = user_ids[i];
        if ( userAffected( user_id, affected ) ) user_cache[ user_id ].push( data ); // push cache data
        if ( user_cache[ user_id ].length > max_cache_size ) user_cache[ user_id ].shift(); // limit cache to 50 objects
    }
    
    flush_responses( data );
});

function userAffected ( user_id, affected ) {
    return affected === 'all' || _.indexOf(affected, user_id) !== -1;
}

process.on('uncaughtException', function (err) {
  sys.log('Caught exception: ' + err);
});
