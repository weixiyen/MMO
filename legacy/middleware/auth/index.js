var show302 = require('../../web/serve').show302,
    cookie = require('./cookie'),
    model = require('../../modules/auth/model'),
    OID = require('../../lib/mongo').OID,
    parseDate = require('../../contrib/date').parse,
    redis = require('../../contrib/redis').createClient(),
    session_lifetime = require('../../settings').session.lifetime,
    _ = require('../../web/underscore')._;  

cookie.secret = 'SDkjLdKLODiuekNUEysydDWVCXzdfieE';

var processCookie = function(key, value){
    return cookie.processCookie(key, value);
};

var showSignIn = function(req, res) {
    show302( res, '/signin' );
};

var signIn = function(opts) {

    var req = opts.req,
        res = opts.res,
        email = req.post.email,
        password = req.post.password,
        success = opts.success,
        fail = opts.fail;
        
    model.authUser(email, password, function(user){
        
        if (user === null) {
            fail(req, res, 'Your email and password do not match our records.');
            return;
        }
        
        if (!user.activated) {
            fail(req, res, 'You have not activated your account.');
            return;
        }
        
        var userid = OID(user._id),
            expires = parseDate('next year'),
            redis_user_key = 'users:'+userid,
            redis_user_val = JSON.stringify({
                id: userid,
                display_name: user.display_name,
                permissions: user.permissions,
                banned: user.banned
            });
            
        res.setSecureCookie('userid', userid, {expires: expires});
        
        /*  set display_name and permissions in Redis
        -------------------------------------------------*/
        redis.setex(redis_user_key, session_lifetime, redis_user_val, function(err, value){
            req.user = JSON.parse( redis_user_val );
            success(req, res);
        }); 
        
    });
    
};

var signOut = function(req, res, callback) {
    var redis_user_key = 'users:'+req.user.id;
    redis.del(redis_user_key, function(err, result){
        callback();
    });
};

var isSignedIn = function(req, res, callback) {
    var is_signed_in = false,
        userid = req.getSecureCookie('userid');
    
    if (userid) is_signed_in = true;
    
    callback( is_signed_in );
}

var execute = function(req, res, handler, callback) {
    
    if (handler.auth) {
        var userid = req.getSecureCookie('userid');
        if ( !userid ) {
            showSignIn(req, res);
            return;
        }
        model.getUser(userid, function(user){
                        
            if (user === null || user.banned === 1 || _.indexOf(user.permissions, handler.auth) === -1) {
                showSignIn(req, res);
                return;
            }
            
            if ( _.indexOf(user.permissions, 'moderator') !== -1 ) user.is_moderator = true;
            if ( _.indexOf(user.permissions, 'admin') !== -1 ) user.is_admin = true;
            
            req.user = user;
            callback(req, res); 
        });
        return;
    }
    callback(req, res);
    
};

this.execute = execute;
this.signIn = signIn;
this.signOut= signOut;
this.isSignedIn = isSignedIn;
this.processCookie = processCookie;