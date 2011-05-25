var handler = require('../../web/handler').addHandler,
    render = require('../../web/template').render,
    validate = require('../../lib/validate').validate,
    xss = require('../../lib/validate').xss,
    show302 = require('../../web/serve').show302,
    settings = require('../../settings'),
    mailer = require('../../lib/mailer');

handler({
    url: '/about',
    action: function(req, res) {
        res.end( render('marketing/about.html',
            { title: 'About SleeperBot - The Hottest Fantasy Sports Community' }));
    }
});

handler({
    url: '/contact',
    action: function(req, res) {
        res.end( render('marketing/contact.html',
            { title: 'Contact SleeperBot' }));
    }
});


/*  send contact info
-------------------------------------------------*/
handler({
    url: '/contactSend',
    datatype: 'json',
    action: function(req, res) {
        
        var email = req.post.email,
            name = xss(req.post.name),
            subject = xss(req.post.subject),
            message = xss(req.post.message);
                    
        /*  error validation
        -------------------------------------------------*/
        var errors = validate([
            {check: 'email', input:email, id:'#email', msg:'Invalid Email.'},
            {check: 'exists', input:name, id:'#name', msg:'No Name.'},
            {check: 'alpha', input:name, id:'#name', msg:'Invalid Name.'},
            {check: 'exists', input:subject, id:'#subject', msg:'Subject missing.'},
            {check: 'exists', input:message, id:'#message', msg:'Message text does not exist.'}
        ]);
        
        if ( errors.length > 0 ) {
            res.end( JSON.stringify({errors: errors}) );
            return;
        }

        if (settings.web.env === 'live') {
            
            setTimeout(function(){
                mailer.send({
                    to: settings.email.address.contact,
                    from: email,
                    subject: subject,
                    body: message
                });
            }, 1000);
            
            setTimeout(function(){
                mailer.send({
                    to: email,
                    from: settings.email.address.noreply,
                    subject: 'SleeperBot Inquiry Received',
                    body: 'Thank you! We have received your inquiry and will get in touch soon.'
                });
            }, 2000);
            
        }
        
        var response = {
            errors: 0
        };
        res.end( JSON.stringify(response) );
    
    }
});