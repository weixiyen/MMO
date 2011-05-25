UI.module('football.feed.topic', function(){
    
    var menu = UI.module.menu('#menu'),
        feed = UI.module.feed('#topic'),
        news = UI.module.news('#news'),
        topic_id = $('#topic .topic').attr('id'),
        topic_input = $('#topic-title-input');
    
    news.loadSport('football', 0, 10);
    
    /*  show posted date for topic
    -------------------------------------------------*/
    var posted = UI.dateFormat($('#posted').attr('title'), 'mmm d, yyyy h:sstt');
    $('#posted').text( posted );

    /*  button bindings
    -------------------------------------------------*/
    $('#push-topic').bind('click', function(){
        news.pushTopic( topic_id, function(){
            showButton('pull-topic');
        });
    });
    
    $('#pull-topic').bind('click', function(){
        var question = "Remove this topic from breaking news?";
        UI.confirm(question, function(){
            news.pullTopic( topic_id, function(){
                showButton('push-topic');
            });
        })
    });
    
    $('#edit-topic-title').bind('click', function(){
        $('#topic-title-display').hide();
        $('#topic-title-edit').show();
    });
    
    topic_input.bind('keypress', function(e){
        var code = e.keyCode || e.which;
        if (code != 13) return;
        $('#save-title').trigger('click');
    });
    
    $('#save-title').bind('click',function(){
        var topic_title = $.trim( topic_input.val() );
        if (topic_title.length === 0) return;
        updateTopicTitle( topic_id, topic_title ); 
    });
    
    $('#delete-topic').bind('click', function(){
        var question = "Are you sure you want to delete this topic?";
        UI.confirm(question, function(){
            feed.removeTopic(topic_id, function(){
                location.href = '/football';
            });
        }); 
    });
    
    $('#cancel-topic-edit').bind('click',function(){
        cancelTopicEditor();
    });
    
    $('#topic-type input').bind('click', function(){
        var type = $(this).attr('id').replace('type-','');
        news.updateTopicType( topic_id, type ); 
    });
    
    /*  helper functions
    -------------------------------------------------*/
    function showButton( type ) {
        $('#push-topic,#pull-topic').hide();
        $('#' + type).show();
    }
    
    function updateTopicTitle(topic_id, title) {
        feed.updateTopicTitle(topic_id, title, function(topic){
            news.updateTopicTitle(topic_id, topic.comment, function(title){
                cancelTopicEditor();
                $('#topic-title').text(title).effect('highlight');
                document.title = title;
                $('#topic-title-input').val(title);
            }); 
        });
    }
    
    function cancelTopicEditor() {
        $('#topic-title-edit').hide();
        $('#topic-title-display').show();
    }
    
    /*  comet
    -------------------------------------------------*/
    var request = {
        channels: ['topic:' + topic_id, 'news:football']
    };
    UI.comet(request, function(data, callback){
        UI.comet.downstream(data, {
            feed: feed,
            news: news
        }, callback);
    });
    
});