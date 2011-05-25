var handler = require('../../web/handler').addHandler,
    render = require('../../web/template').render,
    validate = require('../../lib/validate').validate,
    xss = require('../../lib/validate').xss,
    tiersToOid = require('./helpers').tiersToOid,
    model = require('./model'),
    settings = require('../../settings'),
    mailer = require('../../lib/mailer'),
    serve = require('../../web/serve');

/*  football tiersheet handlers
-------------------------------------------------*/
handler({
    url: '/football/tools/tiersheet/:id',
    action: function(req, res) {
        var id = req.params.id,
            draft_type = id === 'ppr' ? 'ppr' : 'standard';
            
        model.getTiersheet( id, function( tiersheet ){
            
            if (tiersheet === null) {
                model.getMasterTiersheet( draft_type, function( tiersheet ){
                    
                    if (tiersheet === null) {
                        serve.show500(res, 'error');
                        return;
                    }
                    
                    res.end( render('football/tools/tiersheet.html',
                        { title: 'SleeperBot | Fantasy Football Cheat Sheets | Tier Sheets', tiersheet: tiersheet }));
                    
                });
                return;
            }
            
            res.end( render('football/tools/tiersheet.html',
                { title: 'SleeperBot | Fantasy Football Cheat Sheets | Tier Sheets', tiersheet: tiersheet }));
        });
        
    }
});

handler({
    url: '/football/tools/tiersheet/save',
    dataType: 'json',
    action: function(req, res) {
        
        var name = req.post.name,
            email = req.post.email,
            draft_type = req.post.draft_type,
            qb = JSON.parse(req.post.qb),
            rb = JSON.parse(req.post.rb),
            wr = JSON.parse(req.post.wr),
            te = JSON.parse(req.post.te),
            pk = JSON.parse(req.post.pk),
            def = JSON.parse(req.post.def);
        
        /*  error validation
        -------------------------------------------------*/
        var errors = validate([
            {check:'alphanum', input:name, id:'#name', msg:'Tiersheet name can only contain letters and numbers.'},
            {check:'email', input:email, id:'#email', msg:'Invalid Email.'},
            {check:'alpha', input:draft_type, id:'#draft-type', msg:'haxx?'}
        ]);
        
        if ( errors.length > 0 ) {
            res.end( JSON.stringify({errors: errors}) );
            return;
        }
        
        /*  save the sheet if it's ok
        -------------------------------------------------*/
        var tiersheet = {
            name: name,
            email: email,
            draft_type: draft_type,
            tiers: {
                qb: tiersToOid( qb ),
                rb: tiersToOid( rb ),
                wr: tiersToOid( wr ),
                te: tiersToOid( te ),
                pk: tiersToOid( pk ),
                def: tiersToOid( def )
            }
        };
                
        model.saveTiersheet( tiersheet, function( tiersheet ) {
            var id = tiersheet._id,
                permalink = 'http://' + settings.web.domain + '/football/tools/tiersheet/' + id;
            
            if (settings.web.env === 'live') {
                mailer.send({
                    to: tiersheet.email,
                    from: settings.email.address.noreply,
                    subject: 'SleeperBot Fantasy Football Tiersheet - ' + tiersheet.name,
                    body: 'Your Tiersheet Permalink: ' + permalink
                });
            }
            
            var response = {
                errors: 0,
                tiersheet: tiersheet
            };
            res.end( JSON.stringify(response) );
        });
    }
});








/*  basketball tiersheet handlers
-------------------------------------------------*/
handler({
    url: '/basketball/tools/tiersheet/:id',
    action: function(req, res) {
        var id = req.params.id,
            draft_type = id === 'roto' ? 'roto' : 'h2h';
        
        model.getBasketballTiersheet( id, function( tiersheet ){
            
            if (tiersheet === null) {
                model.getBasketballMasterTiersheet( draft_type, function( tiersheet ){
                    
                    if (tiersheet === null) {
                        serve.show500(res, 'error');
                        return;
                    }
                    
                    res.end( render('basketball/tools/tiersheet.html',
                        { title: 'SleeperBot | Fantasy Basketball Cheat Sheets | Tier Sheets', tiersheet: tiersheet }));
                    
                });
                return;
            }
            
            res.end( render('basketball/tools/tiersheet.html',
                { title: 'SleeperBot | Fantasy Basketball Cheat Sheets | Tier Sheets', tiersheet: tiersheet }));
        });
        
    }
});

