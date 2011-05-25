var handler = require('../../web/handler').addHandler,
    render = require('../../web/template').render,
    validate = require('../../lib/validate').validate,
    xss = require('../../lib/validate').xss,
    show302 = require('../../web/serve').show302,
    hex_md5 = require('../../contrib/md5').hex_md5,
    uuid = require('../../contrib/uuid').uuid,
    model = require('./model'),
    settings = require('../../settings'),
    mailer = require('../../lib/mailer'),
    signIn = require('../../middleware/auth/').signIn,
    signOut = require('../../middleware/auth/').signOut,
    isSignedIn = require('../../middleware/auth/').isSignedIn;

handler({
    url: '/',
    action: function(req, res) {
        isSignedIn(req, res, function(is_signed_in){
            if (is_signed_in) {
                show302(res, '/basketball');
            } else {
                model.getTopics(0, 15, function(topics){
                model.getNews(0, 10, function(news){
                    res.end( render('marketing/homepage.html',
                    { title: 'SleeperBot | Real-time Fantasy Sports | Fantasy Football and Fantasy Basketball', topics:topics, news:news }));
                }); // END news
                }); // END topics
            }
        });
    }
});

handler({
    url: '/r/:referrer',
    action: function(req, res) {
        show302(res, '/');
    }
});

handler({
    url: '/signup',
    action: function(req, res) {
        res.end( render('auth/signup.html',
            { title: 'SleeperBot | Sign Up' }));
    }
});

handler({
    url: '/signin',
    action: function(req, res) {
        
        if (req.method === 'POST') {

            /*  error validation
            -------------------------------------------------*/
            var email = req.post.email,
                password = req.post.password,
                path = req.post.path;
            
            var errors = validate([
                {check:'email', input:email, id:'#email', msg:'Invalid Email.'},
                {check:'exists', input:password, id:'#password', msg:'You did not specify a password.'}
            ]);
            
            if ( errors.length > 0 ) {
                res.errors = errors;
                res.end( render('auth/signin.html',
                        { title: 'SleeperBot | Sign In', errors: res.errors }));
                return;
            }
                    
            signIn({
                req: req,
                res: res,
                success: function(req, res){
                    show302(res, '/basketball');
                },
                fail: function(req, res, msg){
                    res.errors = [{id:'#email,#password', msg:msg}];
                    res.end( render('auth/signin.html',
                        { title: 'SleeperBot | Sign In', errors: res.errors }));
                }
            });
            
        }
        
        if (req.method === 'GET') {
            res.end( render('auth/signin.html',
                { title: 'SleeperBot | Sign In', errors: null }));
        }
        
    }
});

handler({
    url: '/signout',
    auth: 'member',
    action: function(req, res) {
        signOut(req, res, function(){
            res.end( render('auth/signout.html',
                { title: 'SleeperBot | Signed Out' }));
        });
    }
});

/*  password pages
-------------------------------------------------*/

handler({
    url: '/auth/password',
    action: function(req, res) {
        res.end( render('auth/password.html',
            { title: 'Forgot Your Password @ SleeperBot?' }));
    }
});

handler({
    url: '/auth/sendPasswordResetLink',
    action: function( req, res ) {
        var email = req.post.email;
        
        var errors = validate([
            {check:'email', input:email, id:'#email', msg:'Invalid email format.'}
        ]);
        
        model.emailExists(email, function(exists) {
            
            if (exists === false) {
                errors.push({id:'#email', msg:'This email does not exist in our database.'});
            }
            
            if ( errors.length > 0 ) {
                res.end( JSON.stringify({errors: errors}) );
                return;
            }
            
            var code = uuid();
            model.generatePasswordResetCode( email, code, function() { //email or null
                if (settings.web.env === 'live') {
                    mailer.send({
                        to: email,
                        from: settings.email.address.noreply,
                        subject: 'SleeperBot Password Reset',
                        body: 'Reset Your Password: http://'+ settings.web.domain + '/auth/resetPassword/' + code
                    });
                }
                
                var response = {
                    errors: 0
                };
                res.end( JSON.stringify(response) );
            });
            
            
        });

    }
})

handler({
    url: '/auth/resetPassword/:code',
    action: function(req, res) {
        var code = req.params.code;
        model.validPasswordResetCode( code, function( user ){
            var valid = user === null ? false : true;
            res.end( render('auth/password_reset.html',
                { title: 'Reset Your Password', valid: valid, user:user }));
        });
    }
});

