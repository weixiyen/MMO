var handler = require('../../web/handler').addHandler,
    show302 = require('../../web/serve').show302,
    show404 = require('../../web/serve').show404,
    render = require('../../web/template').render,
    validate = require('../../lib/validate').validate,
    xss = require('../../lib/validate').xss,
    hex_md5 = require('../../contrib/md5').hex_md5,
    model = require('./model'),
	member = require('../members/model'),
    settings = require('../../settings'),
    mailer = require('../../lib/mailer'),
    parseDate = require('../../contrib/date').parse,
    OID = require('../../lib/mongo').OID,
    flush = require('../../lib/socket').send,
    linkReplace = require('../../lib/utils').linkReplace,
	Member = require('../members/model');

handler({
    url: '/football',
    auth: 'member',
    action: function(req, res) {
		member.getUserCookies(req.user.id, function(member){
			res.end( render('feed/football.html',
	            { title: 'Live Fantasy Football Feed | SleeperBot | Real-time Fantasy Sports', user:req.user, member:member }));
		});
    }
});

handler({
    url: '/basketball',
    auth: 'member',
    action: function(req, res) {
        member.getUserCookies(req.user.id, function(member){
			res.end( render('feed/basketball.html',
            	{ title: 'Live Fantasy Basketball Feed | SleeperBot | Real-time Fantasy Sports', user:req.user, member:member }));
		});
    }
});

handler({
    url: '/baseball',
    auth: 'member',
    action: function(req, res) {
        member.getUserCookies(req.user.id, function(member){
			res.end( render('feed/baseball.html',
            	{ title: 'Live Fantasy Baseball Feed | SleeperBot | Real-time Fantasy Sports', user:req.user, member:member }));
		});
    }
});

handler({
    url: '/api/feed/:sport/:channel',
    auth: 'member',
    dataType: 'json',
    action: function(req, res) {
		
        var sport = req.params.sport,
            channel = req.params.channel,
            skip = req.get.skip,
            limit = req.get.limit,
			user_id = req.user.id;
			
		if ( channel === 'mycookies' ) {
			model.getMyCookies(user_id, sport, skip, limit, function(topics) {
				http_response( topics );
			});
			return;
		}
		
		if ( channel === 'givecookies' ) {
			model.getGiveCookies(user_id, sport, skip, limit, function(topics) {
				http_response( topics );
			});
			return;
		}
		
		if ( channel === 'cookiesgiven' ) {
			model.getCookiesGiven(user_id, sport, skip, limit, function(topics) {
				http_response( topics );
			});
			return;
		}
        
        model.getFeed(user_id, sport, channel, skip, limit, function(topics){
            http_response( topics );
        });

		function http_response ( topics ) {
			var response = {
				errors: 0,
				topics: topics
			};
			res.end( JSON.stringify(response) );
		}
        
    }
});

handler({
    url: '/api/feed/topic',
    auth: 'member',
    dataType: 'json',
    create: function(req, res) {
        
        var sport = req.post.sport,
            channel = req.post.channel,
            comment = linkReplace(xss(req.post.comment)),
            user_id = req.user.id,
            user_name = req.user.display_name;

        var topic = {
            user_id: user_id,
            user_name: user_name,
            sport: sport,
            channel: channel,
            comment: comment,
            commenters: [ OID(user_id) ],
			cookies: {
				upvoted: [ OID(user_id) ],
				received: null
			},
            created: new Date()
        };
                
        model.createTopic( topic, function( topic ) {
                var response = {
                    errors: 0,
                    topic: topic
                };
                
                res.end( JSON.stringify(response) );
                
                flush({
                    affected: 'all',
                    channels: ['feed:'+sport+':'+channel, 'topic:' + topic._id ],
                    type: 'topic',
                    action: 'create',
                    data: topic
                });
        });

    },
    update: function(req, res) {
        var topic_id = req.post.topic_id,
            options = JSON.parse(req.post.options);
            
        if (options.comment) options.comment = xss(options.comment);
        if (options.type) options.type = options.type;
        
        model.updateTopic( topic_id, options, function(topic) {
            
            var response = {
                errors: 0,
                topic: topic
            };
            res.end( JSON.stringify(response) );
            
            /* send to stream server
            --------------------------------*/
            flush({
                affected: 'all',
                channels: ['feed:'+topic.sport+':'+topic.channel, 'topic:' + topic._id ],
                type: 'topic',
                action: 'update',
                data: {
                    _id: topic._id,
                    comment: topic.comment,
                    type: topic.type
                }
            });
        });
    },
    remove: function(req, res) {
        var topic_id = req.post.topic_id,
            deleted = {
                time: new Date(),
                user_id: OID(req.user.id),
                user_name: req.user.display_name
            };
        
        model.updateTopic( topic_id, {deleted: deleted}, function(topic) {
						
            var response = {
                errors: 0,
                topic: topic
            };
            res.end( JSON.stringify(response) );
			
			var upvotes = topic.cookies.upvoted.length,
				cookies = upvotes === 0 ? 0 : upvotes * -1 + 1;
			Member.addCookies( topic.user_id, topic.sport, cookies );
            
            /* send to stream server
            --------------------------------*/
            flush({
                affected: 'all',
                channels: ['feed:'+topic.sport+':'+topic.channel, 'topic:' + topic._id ],
                type: 'topic',
                action: 'remove',
                data: { _id: topic._id }
            });
            
        });
    }
});

