(function(UI){
    
    var confirm = function( msg, callback ) {
        var yes = window.confirm(msg);
        if (yes) callback();
    };
    
    UI.confirm = confirm;
    
})(UI);