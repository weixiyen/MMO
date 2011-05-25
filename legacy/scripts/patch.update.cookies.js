var db = require('../lib/mongo').db,
    _ = require('../web/underscore')._;

setTimeout(function(){

	db.topics.update({}, {$set:{ cookies: {upvoted:[],received:null}} }, false, true);
	db.users.update({}, {$set:{ cookies: {football:0, basketball:0, baseball:0} } }, false, true);

}, 1000);