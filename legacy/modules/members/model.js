var db = require('../../lib/mongo').db,
    OID = require('../../lib/mongo').OID,
    _ = require('../../web/underscore')._;

function getUser(userid, callback) {
     
    /* get user from mongo
    -------------------------------------------------*/
    db.findOne('users', {_id:OID(userid), activated:1}, {}, function(user){
        if (!user) {
            callback( null );
            return;
        }
        var member = {
            id: userid,
            display_name: user.display_name,
            permissions: user.permissions,
            banned: user.banned,
            topics: user.topics,
			cookies: user.cookies,
            created: user.created
        };
        callback( member );
    });

}

function getUserCookies(userid, callback) {
	/* get user from mongo
    -------------------------------------------------*/
    db.findOne('users', {_id:OID(userid), activated:1}, {topics:0}, function(user){
        if (!user) {
            callback( null );
            return;
        }
        var member = {
			cookies: user.cookies
        };
        callback( member );
    });
}

function getUserActivity(userid, callback) {

    getUser(userid, function(user){
        var userid = OID(user.id),
            query = { user_id:userid, deleted:{$exists:false} }; // topics started
        
        if (!user.topics) user.topics = [];
        
        db.count('topics', query, function(started){
            
            query = { $or: [{_id:{$in:user.topics}}, {user_id:userid}], deleted:{$exists:false}}; // topics started or replied to
            
        db.count('topics', query, function(participated) {
            
            //var replied = _.uniq( OID(user.topics) );
            query = {_id:{$in:user.topics}, deleted:{$exists:false}}; // topics replied to
        
        db.count('topics', query, function(replied) {
		
			query = {_id: userid};
		
		db.findOne('users', query, {}, function(member){
			
            user.participated = participated;
            user.started = started;
            user.replied = replied;
			user.cookies = member.cookies;
            
            callback(user);

        }); // END user find
        }); // END replied
        }); // END participated
        }); // END started
    });

}

function getAllTopics(userid, skip, limit, callback) {
    var user_id = OID(userid),
        opts = {sort:[['created', -1]], skip:skip, limit:limit};
    
    getUser(userid, function(user){
        if (!user.topics) user.topics = [];
        var query = { $or: [{_id:{$in:user.topics}}, {user_id:user_id}], deleted:{$exists:false}};
        db.find('topics', query, opts, function( results ){
            callback(results);
        });
    });
}

function getTopicsStarted(userid, skip, limit, callback) {
    var user_id = OID(userid),
        query = { user_id:user_id, deleted:{$exists:false} },
        opts = {sort:[['created', -1]], skip:skip, limit:limit};
        
    db.find('topics', query, opts, function( results ){
        callback(results);
    });
}

function getTopicsRepliedTo(userid, skip, limit, callback) {    
    getUser(userid, function(user){
        if (!user.topics) user.topics = [];
        var query = { _id:{$in:user.topics}, deleted:{$exists:false}},
            opts = {sort:[['created', -1]], skip:skip, limit:limit};
            
        db.find('topics', query, opts, function( results ){
            callback(results);
        });
    });
}

function countTopicAlerts( userid , callback ) {
    db.findOne('users', {_id: OID(userid)}, {'alerts.topics':1}, function(user){
        var len = user && user.alerts && user.alerts.topics ? user.alerts.topics.length : 0;
        if (callback) callback(len);
    });
}

function getTopicAlerts( userid, skip, limit, callback ) {
    db.findOne('users', {_id: OID(userid)}, {'alerts.topics':1}, function(user){
        var topic_arr = user && user.alerts && user.alerts.topics ? user.alerts.topics : [];
        db.find('topics', {_id:{$in:topic_arr}}, {sort:[['created', -1]], skip:skip, limit:limit}, function(topics) {
            if (callback) callback(OID(topics));
        }); 
    });
}

function removeAllTopicAlerts( userid, callback ) {
    db.update('users', {_id: OID(userid)}, {$set:{'alerts.topics':[]}}, function(result){
        if (callback) callback();
    });
}

function addCookies( userid, sport, cookies, callback ) {
	var user_oid = OID(userid);
	switch(sport) {
		case 'football':
			db.update('users', {_id:user_oid}, {$inc: { 'cookies.football' : cookies} });
			break;
		case 'basketball':
			db.update('users', {_id:user_oid}, {$inc: { 'cookies.basketball' : cookies} });
			break;
		case 'baseball':
			db.update('users', {_id:user_oid}, {$inc: { 'cookies.baseball' : cookies} });
			break;
	}
	if (callback) callback();
}

exports.getUser = getUser;
exports.getUserCookies = getUserCookies;
exports.getUserActivity = getUserActivity;
exports.getAllTopics = getAllTopics;
exports.getTopicsStarted = getTopicsStarted;
exports.getTopicsRepliedTo = getTopicsRepliedTo;
exports.countTopicAlerts = countTopicAlerts;
exports.getTopicAlerts = getTopicAlerts;
exports.removeAllTopicAlerts = removeAllTopicAlerts;
exports.addCookies = addCookies;