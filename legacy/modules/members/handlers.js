var handler = require('../../web/handler').addHandler,
    show302 = require('../../web/serve').show302,
    show404 = require('../../web/serve').show404,
    render = require('../../web/template').render,
    validate = require('../../lib/validate').validate,
    xss = require('../../lib/validate').xss,
    model = require('./model');
    hex_md5 = require('../../contrib/md5').hex_md5,
    settings = require('../../settings'),
    mailer = require('../../lib/mailer'),
    parseDate = require('../../contrib/date').parse,
    dateFormat = require('../../contrib/dateFormat').dateFormat,
    OID = require('../../lib/mongo').OID,
    flush = require('../../lib/socket').send;

handler({
    url: '/m/:id',
    auth: 'member',
    action: function(req, res) {
        
        var user_id = req.params.id;
        
        model.getUserActivity(user_id, function(member){
            res.end( render('members/profile.html',
                { title: req.user.display_name + ' | SleeperBot', user:req.user, member:member }));
        });
        
    }
});

handler({
    url: '/api/member/topics',
    auth: 'member',
    action: function(req, res) {
        
        var type = req.get.type,
            user_id = req.get.user_id,
            skip = req.get.skip,
            limit = req.get.limit;
        switch(type) {
            
            case 'started':
                model.getTopicsStarted(user_id, skip, limit, function(topics){
                    var response = {
                        errors: 0,
                        topics: topics
                    };
                    res.end( JSON.stringify(response) );
                });
                break;
            
            case 'replied':
                model.getTopicsRepliedTo(user_id, skip, limit, function(topics){
                    var response = {
                        errors: 0,
                        topics: topics
                    };
                    res.end( JSON.stringify(response) );
                });
                break;
            
            case 'alerts':
                model.getTopicAlerts(req.user.id, skip, limit, function(topics){
                    var response = {
                        errors: 0,
                        topics: topics
                    };
                    res.end( JSON.stringify(response) );
                });
                break;
            
            default: // all
                model.getAllTopics(user_id, skip, limit, function(topics){
                    var response = {
                        errors: 0,
                        topics: topics
                    };
                    res.end( JSON.stringify(response) );
                });
                break;
        }
        
    },
    remove: function(req, res) {
        var user_id = req.user.id,
            topics = req.post.topics;
        
        switch(topics) {
            default: // all
                model.removeAllTopicAlerts(user_id, function(){
                    var response = {
                        errors: 0
                    };
                    res.end( JSON.stringify(response) );
                })
                break;
        }
    }
});