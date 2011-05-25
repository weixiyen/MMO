(function(UI){

    UI.module.news = function(selector) {
        return new News(selector);
    };

    function News( selector ) {
                
        setInterval(function(){
            $(selector + ' .time').slice(0, 250).prettyDate();
        }, 20000);
        $(selector + ' .time').prettyDate();
        
        var self = this,
            updates_box = self.updates_box = $(selector + ' .updates');
        
        self.first_load = true;
        self.selector = selector;
        self.currentFilter = 'news';
        
        /*  news html
        -------------------------------------------------*/
        this.buildNewsHtml = function( topics ) {
            var len = topics.length,
                html = [];
            for (var i=0; i < len; i++) {
                var topic = topics[i];

                if (topic.sport !== self.sport) break; // not the same sport bug
                if ( $(selector + '-' + topic._id).size() > 0 ) break; // if it exists already, continue loop
                
                html[i] = '<div class="update '+topic.type+'" id="' + selector.replace('#','') + '-' + topic._id + '">';
                html[i] += '<div class="time" title="'+topic.news.created+'">now</div>';
                html[i] += '<div class="link">';
                    html[i] += '<a href="/feed/topic/' + topic._id + '">' + topic.comment + '</a> ';
                html[i] += '</div>';
                html[i] += '</div>';
            }
            return html.join('');
        };
        
    }
    
    News.prototype.loadSport = function( sport_name, skip, limit ){
        var sport = this.sport = sport_name;
        this.updates_box.html('');
        this.fetchTopics({sport:sport, skip:skip, limit:limit, placement: 'above'});
    };
    
    News.prototype.fetchTopics = function( opts ) {
        var self = this;
        UI.ajax({
            url: '/api/news/' + opts.sport,
            data: {
                skip: opts.skip,
                limit: opts.limit
            },
            success: function(data) {
                self.loadTopics( data.topics, opts.placement );
            }
        });
    };
    
    News.prototype.loadTopics = function ( topic_list, placement ){
        var self = this,
            topics = [].concat( topic_list );
        if (!placement) placement = 'above';
        
        var html = self.buildNewsHtml( topics );
        
        if (placement === 'above') {
            self.updates_box.prepend(html);
        } else if (placement === 'below') {
            self.updates_box.append(html);
        }
        
        if (self.first_load) {
            $(self.selector + ' .time').prettyDate();
        }
        self.first_load = false;
    };
    
    News.prototype.pushTopic = function( topic_id, callback ){
        var self = this;
        UI.ajax({
            url: '/api/makenews/'+self.sport,
            type: 'POST',
            data: {
                action: 'create',
                topic_id: topic_id
            },
            success: function(data) {
                self.loadTopics( data.topic, 'above' );
                if (callback) callback( data.topic );
            }
        });
    };
    
    News.prototype.pullTopic = function( topic_id, callback ){
        var self = this;
        UI.ajax({
            url: '/api/makenews/'+self.sport,
            type: 'POST',
            data: {
                action: 'remove',
                topic_id: topic_id
            },
            success: function(data) {
                $(self.selector + '-' + topic_id).remove();
                if (callback) callback( data.topic );
            }
        });
    };
    
    News.prototype.updateTopicType = function( topic_id, type, callback ) {
        var self = this;
        UI.ajax({
            url: '/api/feed/topic',
            type: 'POST',
            data: {
                action: 'update',
                topic_id: topic_id,
                options: $.toJSON({type: type})
            },
            success: function(data) {
                $(self.selector + '-' + topic_id).removeClass(type).addClass(data.topic.type);
                if (callback) callback( data.topic );
            }
        });
    };
    
    News.prototype.updateTopicTitle = function( topic_id, title, callback ) {
        var self = this;
        $(self.selector + '-' + topic_id + ' .link a').text(title);        
        if (callback) callback( title );
    };
    
    News.prototype.removeTopic = function( topic_id, callback ) {
        var self = this;
        $(self.selector + '-' + topic_id).remove();
        if (callback) callback( topic_id );
    };
    
    News.prototype.filter = function( type ) {
        var self = this;
        $(self.selector + ' .update').hide();
        switch (type) {
            case 'sleepers':
                $(self.selector + ' .update.sleeper').show();
                self.currentFilter = 'sleepers';
                break;
            case 'injuries':
                $(self.selector + ' .update.injury').show();
                self.currentFilter = 'injuries';
                break;
            default:
                $(self.selector + ' .update').show();
                self.currentFilter = 'news';
                break;
        }
    };
    
    News.prototype.changeTopicType = function( topic_id, type ) {
        var self = this;
        $(self.selector + '-' + topic_id).removeClass('sleeper injury news').addClass( type );
        self.filter( self.currentFilter );
    };
    
})(UI);
