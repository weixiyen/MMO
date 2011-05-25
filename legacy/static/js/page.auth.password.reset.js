UI.module('auth.password.reset', function(){
    $.defaultText({
        context: '#form',
        clearEvents:[
            {selector: '#reset-button', type:'click'}
        ]
    });
    
    $('#logo').bind('click',function(){
        location.href = '/';
    });
    
    $('#reset-button').bind('click', function(){
        
        UI.ajax({
            url: '/auth/updatePassword',
            type: 'POST',
            data: {
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
            $('#reset-button').trigger('click');
        }
    });
    
});