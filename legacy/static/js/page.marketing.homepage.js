UI.module('marketing.homepage', function(){
    $('#robot').effect("bounce", 300);
    
    $('#open-application-form').bind('click', function(){
        $('#features, #open-application-form').hide();
        $('#application-form').show();
    });
    
    $('#apply-button').bind('click',function(){
        UI.ajax({
            url: '/beta/apply',
            type: 'POST',
            data: {
                email: $('#email').val(),
                team: $('#team').val(),
                occupation: $('#occupation').val()
            },
            success: function(data) {
                $('#referral-id').text(data.app.referral);
                $('#form').hide();
                $('#sent-box').show();
            }
        });
    });
    
    $('#form input').bind('keypress', function(e){
        var code = e.keyCode || e.which;
        if (code == 13) {
            $('#apply-button').trigger('click');
        }
    });
    
    setInterval(function(){
        $('.time').slice(0, 250).prettyDate();
    }, 30000);
    $('.time').prettyDate();
});