UI.module('marketing.contact', function(){

    $('#logo').effect("bounce", 300).bind('click',function(){
        location.href = '/'; 
    });
    
    $('#send-button').bind('click', function(){
        
        UI.ajax({
            url: '/contactSend',
            type: 'POST',
            data: {
                name: $('#name').val(),
                email: $('#email').val(),
                subject: $('#subject').val(),
                message: $('#message').val()
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
    
    $('#form input').bind('keypress', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) {
            $('#send-button').trigger('click');
        }
    });
        

});