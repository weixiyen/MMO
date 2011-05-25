var db = require('../../lib/mongo').db,
    OID = require('../../lib/mongo').OID,
    hex_md5 = require('../../contrib/md5').hex_md5,
    redis = require('../../contrib/redis').createClient(),
    session_lifetime = require('../../settings').session.lifetime;

this.saveBetaApp = function(data, callback) {
    db.insert('beta_applications', data, function(err, docs){
        var app = docs[0];
        app._id = OID(app._id);
        if (callback) callback(app);
    });
};

this.createUser = function(data, callback) {
    db.insert('users', data, function(err, docs){
        var user = docs[0];
        user._id = OID(user._id);
        if (callback) callback(user);
    });
};

this.emailExists = function(email, callback) {
    db.findOne('users', {email:email, activated:1}, {}, function(result){
        if (result) {
            callback( true );
        } else {
            callback( false );
        }
    });
};

this.generatePasswordResetCode = function(email, code, callback) {
    db.update('users', {email:email, activated:1}, {$set:{'codes.password':code}}, function(result){
        callback();
    });
}

this.validPasswordResetCode = function(code, callback) {
    db.findOne('users', {'codes.password':code}, {}, function(user){
        if (user) {
            delete user.topics
            callback(OID(user));
        } else {
            callback( null );
        }
    });
}

this.updatePassword = function( userid, password, callback ) {
    db.update('users', {_id:OID(userid)}, {$set:{password:hex_md5(password), 'codes.password':null}}, function(result){
        callback();
    });
}

this.activateUser = function(code, callback) {
    db.findOne('users', {'codes.activation':code}, {}, function(user){
        if (user) {
            user.activated = 1;
            db.save('users', user, {}, function(user) {
                callback( user );
            });    
        } else {
            callback( null );
        }
    });
};

this.authUser = function(email, password, callback) {
    db.findOne('users', {email:email, password: hex_md5(password)}, {}, function(user){
        if (user) {
            callback( user );
        } else {
            callback( null );
        }
    });
};

this.getUser = function(userid, callback) {
    redis.get('users:' + userid, function(err, user) {
        
        /* get user from redis
        -------------------------------------------------*/
        if (user) {
            callback(JSON.parse(user));
            return;
        }
        
        /* get user from mongo
        -------------------------------------------------*/
        db.findOne('users', {_id:OID(userid), activated:1}, {}, function(user){
            if (!user) {
                callback( null );
                return;
            }
            var req_user = {
                id: userid,
                display_name: user.display_name,
                permissions: user.permissions,
                banned: user.banned
            };
            redis.setex('users:'+userid, session_lifetime, JSON.stringify(req_user), function(err, value){
                callback(req_user); 
            });
        });
        
    });
};

this.getTopics = function(skip, limit, callback) {
    db.find('topics', {$or:[ {deleted:{$exists:false}}, {deleted:0} ] },
                      {sort:[['created', -1]], skip:skip, limit:limit}, function( results ){
        if (!results) {
            callback( null );
            return;
        }
        var topics = OID( results );
        callback( topics );
    });
};

this.getNews = function(skip, limit, callback) {
    db.find('topics', {'news.active':1, $or:[ {deleted:{$exists:false}}, {deleted:0} ] },
                      {sort:[['news.created', -1]], skip:skip, limit:limit}, function( results ){
        if (!results) {
            callback( null );
            return;
        }
        var topics = OID( results );
        callback( topics );
    });
};