handler({
    url: '/basketball/tools/tiersheet/save',
    dataType: 'json',
    action: function(req, res) {
        
        var name = req.post.name,
            email = req.post.email,
            draft_type = req.post.draft_type,
            pg = JSON.parse(req.post.pg),
            sg = JSON.parse(req.post.sg),
            sf = JSON.parse(req.post.sf),
            pf = JSON.parse(req.post.pf),
            c = JSON.parse(req.post.c);
        
        /*  error validation
        -------------------------------------------------*/
        var errors = validate([
            {check:'alphanum', input:name, id:'#name', msg:'Tiersheet name can only contain letters and numbers.'},
            {check:'email', input:email, id:'#email', msg:'Invalid Email.'},
            {check:'alphanum', input:draft_type, id:'#draft-type', msg:'haxx?'}
        ]);
        
        if ( errors.length > 0 ) {
            res.end( JSON.stringify({errors: errors}) );
            return;
        }
        
        /*  save the sheet if it's ok
        -------------------------------------------------*/
        var tiersheet = {
            name: name,
            email: email,
            draft_type: draft_type,
            tiers: {
                pg: tiersToOid( pg ),
                sg: tiersToOid( sg ),
                sf: tiersToOid( sf ),
                pf: tiersToOid( pf ),
                c: tiersToOid( c )
            }
        };
                
        model.saveBasketballTiersheet( tiersheet, function( tiersheet ) {
            var id = tiersheet._id,
                permalink = 'http://' + settings.web.domain + '/basketball/tools/tiersheet/' + id;
            
            if (settings.web.env === 'live') {
                mailer.send({
                    to: tiersheet.email,
                    from: settings.email.address.noreply,
                    subject: 'SleeperBot Fantasy Basketball Tiersheet - ' + tiersheet.name,
                    body: 'Your Tiersheet Permalink: ' + permalink
                });
            }
            
            var response = {
                errors: 0,
                tiersheet: tiersheet
            };
            res.end( JSON.stringify(response) );
        });
    }
});






/*  baseball tiersheet handlers
-------------------------------------------------*/
handler({
    url: '/baseball/tools/tiersheet/:id',
    action: function(req, res) {
        var id = req.params.id,
            draft_type = id === 'roto' ? 'roto' : 'h2h';
        
        model.getBaseballTiersheet( id, function( tiersheet ){
            
            if (tiersheet === null) {
                model.getBaseballMasterTiersheet( draft_type, function( tiersheet ){
                    
                    if (tiersheet === null) {
                        serve.show500(res, 'error');
                        return;
                    }
                    
                    res.end( render('baseball/tools/tiersheet.html',
                        { title: 'SleeperBot | Fantasy Baseball Cheat Sheets | Tier Sheets', tiersheet: tiersheet }));
                    
                });
                return;
            }
            
            res.end( render('baseball/tools/tiersheet.html',
                { title: 'SleeperBot | Fantasy Baseball Cheat Sheets | Tier Sheets', tiersheet: tiersheet }));
        });
        
    }
});

handler({
    url: '/baseball/tools/tiersheet/save',
    dataType: 'json',
    action: function(req, res) {
        
        var name = req.post.name,
            email = req.post.email,
            draft_type = req.post.draft_type,
            c = JSON.parse(req.post.c),
            b1 = JSON.parse(req.post.b1),
            b2 = JSON.parse(req.post.b2),
            b3 = JSON.parse(req.post.b3),
            ss = JSON.parse(req.post.ss);
	    lf = JSON.parse(req.post.lf),
            rf = JSON.parse(req.post.rf),
            cf = JSON.parse(req.post.cf),
            of = JSON.parse(req.post.of),
	    sp = JSON.parse(req.post.sp),
            rp = JSON.parse(req.post.rp);
        
        /*  error validation
        -------------------------------------------------*/
        var errors = validate([
            {check:'alphanum', input:name, id:'#name', msg:'Tiersheet name can only contain letters and numbers.'},
            {check:'email', input:email, id:'#email', msg:'Invalid Email.'},
            {check:'alphanum', input:draft_type, id:'#draft-type', msg:'haxx?'}
        ]);
        
        if ( errors.length > 0 ) {
            res.end( JSON.stringify({errors: errors}) );
            return;
        }
        
        /*  save the sheet if it's ok
        -------------------------------------------------*/
        var tiersheet = {
            name: name,
            email: email,
            draft_type: draft_type,
            tiers: {
                c: tiersToOid( c ),
                b1: tiersToOid( b1 ),
                b2: tiersToOid( b2 ),
                b3: tiersToOid( b3 ),
		ss: tiersToOid( ss ),
                lf: tiersToOid( lf ),
                rf: tiersToOid( rf ),
                cf: tiersToOid( cf ),
		of: tiersToOid( of ),
                sp: tiersToOid( sp ),
                rp: tiersToOid( rp )            }
        };
                
        model.saveBaseballTiersheet( tiersheet, function( tiersheet ) {
            var id = tiersheet._id,
                permalink = 'http://' + settings.web.domain + '/baseball/tools/tiersheet/' + id;
            
            if (settings.web.env === 'live') {
                mailer.send({
                    to: tiersheet.email,
                    from: settings.email.address.noreply,
                    subject: 'SleeperBot Fantasy Basketball Tiersheet - ' + tiersheet.name,
                    body: 'Your Tiersheet Permalink: ' + permalink
                });
            }
            
            var response = {
                errors: 0,
                tiersheet: tiersheet
            };
            res.end( JSON.stringify(response) );
        });
    }
});
