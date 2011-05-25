UI.module('basketball.feed.index', function(){
    
    var menu = UI.module.menu('#menu'),
        feed = UI.module.feed('#feed'),
        news = UI.module.news('#news');
    
    
    news.loadSport('basketball', 0, 40);
    
    /*  click channels to load them
    -------------------------------------------------*/
    $('.mod-channels a').bind('click',function(){
        
        var channel = $(this).attr('id').split('-')[1];
        loadChannel( '/channel/' + channel );
        
        var url = '/channel/' + channel;
        url = url.replace(/^.*#/, '');
        $.history.load( url );
        
    });
    
    /*  click channels to load them
    -------------------------------------------------*/
    var options = {unescape: true};
    $.history.init(loadChannel, options);

    /*  function to load a channel
    -------------------------------------------------*/
    function loadChannel( channel ) {
        if (!channel) channel = '/channel/fantasy';
        channel = channel.replace('/channel/','');
        
        // show description
        $('#feed .description').hide();
        $('#description-'+channel).show();
        
        // change channel
        $('.mod-channels a').removeClass('on');
        $('#channel-'+channel).addClass('on');

        feed.loadChannel('basketball', channel);
    }
    
    /*  filters
    -------------------------------------------------*/
    $('#news-filters a').bind('click', function(){
        $('#news-filters a').removeClass('on');
        var type = $(this).addClass('on').attr('rel');
        news.filter( type );
    });
    
    
    /*  comet
    -------------------------------------------------*/
    var request = {
        channels: ['feed:basketball:fantasy', 'news:basketball', 'feed:basketball:advice', 'feed:basketball:feedback', 'feed:basketball:offtopic', 'cookies:basketball']
    };
    
    UI.comet(request, function(data, callback){
        UI.comet.downstream(data, {
            feed: feed,
            news: news
        }, callback);
    });

});