handler({
    url: '/api/feed/topic/comment',
    auth: 'member',
    dataType: 'json',
    create: function(req, res) {

        var topic_id = req.post.topic_id,
            comment = linkReplace(xss(req.post.comment)),
            user_id = req.user.id,
            user_name = req.user.display_name;
        
        var comment = {
            user_id: user_id,
            user_name: user_name,
            comment: comment,
            created: new Date()
        };
                
        model.reply( topic_id, comment, function( comment ) {
            var response = {
                errors: 0,
                comment: comment
            };
            res.end( JSON.stringify(response) );
            
            comment.topic_id;
            
            /* send to stream server
            --------------------------------*/
            flush({
                affected: 'all',
                channels: ['feed:'+comment.sport+':'+comment.channel, 'topic:' + topic_id ],
                type: 'comment',
                action: 'create',
                data: comment
            });
            
        });
        
    }
});

handler({
    url: '/feed/topic/:topic_id',
    auth: 'member',
    action: function(req, res) {
        
        var topic_id = req.params.topic_id,
            user_id = req.user.id;
        
        model.getTopic( topic_id, function( topic ) {
            model.removeTopicAlert( user_id, topic._id, function(){
                    
                if (!topic || topic.deleted) {
                    show404(res, 'Topic was deleted');
                    return;
                }
                res.end( render('feed/topic.html',
                    { title: topic.comment, topic:topic, user:req.user }));
            
            });
        });
        
    }
});

handler({
    url: '/topic/:topic_id',
    action: function(req, res) {
        var topic_id = req.params.topic_id;
        
        model.getTopic( topic_id, function( topic ) {
            if (!topic || topic.deleted) {
                show404(res, 'Topic was deleted');
                return;
            }
            res.end( render('feed/topic_public.html',
                { title: topic.comment, topic:topic }));
        });
    }
});

handler({
    url: '/api/news/:sport',
    dataType: 'json',
    action: function(req, res) {
        
        var sport = req.params.sport,
            skip = req.get.skip,
            limit = req.get.limit;
        
        model.getNews(sport, skip, limit, function(topics){
            var response = {
                errors: 0,
                topics: topics
            };
            res.end( JSON.stringify(response) );
        });
        
    }
});

handler({
    url: '/api/makenews/:sport',
    auth: 'member',
    dataType: 'json',
    create: function(req, res) {
        var topic_id = req.post.topic_id;
        model.pushNews(topic_id, function(topic){
            var response = {
                errors: 0,
                topic: topic
            };
            res.end( JSON.stringify(response) );
            
            /* send to stream server
            --------------------------------*/
            flush({
                affected: 'all',
                channels: ['news:'+topic.sport, 'topic:' + topic_id],
                type: 'news',
                action: 'create',
                data: topic
            });
        });
    },
    remove: function(req, res) {
        var topic_id = req.post.topic_id;
        model.pullNews(topic_id, function(topic){
            var response = {
                errors: 0,
                topic: topic
            };
            res.end( JSON.stringify(response) );
            
            /* send to stream server
            --------------------------------*/
            flush({
                affected: 'all',
                channels: ['news:'+topic.sport, 'topic:' + topic_id],
                type: 'news',
                action: 'remove',
                data: {
                    topic_id: topic_id
                }
            });
        });
    }
});

handler({
    url: '/api/cookies',
	auth: 'member',
	dataType: 'json',
    action: function(req, res) {
		// adds cookie to a topic
		var topic_id = req.post.topic_id,
			user_id = req.user.id,
			action = req.post.action; // upvote or give
		
		if (action === 'receive') {
			model.receiveCookie( topic_id, user_id, req.post.user_id, function( topic ) {
				http_response( topic );
			});
			return;
		}
		
		model.addCookie( topic_id, user_id, function( topic ) {
			http_response( topic );
		});
		
		function http_response( topic ) {

			var response = {
	            errors: 0,
	            topic: topic
	        };
	        res.end( JSON.stringify(response) );
			
			var data;
			if ( action === 'receive' ) {
				data = {
	                topic_id: topic_id,
					user_id: topic.cookies.received.user_id,
					user_name: topic.cookies.received.user_name,
					amount: topic.cookies.received.amount
	            }
			} else {
				data = {
	                topic_id: topic_id,
					upvotes: topic.cookies.upvoted.length
	            }
			}

			/* send to stream server
	        --------------------------------*/
	        flush({
	            affected: 'all',
	            channels: ['cookies:'+topic.sport, 'topic:' + topic_id],
	            type: 'cookie',
	            action: action,
	            data: data
	        });
		}
    }
});
