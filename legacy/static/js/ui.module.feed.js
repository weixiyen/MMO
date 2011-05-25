(function(UI){

    UI.module.feed = function(selector) {
        return new Feed(selector);
    };
    
    function Feed( selector ) {
        
        $.defaultText({
            context: selector,
            clearEvents: [
                {selector: '.publish', type:'click'}
            ]
        });
        
        setInterval(function(){
            $(selector + ' .time').slice(0, 250).prettyDate();
        }, 30000);
        $(selector + ' .time').prettyDate();
        
        var self = this;
        
        self.selector = selector;
		self.new_topic = $(selector + ' .new-topic');
        self.topic_box = $(selector + ' .topics');
        self.OOT = false;
		self.select_cookie_recipient_label = 'Give cookies to...';
        
        /*  BIND - reply - ENTER KEY
        -------------------------------------------------*/
        $(selector).delegate('.reply > textarea', 'keypress', function(e){
            var code = e.keyCode || e.which;
            if (code != 13) return;
            self.reply( $(this) );
        }).delegate('.reply .button', 'click', function(){
            self.reply( $(this).closest('.reply').find('textarea') );
        }).delegate('.reply > textarea', 'focus', function(){
            $(selector + ' .reply > textarea').addClass('default').parent().find('.action').hide();
            $(this).removeClass('default').parent().find('.action').show();
        }).delegate('.reply > textarea', 'keyup', function(){
            var max = 500;
            if($(this).val().length > max) $(this).val($(this).val().substr(0, max));
            $(this).parent().find('.chars-remaining').html((max - $(this).val().length) + ' characters remaining'); 
        }).delegate('.upvote', 'click', function(){
			var topic_id = $(this).closest('.topic').attr('id');
			self.addCookies( topic_id );
		}).delegate('.cookies .received select', 'mouseenter', function(){
			var topic = $(this).closest('.topic'),
				topic_id = topic.attr('id'),
				author_id = $('#topic-author').val() || topic.find('.start.comment .member a').attr('href').replace('/m/',''),
				commenters = topic.find('.comments .comment .member a');
			if ( $(this).attr('selectedIndex') !== 0 ) return;
			self.populateCommenterList(topic_id, author_id, commenters);
		}).delegate('.cookies .received button', 'click', function(){
			var topic = $(this).closest('.topic'),
				topic_id = topic.attr('id'),
				user_id = topic.find('.cookies select option[selected]').val();
			if (user_id === '0') return;
			self.addCookies(topic_id, user_id);
		});
        
        this.reply = function(input) {
            var val = $.trim(input.val()),
                topic_id = input.closest('.topic').attr('id');
            
            if (val.length === 0) return;
                
            UI.ajax({
                url: '/api/feed/topic/comment',
                type: 'POST',
                beforeSend: function(){
                    input.attr('disabled', true);
                },
                data: {
                    action: 'create',
                    comment: val,
                    topic_id: topic_id
                },
                success: function(data) {
                    input.attr('disabled', false).val('').focus();
                    self.loadComments( topic_id, data.comment );
                }
            });
        };

        $(selector).delegate('.show-previous a', 'click', function(){
            var comment_box = $(this).closest('.comments'),
                link = $(this);
                
            if (comment_box.hasClass('expanded')) {
                comment_box.removeClass('expanded');
                link.find('em').text('Show');
            } else {
                comment_box.addClass('expanded');
                link.find('em').text('Hide');
            }
        });
        
        /*  create topic html
        -------------------------------------------------*/
        this.buildTopicHtml = function( topics, options ) {

            var self = this,
                len = topics.length,
                html = [],
                opts = {
                    show_comments: true,
                    show_member: true,
                    channels: true,
                    channel: self.channel
                };
            			
            if (options) opts = $.extend({}, opts, options);
            
            for (var i=0; i < len; i++) {
                var topic = topics[i],
                    show_previous_class = 'hidden',
                    previous_comments = 0,
					user_id = UI.user_id;
                
                if (topic.sport !== self.sport && self.sport !== 'all') break;    

                if (topic.channel !== opts.channel && opts.channels) { // topic belongs to different channel
                    var channel_alert = $('#channel-'+topic.channel+' > span'),
                        new_topics = (parseInt(channel_alert.text().replace('+','')) + 1) || 1;
                    channel_alert.text('+ ' + new_topics);
                    break;
                }

                if ( $('#'+topic._id).size() > 0 ) break; // if it exists already, continue loop
                
                html[i] = '<div class="topic" id="' + topic._id + '">';
                    
                    // topic start
                    html[i] += '<div class="start comment">';
                    html[i] += '<div class="time" title="'+topic.created+'">now</div>';
                    html[i] += '<div class="text">';
                        html[i] += '<a class="title" href="/feed/topic/' + topic._id + '">' + topic.comment + '</a> ';
                        
                        if (opts.show_member) html[i] += '<span class="member">-&nbsp;<a href="/m/' + topic.user_id + '">' + topic.user_name + '</a></span>';
                    
                    html[i] += '</div>';
                    html[i] += '</div>';
					
					
                    
                    if (opts.show_comments) {
						
						var upvoted_class = _.indexOf(topic.cookies.upvoted, user_id) !== -1 ? 'on' : '';

						html[i] += '<div class="cookies">'
							html[i] += '<div class="upvote br-3 ' + upvoted_class + '"><div class="arrow"></div><div class="wrap">' + topic.cookies.upvoted.length + '</div></div>';
							if (topic.cookies.received) {
								var amount = topic.cookies.received.amount,
									cookie_str = amount === 1 ? 'cookie' : 'cookies';
								html[i] += '<div class="received br-3"><div class="arrow"></div><div class="wrap"><a href="/m/' + topic.cookies.received.user_id + '">' + topic.cookies.received.user_name + '</a> received '+ amount +' ' + cookie_str + '.</div></div>';
							} else if ( topic.user_id === user_id ) {
								html[i] += '<div class="received br-3"><div class="arrow"></div><div class="wrap"><select><option value="0">' + self.select_cookie_recipient_label + '</option></select><button>Select</button></div></div>';
							} else {
								html[i] += '<div class="received br-3"><div class="arrow"></div><div class="wrap">Participate for a chance to get cookies!</div></div>'
							}
						html[i] += '</div>';
						
						
                        html[i] += '<div class="comments">';
                        if (topic.comments && topic.comments.length > 7) {
                            show_previous_class = '';
                            previous_comments = topic.comments.length - 7;
                        }
                        html[i] += '<div class="show-previous '+ show_previous_class +'"><a><em>Show</em> <span>'+previous_comments+'</span> earlier comments</a></div>';
                        if (topic.comments) html[i] += self.buildCommentsHtml( topic._id, topic.comments );
                        html[i] += '</div>';

                        // reply box
                        html[i] += '<div class="reply"><textarea class="default br-3"></textarea><div class="action"><div class="chars-remaining"></div><div class="mini button">Reply</div></div></div>';
                    }
                    
                html[i] += '</div>';
            }

            return html.join('');
        };
        
        this.buildCommentsHtml = function( topic_id, comments ) {
            var len = comments.length,
                html = [],
                prev_comments = $('#'+topic_id+' .comments .comment'),
                prev_len = prev_comments.size(),
                total_len = len + prev_len,
                before_html = '',
                previous_comments;
            
            
            
            for (var i=0; i<len; i++) {
                var comment = comments[i],
                    this_comment = $('#'+comment._id),
                    real_index = prev_len + i,
                    comment_class = '';
                
                if ( this_comment.size() > 0 ) {
                    total_len -= 1;
                    break; // if it exists already, continue loop
                }
                
                if ( total_len - real_index > 7 ) { // if this comment is above what is viewable
                    comment_class = 'folded';
                } else {
                    $(prev_comments[0, real_index-7]).addClass('folded');
                }
                                
                html[i] = '<div class="comment ' + comment_class + '" id="' + comment._id + '">';
                    html[i] += '<div class="time" title="'+comment.created+'">now</div>';
                    html[i] += '<div class="text">' + comment.comment + ' <span class="member">-&nbsp;<a href="/m/' + comment.user_id + '">' + comment.user_name + '</a></span></div>';
                html[i] += '</div>';
            }
            
            if (total_len > 7) $('#'+topic_id+' .show-previous').removeClass('hidden').find('span').text( total_len - 7 );
            
            return before_html + html.join('');
        };
        
    }
    
    Feed.prototype.loadChannel = function( sport_name, channel_name ){
        var self = this,
            channel = this.channel = channel_name,
			channels = true,
            sport = this.sport = sport_name,
            new_topic_input = $(self.selector + ' .new-topic input').show(),
            load_more_btn = $(self.selector + ' .load-more').show();
		
		self.OOT = false;
		
		if (channel === 'mycookies' || channel === 'givecookies' || channel === 'cookiesgiven') {
			self.new_topic.hide();
			channels = false;
		} else {
			self.new_topic.show();
		}
        
        /*  BIND - new topic input - ENTER KEY
        -------------------------------------------------*/
        new_topic_input.unbind('keypress').bind('keypress', function(e){
            var code = e.keyCode || e.which;
            if (code != 13) return;
            $(self.selector + ' .publish').trigger('click');
        });
        
        $(self.selector + ' .publish').unbind('click').bind('click',function(){
            var val = $.trim(new_topic_input.val());
            if (val.length === 0 || val === new_topic_input.attr('title')) return;
            
            UI.ajax({
                url: '/api/feed/topic',
                type: 'POST',
                beforeSend: function(){
                    new_topic_input.attr('disabled', true);
                },
                data: {
                    action: 'create',
                    comment: val,
                    channel: channel,
                    sport: sport
                },
                success: function(data) {
                    new_topic_input.attr('disabled', false).val('').blur();
                    self.loadTopics( data.topic );
                    setTimeout( function(){
                        $('#' + data.topic._id + ' .reply > textarea').focus();
                    }, 500);
                }
            }); 
        });
        
        /*  load more key binding
        -------------------------------------------------*/
        load_more_btn.unbind('click').bind('click', function(){
            var skip = self.topic_box.find('.topic').size();
            if (self.OOT === true || skip > 100) {
                load_more_btn.hide();
            } else {
                self.fetchTopics({sport:sport, channel:channel, channels:channels, skip:skip, limit:15, placement:'below'});
            }
        });
        
        $('#channel-' +channel+ ' span.dynamic').text('');
        
        this.topic_box.html('');
        this.fetchTopics({sport:sport, channel:channel, channels:channels, skip:0, limit:15, placement:'above'});
    };
    
    Feed.prototype.fetchTopics = function( opts ) {
        var self = this;
        UI.ajax({
            url: '/api/feed/' + opts.sport + '/' + opts.channel,
            data: {
                skip: opts.skip,
                limit: opts.limit
            },
            success: function(data) {
                if (data.topics.length === 0) {
                    self.OOT = true;
                } else {
                    self.loadTopics( data.topics, opts.placement, {channel:opts.channel, channels:opts.channels} );
                }
            }
        });
    };

    Feed.prototype.loadTopics = function ( topic_list, placement, options ){
        var topics = [].concat( topic_list );
        
        if (!placement) placement = 'above';
        var html = this.buildTopicHtml( topics, options );
		
        if (placement === 'above') {
            this.topic_box.prepend(html);
        } else if (placement === 'below') {
            this.topic_box.append(html);
        }
        
        var selectors = _.map(topics, function(topic){
            return '#' + topic._id + ' input';
        }).join(',');
        $(selectors).trigger('focusout');

        selectors = _.map(topics, function(topic){
            return '#' + topic._id + ' .time';
        }).join(',');
        $(selectors).prettyDate();

    };
    
    Feed.prototype.loadComments = function( topic_id, comment_list ){
        var comments = [].concat( comment_list ),
            comment_box = $('#' + topic_id + ' .comments');
        
        var html = this.buildCommentsHtml( topic_id, comments );
        comment_box.append( html );
        
    };
    
    Feed.prototype.updateTopicTitle = function( topic_id, title, callback ) {
        var self = this,
            input = $(self.selector + ' input.title');
            
        UI.ajax({
            url: '/api/feed/topic',
            type: 'POST',
            beforeSend: function(){
                input.attr('disabled', true);
            },
            data: {
                action: 'update',
                topic_id: topic_id,
                options: $.toJSON({comment: title})
            },
            success: function(data) {
                var topic = data.topic;
                input.attr({disabled:false});
                if (callback) callback( topic );
            }
        });
    };
    
    Feed.prototype.changeTopicTitle = function( topic_id, title ) {
        $('#' + topic_id + ' .title').text(title);
    };
    
    Feed.prototype.removeTopic = function( topic_id, callback ) {
        UI.ajax({
            url: '/api/feed/topic',
            type: 'POST',
            data: {
                action: 'remove',
                topic_id: topic_id
            },
            success: function(data) {
                if (callback) callback( data.topic );
            }
        });
    };
    
    Feed.prototype.destroyTopic = function(topic_id, callback) {
        $('#' + topic_id).addClass('deleted').text('Topic was deleted by a moderator.');
        if (callback) callback( topic_id );
    };
    
    
    /*  member profile pages
    -------------------------------------------------*/
    Feed.prototype.loadMemberTopics = function( user_id, type ) {
        
        var self = this,
            load_more_btn = $(self.selector + ' .load-more').show();
        
        self.user_id = user_id;
        self.type = type;
        self.OOT = false;
        self.sport = 'all';
        
        self.topic_box.html('');
        
        /*  load more key binding
        -------------------------------------------------*/
        load_more_btn.unbind('click').bind('click', function(){
            var skip = self.topic_box.find('.topic').size();
            if (self.OOT === true) {
                load_more_btn.hide();
            } else {
                self.fetchMemberTopics({user_id:user_id, type:type, skip:skip, limit:10, placement:'below'});
            }
        });
        
        self.fetchMemberTopics({user_id:user_id, type:type, skip:0, limit:10, placement:'above'});
        
    };
    
    Feed.prototype.fetchMemberTopics = function( opts ) {
        var self = this;
        UI.ajax({
            url: '/api/member/topics',
            beforeSend: function(){
                // loading button
            },
            data: {
                user_id: self.user_id,
                type: self.type,
                skip: opts.skip,
                limit: opts.limit
            },
            success: function(data) {
                if (data.topics.length === 0) {
                    self.OOT = true;
                } else {
                    self.loadTopics( data.topics, opts.placement, {show_comments:false, show_member:false, channels:false} );
                }
            }
        });
    };

	Feed.prototype.addCookies = function( topic_id, user_id ) {
		
		user_id = user_id || null;
		
		var self = this,
			upvote_button = $( self.selector + ' #' + topic_id + ' .upvote' ),
			action = user_id ? 'receive' : 'upvote';
		
		if ( action === 'upvote' && upvote_button.hasClass('on') ) return;
		
		UI.ajax({
			url: '/api/cookies',
			type: 'POST',
			data: {
				action: action,
				topic_id: topic_id,
				user_id: user_id
			},
			success: function(data) {
				
				if ( action === 'upvote') {
					var upvotes = data.topic.cookies.upvoted.length;
					upvote_button.addClass('on');
					self.updateUpvotes( topic_id, upvotes );
					return;
				}
				
				if ( action === 'receive' ) {
					self.receiveCookies( topic_id, user_id, data.topic.cookies.user_name, data.topic.cookies.amount );
					return;
				}
				
			}
		})
	};
	
	Feed.prototype.updateUpvotes = function( topic_id, upvotes ) {
		var self = this;
		$( self.selector + ' #' + topic_id + ' .upvote .wrap' ).text( upvotes );
	};
	
	Feed.prototype.receiveCookies = function( topic_id, user_id, user_name, amount ) {
		if (amount === undefined) return;
		var self = this,
			cookie_str = amount === 1 ? 'cookie' : 'cookies',
			html = '<a href="/m/' + user_id + '">' + user_name + '</a> received '+ amount +' ' + cookie_str + '.';
		$(self.selector + ' #' + topic_id + ' .cookies .received .wrap').html( html );
	};
	
	Feed.prototype.populateCommenterList = function( topic_id, author_id, commenters ) {
		var self = this,
			uid_list = [ author_id ],
			html = ['<option value="0">' + self.select_cookie_recipient_label + '</option>'];
			
		_.each(commenters, function(element) {
			var item = $(element),
				user_id = item.attr('href').replace('/m/',''),
				user_name = item.text();
			
			if ( _.indexOf(uid_list, user_id) === -1 ) { 
				uid_list.push( user_id );
				html.push( '<option value="' + user_id + '">' + user_name + '</option>' );
			}
			
		});
		
		$(self.selector + ' #' + topic_id + ' .cookies select' ).html( html.join('') );
	};

})(UI);