handler({
    url: '/auth/updatePassword',
    action: function(req, res) {
        var password = req.post.password,
            password2 = req.post.password2,
            code = req.post.code;
                
        var errors = validate([
            {check:'exists', input:password, id:'#password', msg:'You did not specify a password.'},
            {check:'exists', input:password2, id:'#password2', msg:'You did not specify a password.'},
            {check:'matches', input:[password, password2], id:'#password,#password2', msg:'The passwords you entered do not match'}
        ]);
        
        model.validPasswordResetCode( code, function( user ){
            
            if (user === null) errors.push({id:'#password,#password2', msg:'Sorry. This password reset link has expired.'});
            
            if ( errors.length > 0 ) {
                res.end( JSON.stringify({errors: errors}) );
                return;
            }
            
            model.updatePassword( user._id, password, function() {
                var response = {
                    errors: 0
                };
                res.end( JSON.stringify(response) );
            })
        });
        
        
    }
})


/*  signup POST
-------------------------------------------------*/
handler({
    url: '/auth/signup',
    dataType: 'json',
    action: function(req, res) {
        var email = req.post.email,
            email2 = req.post.email2,
            display_name = req.post.display_name,
            password = req.post.password,
            password2 = req.post.password2,
            code = req.post.code;
        
        var errors = validate([
            {check:'email', input:email, id:'#email', msg:'Invalid Email.'},
            {check:'email', input:email2, id:'#email2', msg:'Invalid Email.'},
            {check:'exists', input:password, id:'#password', msg:'You did not specify a password.'},
            {check:'exists', input:password2, id:'#password2', msg:'You did not specify a password.'},
            {check:'matches', input:[email, email2], id:'#email,#email2', msg:'The emails you entered do not match.'},
            {check:'matches', input:[password, password2], id:'#password,#password2', msg:'The passwords you entered do not match'},
            {check:'exists', input:code, id:'#code', msg:'No beta code supplied.'},
            {check:'alphanum', input:display_name, id:'#display-name', msg:'Display must be comprised of letters and numbers only.'},
            {check:'betacode', input:code, id:'#code', msg:'Incorrect Beta Code'}
        ]);
        
        model.emailExists(email, function(exists) {
            
            if (exists) {
                errors.push({id:'#email', msg:'This email already exists in our database.'});
            }
            
            if ( errors.length > 0 ) {
                res.end( JSON.stringify({errors: errors}) );
                return;
            }
            
            /*  save the application if it's ok
            -------------------------------------------------*/
            var user = {
                email: email,
                password: hex_md5(password),
                display_name: display_name,
                permissions: ['member'],
                codes: {
                    activation: hex_md5( email ),
                    beta: code
                },
				cookies: {
					football: 0,
					basketball: 0,
					baseball: 0
				},
                created: new Date()
            };
                    
            model.createUser( user, function( user ) {
                                
                if (settings.web.env === 'live') {
                    mailer.send({
                        to: user.email,
                        from: settings.email.address.noreply,
                        subject: 'SleeperBot Account Activation',
                        body: 'Activate account: http://'+ settings.web.domain + '/auth/activate/' + user.codes.activation
                    });
                }
                
                var response = {
                    errors: 0
                };
                
                res.end( JSON.stringify(response) );
                
            });
        
        });
        
    }
});

/*  activation link
-------------------------------------------------*/
handler({
    url: '/auth/activate/:code',
    action: function(req, res) {
        var code = req.params.code;
        
        model.activateUser( code, function( user ){            
            var activated = true;
            if (user === null) activated = false;
            res.end( render('auth/activate.html',
                { title: 'SleeperBot | Account Activation', activated: activated, user:user }));
        });
        
    }
});


/*  beta application
-------------------------------------------------*/
handler({
    url: '/beta/apply',
    datatype: 'json',
    action: function(req, res) {
        
        var email = req.post.email,
            team = xss(req.post.team),
            occupation = xss(req.post.occupation);
                    
        /*  error validation
        -------------------------------------------------*/
        var errors = validate([
            {check: 'email', input:email, id:'#email', msg:'Invalid Email.'}
        ]);
        
        if ( errors.length > 0 ) {
            res.end( JSON.stringify({errors: errors}) );
            return;
        }
        
        /*  save the application if it's ok
        -------------------------------------------------*/
        var app = {
            email: email,
            team: team,
            occupation: occupation,
            created: new Date(),
            referral: hex_md5(email).substr(0, 5)
        };
                
        model.saveBetaApp( app, function( app ) {

            if (settings.web.env === 'live') {
                mailer.send({
                    to: app.email,
                    from: settings.email.address.noreply,
                    subject: 'SleeperBot Beta Application Received',
                    body: 'Thank you! We have received your beta application. There is no need to apply again.'
                });
            }
            
            var response = {
                errors: 0,
                app: app
            };
            res.end( JSON.stringify(response) );
        });
        
    }
});
