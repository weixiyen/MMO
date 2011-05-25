var db = require('../lib/mongo').db,
    _ = require('../web/underscore')._;

var counter = 0;

setTimeout(function(){
    
db.find('topics', {}, {}, function(topics){

    _.each(topics, function(topic){ if (topic.commenters) {
        
        var commenters = topic.commenters,
            id = topic._id;
        
        db.update('users', {_id:{$in:commenters}}, {$push:{topics:id}}, function(){
            console.log(counter++);
        });
        
    }});

});


}, 1000);