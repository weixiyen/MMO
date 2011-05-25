var db = require('../lib/mongo').db,
    _ = require('../web/underscore')._;

setTimeout(function(){

db.find('users', {stop_email:{$ne:1}}, {email:1}, function(results){

    var users_emails = _.uniq(_.map(results, function(obj){return obj.email }));
        
    db.find('beta_applications', {email:{$nin:users_emails}, stop_email:{$ne:1}}, {email:1}, function(betas){
    db.find('baseball_tiersheets', {email:{$nin:users_emails}, stop_email:{$ne:1}}, {email:1}, function(tiersheets){            
		
		betas = betas.concat(tiersheets);

		var emails = _.uniq(_.map(betas, function(obj){return obj.email })),
		    len = emails.length;
		for (var i = 0; i< len; i++) {
		    var email = emails[i];
		    console.log(email);
		}

		db.update('beta_applications', {}, {$set:{emailed:1}}, function(){
		    
		        console.log('************');
		        console.log('done, now doing users emails');
		        console.log('************');
        
		        var len = users_emails.length;
		        for (var i = 0; i< len; i++) {
		            var email = users_emails[i];
		            console.log(email);
		        }
        
		});
            
    });
    });

});

}, 1000)
