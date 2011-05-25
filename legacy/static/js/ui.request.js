(function(UI){
    
    /* ajax
    --------------------------------------*/
    var ajax_opts = {
            type: 'GET',
            dataType: 'json',
            cache: false,
            data: {},
            beforeSend: $.noop,
            success: $.noop,
            error: $.noop
        };
    
    var ajax = function( options ) {
        
        var opts = $.extend({}, ajax_opts, options);
        
        $.ajax({
            url: opts.url,
            type: opts.type,
            dataType: opts.dataType,
            cache: opts.cache,
            data: opts.data,
            beforeSend: function() {
                $('input').removeClass('error');
                opts.beforeSend();
            },
            success: function(data) {
                var errors = data.errors;
                if (errors.length) {
                    var html = [];
                    _.each(errors, function(error){
                        $(error.id).addClass('error');
                        html.push( '<li>' + error.msg + '</li>' );
                    });
                    opts.error( html.length, html.join('') );
                } else {
                    opts.success(data);
                }
            }
        });
    };
    
    /* comet using jsonp
    -----------------------------------------------*/
    
    var cometFn = function( request, callback ) {
        request.user_id = $.cookie('userid');
        if (!request.user_id) {
            $('#member-connected').text( 'Not connected to SleeperBot.' ).closest('.members-online').addClass('disconnected');
            return;
        }
        request.first_load = 1;
        var sleep = 200,
            max_sleep = 2000,
            members_online = $('#members-online'),
            inbox_alerts = $('#inbox-alerts'),
            inbox = inbox_alerts.closest('.inbox');
        function comet() {
            $.jsonp({
                url: UI.settings.stream_server,
                callbackParameter: "callback",
                data: request,
                timeout: 45000,
                cache: false,
                pageCache: false,
                error: function(){
                    if (sleep < max_sleep) sleep *= 2;
                    setTimeout(function(){
                        comet();
                    }, sleep);
                },
                success: function(data) {
                    if (request.first_load === 1) delete request.first_load;
                    
                    callback( data.list, function(){
                        
                        members_online.text( data.online_members );
                        inbox_alerts.text( data.inbox_alerts );
                        if (data.inbox_alerts === 0) { inbox.removeClass('new'); } else { inbox.addClass('new'); }
                        sleep = 200;
                        if (data.cursor) request.cursor = data.cursor;
                        setTimeout(function(){
                            comet();
                        }, sleep);
                        
                    });

                }
            }); 
        }
        
        // fixes loading spinner issue
        setTimeout(function(){
            comet();
        }, 400);
        
    };
    
    /* processes data & window title changer
    -----------------------------------------------*/
    var downstream = function( data, options, callback ){
        if (!callback) callback = $.noop;
        if (!data) { callback(); return; }
        _.each( data, function(obj) {
            var item = obj.data;
            switch(obj.type) {
                case 'topic':
                    switch(obj.action) {
                        case 'create':
                            titlePlusOne('New Topic on SleeperBot');
                            options.feed.loadTopics([item], 'above'); 
                            break;
                        case 'update':
                            options.feed.changeTopicTitle(item._id, item.comment);
                            if (options.news) options.news.changeTopicType(item._id, item.type);
                            break;
                        case 'remove':
                            options.feed.destroyTopic(item._id, function( topic_id ){
                                if (options.news) options.news.removeTopic( topic_id );
                            });
                            break;
                    }
                    break;
                case 'comment':
                    switch(obj.action) {
                        case 'create':
                            options.feed.loadComments( item.topic_id, [item] );
                            break;
                    }
                    break;
                case 'news':
                    switch(obj.action) {
                        case 'create':
                            options.news.loadTopics( [item], 'above' );
                        case 'remove':
                            options.news.removeTopic( item.topic_id );
                    }
                    break;
				case 'cookie':
					switch(obj.action) {
                        case 'upvote':
                            options.feed.updateUpvotes( item.topic_id, item.upvotes );
                            break;
						case 'receive':
                            options.feed.receiveCookies( item.topic_id, item.user_id, item.user_name, item.amount );
                            break;
                    }
					break;
            }
        });
        callback();
    };
    
    /* toggle title
    --------------------------------*/
    var window_has_focus = true,
        original_title = document.title,
        counter = 0;
        
    $(window).blur(function(){
        window_has_focus = false;
    }).focus(function(){
        window_has_focus = true;
        counter = 0;
        setTimeout(function(){
            document.title = original_title;
        }, 300);
    });
    
    function titlePlusOne(title) {
        if ( window_has_focus ) return;
        counter++;
        document.title = '('+ counter +') ' + title;
    }
    
    UI.ajax = ajax;
    UI.comet = cometFn;
    UI.comet.downstream = downstream;
    
})(UI);