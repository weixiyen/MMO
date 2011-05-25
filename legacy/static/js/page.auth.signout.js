UI.module('auth.signout', function(){
    $.cookie('userid', null);
    $('#logo').bind('click',function(){
        location.href = '/';
    });
});