UI.module('auth.password', function(){
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
            url: '/auth/sendPasswordResetLink',
            type: 'POST',
            data: {
                email: $('#email').val()
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