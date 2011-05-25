UI.module('auth.signup', function(){
    $.defaultText({
        context: '#form',
        clearEvents:[
            {selector: '#signup-button', type:'click'}
        ]
    });
    
    $('#logo').bind('click',function(){
        location.href = '/';
    });
    
    $('#signup-button').bind('click', function(){
        
        UI.ajax({
            url: '/auth/signup',
            type: 'POST',
            data: {
                display_name: $('#display-name').val(),
                email: $('#email').val(),
                email2: $('#email2').val(),
                password: $('#password').val(),
                password2: $('#password2').val(),
                code: $('#code').val()
            },
            beforeSend: function() {
                $('#error-box').hide();  
            },
            error: function(total_errors, html) {
                $('#error-box').html( html ).show();  
            },
            success: function() {
                $('#form').hide();
                $('#sent-box').show();
            }
        });
            
    });
    
    $('#form').bind('keypress', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) {
            $('#signup-button').trigger('click');
        }
    });
    
});