var db = require('../../lib/mongo').db,
    OID = require('../../lib/mongo').OID,
    _ = require('../../web/underscore')._,
	Member = require('../members/model');
    
this.createTopic = function(topic, callback) {
    var user_id = topic.user_id;
    topic.user_id = OID( user_id );
    
    db.insert('topics', topic, function(err, docs){
        var topic = docs[0];
        topic._id = OID(topic._id);
        topic.user_id = user_id;
        callback(topic);
    });
};

function updateTopic (topic_id, options, callback) {
    db.update('topics', {_id:OID(topic_id)}, {$set:options}, function(result){
        db.findOne('topics', {_id:OID(topic_id) }, {}, function( topic ){
            if (!topic) {
                callback( null );
                return;
            }
            callback( OID(topic) );
        });
    });
};

this.getFeed = function(user_id, sport, channel, skip, limit, callback) {
    db.find('topics', {sport:sport, channel:channel, $or:[ {deleted:{$exists:false}}, {deleted:0} ] },
                      {sort:[['created', -1]], skip:skip, limit:limit}, function( results ){
        if (!results) {
            callback( null );
            return;
        }
        var topics = OID( results );
		
        callback( topics );
    });
};

this.reply = function(topic_id, comment, callback) {
    var user_id = comment.user_id,
        user_oid = OID(user_id);
    comment.user_id = user_oid;
    comment._id = OID(); // generate unique comment id
    db.update('topics', {_id:OID(topic_id)}, {$push:{comments:comment, commenters:user_oid}}, function(result){
        comment.user_id = user_id;
        
        db.findOne('topics', {_id:OID(topic_id)}, {}, function(topic){
        
        db.update('users', {_id:user_oid}, {$push:{topics: topic._id}, $pull:{'alerts.topics': topic._id}}, function(result){
            comment.sport = topic.sport;
            comment.channel = topic.channel;
            comment.topic_id = topic_id;
            
            /*  update users alert queue
                mongodb & redis
            ---------------------------------*/
            db.update('users', {_id:{$in:topic.commenters, $ne:user_oid }}, {$addToSet:{'alerts.topics': topic._id}}, function(){
                callback(comment);
            });
            
        }); // END update user
        }); // END topics

    });
};

this.removeTopicAlert = function(user_id, topic_id, callback) {
   db.update('users', {_id: OID(user_id)}, {$pull:{'alerts.topics': OID(topic_id)}}, function(result) {
        if (callback) callback();
   });
};

this.getTopic = function(topic_id, callback) {
    db.findOne('topics', {_id:OID(topic_id)}, {}, function( topic ){
        if (!topic) {
            callback( null );
            return;
        }
        callback( OID(topic) );
    });
};

this.getNews = function(sport, skip, limit, callback) {
    db.find('topics', {sport:sport, 'news.active':1, $or:[ {deleted:{$exists:false}}, {deleted:0} ] },
                      {sort:[['news.created', -1]], skip:skip, limit:limit}, function( results ){
        if (!results) {
            callback( null );
            return;
        }
        var topics = OID( results );
        callback( topics );
    });
};

this.pushNews = function(topic_id, callback) {
    db.update('topics', {_id:OID(topic_id)}, {$set:{'news.active':1, 'news.created': new Date()}}, function(result){
        db.findOne('topics', {_id:OID(topic_id)}, {}, function(topic){
            if (!topic) {
                callback( null );
                return;
            }
            callback( OID(topic) );
        });
    });
};

this.pullNews = function(topic_id, callback) {
    db.update('topics', {_id:OID(topic_id)}, {$set:{'news.active':0}}, function(result){
        db.findOne('topics', {_id:OID(topic_id)}, {}, function(topic){
            if (!topic) {
                callback( null );
                return;
            }
            callback( OID(topic) );
        });
    });
};

this.addCookie = function(topic_id, user_id, callback) {
	var topic_oid = OID( topic_id ),
		user_oid = OID( user_id );
	
	/* see if this topic was upvoted by this user already
	-------------------------------------------------------*/
	db.count('topics', {_id:topic_oid, $in:{'cookies.upvoted': user_oid} }, function( already_upvoted ){
		
		if (already_upvoted > 0) {
			topic.cookies.upvotes = topic.cookies.upvoted.length;
			callback( OID(topic) );
			return;
		}
	
	/* add user to upvoted list
	-------------------------------------------------------*/
	db.update('topics', {_id:topic_oid}, {$addToSet:{'cookies.upvoted': user_oid} }, function(result){	
		
	/* grab topic data & update user's points
	-------------------------------------------------------*/	
	db.findOne('topics', {_id:topic_oid}, {}, function(topic){
		
	Member.addCookies( OID(topic.user_id), topic.sport, 1, function(){
		callback( OID(topic) );
	});
		
    }); // END get topic
	}); // END update topic with cookies
	}); // END detect topic
};

this.receiveCookie = function(topic_id, author_id, user_id, callback) {
	var topic_oid = OID( topic_id ),
		user_oid = OID( user_id );
	
	db.findOne('topics', {_id:topic_oid}, {}, function(topic) {
		
		/* make sure author is in fact the topic starter
		-------------------------------------------------------*/
		if( OID(topic.user_id) !== author_id ) {
			callback( null );
			return;
		}
		
		/* make sure nobody has set the received cookie yet
		-------------------------------------------------------*/
		if ( topic.cookies.received !== null ) {
			callback( null );
			return;
		}
		
		// find user_name
		db.findOne('users', {_id:user_oid}, {topics:0}, function(user) {
			
			var amount = _.uniq( OID(topic.commenters) ).length - 1;			
			var options = {
				'cookies.received': {
					user_id: user_id,
					user_name: user.display_name,
					amount: amount,
					timestamp: new Date()
				}
			};
			Member.addCookies( user_id, topic.sport, amount, function(){
				updateTopic( topic_id, options, callback );
			});
		
		});
	});
};

this.getMyCookies = function(user_id, sport, skip, limit, callback) {
    db.find('topics', {sport:sport, 'cookies.received.user_id':user_id, $or:[ {deleted:{$exists:false}}, {deleted:0} ] },
                      {sort:[['created', -1]], skip:skip, limit:limit}, function( results ){
        
		if (!results) {
            callback( null );
            return;
        }
        var topics = OID( results );
		
        callback( topics );
    });
};

this.getGiveCookies = function(user_id, sport, skip, limit, callback) {
    db.find('topics', {sport:sport, 'cookies.received':null, user_id:OID(user_id), $or:[ {deleted:{$exists:false}}, {deleted:0} ] },
                      {sort:[['created', -1]], skip:skip, limit:limit}, function( results ){
		if (!results) {
            callback( null );
            return;
        }
        var topics = OID( results );
		
        callback( topics );
    });
};

this.getCookiesGiven = function(user_id, sport, skip, limit, callback) {
    db.find('topics', {sport:sport, 'cookies.received':{$ne:null}, user_id:OID(user_id), $or:[ {deleted:{$exists:false}}, {deleted:0} ] },
                      {sort:[['created', -1]], skip:skip, limit:limit}, function( results ){
		if (!results) {
            callback( null );
            return;
        }
        var topics = OID( results );
		
        callback( topics );
    });
};

exports.updateTopic = updateTopic;