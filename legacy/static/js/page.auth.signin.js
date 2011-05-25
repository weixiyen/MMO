UI.module('auth.signin', function(){
    if ($.cookie('userid')) location.href = $('#path').val();
    $('#logo').bind('click',function(){
        location.href = '/';
    });
    $('#email').focus();
    
    $('#signin-button').bind('click',function(){
        $('#signin-form').submit();
    });
    $('#signin-form').bind('keypress', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) {
            $('#signin-button').trigger('click');
        }
    });
});