UI.module('marketing.beta.signup', function(){

    var init = function(){
        
        $('#logo').effect("bounce", 300);
        
        $('#send-app').bind('click',function(){
            sendApp();
        });
    
        function sendApp() {
            
            UI.ajax({
                url: '/beta/apply',
                type: 'POST',
                data: {
                    name: $('#name').val(),
                    email: $('#email').val(),
                    exp: $('#experience').val()
                },
                success: function() {
                    $('#form').hide();
                    $('#sent-box').show();
                }
            });
            
        }
        
    }();

});