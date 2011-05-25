(function(){
    
    var modules = [];
    
	var my_profile = $('#my-profile'),
	 	user_id = my_profile.size() > 0 ? my_profile.attr('rel') : null;
	
    var UI = {
        module: function(module, func) {
            modules.push({name:module,run:func});
        },
        render: function(module) {
            _.each(modules, function(m,i){
                if (m.name === module) {
                    m.run();
                    _.breakLoop();
                }
            });
        },
        settings: {
            stream_server: 'http://stream.sleeperbot.com/'
        },
		user_id: user_id
    }
    
    this.UI = UI;
})();

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-2806397-3']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();