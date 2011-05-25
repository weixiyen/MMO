UI.module('marketing.about', function(){

    var init = function(){

        $('#logo').effect("bounce", 300).bind('click',function(){
            location.href = '/'; 
        });
        
    }();

});