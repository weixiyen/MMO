UI.module('members.profile', function(){
    
    var menu = UI.module.menu('#menu'),
        user_id = $('#user_id').val(),
        feed = UI.module.feed('#feed');
        
    feed.loadMemberTopics(user_id); // started
    
    $('.mod-channels a').bind('click',function(){
        
        var type = $(this).attr('id').split('-')[1];
        
        // show description
        $('#feed .description').hide();
        $('#description-'+type).show();
        
        // change channel
        $('.mod-channels a').removeClass('on');
        $(this).addClass('on');

        feed.loadMemberTopics(user_id, type);
    });
    
    var joined = UI.dateFormat($('#joined').attr('title'), 'mmm d, yyyy');
    $('#joined').text( joined );
    
    /*  comet
    -------------------------------------------------*/
    UI.comet({}, function(data, callback){
        UI.comet.downstream(data, {}, callback);
    });
});