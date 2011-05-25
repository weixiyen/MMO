var db = require('../lib/mongo').db,
    OID = require('../lib/mongo').OID,
    _ = require('../web/underscore')._;

// get all mlb players
setTimeout(function(){
    db.find('mlb_players', {active:1, team:{$ne:'FA'}}, {'sort':[['rank', 1]]}, function(players){
        generateTiersheet( players );
    }); // END
}, 2000);  

function generateTiersheet( players ) {
    
    // loop thru players assign to each tier
    var len = players.length,
        c=[], b1=[], b2=[], b3=[], ss=[], lf=[], rf=[], cf=[], of=[], dh=[], sp=[], rp=[];
        
    for (var i = 0; i < len; i += 1) {
        var player = players[i],
            pos = player.position;
            
        if (_.indexOf( pos, 'C' ) !== -1) c.push( player );
        if (_.indexOf( pos, '1B' ) !== -1) b1.push( player );
        if (_.indexOf( pos, '2B' ) !== -1) b2.push( player );
        if (_.indexOf( pos, '3B' ) !== -1) b3.push( player );
        if (_.indexOf( pos, 'SS' ) !== -1) ss.push( player );
        if (_.indexOf( pos, 'LF' ) !== -1) lf.push( player );
        if (_.indexOf( pos, 'RF' ) !== -1) rf.push( player );
        if (_.indexOf( pos, 'CF' ) !== -1) cf.push( player );
        if (_.indexOf( pos, 'OF' ) !== -1) of.push( player );
        if (_.indexOf( pos, 'DH' ) !== -1) dh.push( player );
        if (_.indexOf( pos, 'SP' ) !== -1) sp.push( player );
        if (_.indexOf( pos, 'RP' ) !== -1) rp.push( player );
    }
    
    var tiersheet = {
        tiers: {
            c: [], 
            b1: [],  
            b2: [],  
            b3: [],
	    ss: [], 
            lf: [],  
            rf: [],  
            cf: [],
	    of: [],  
            dh: [],  
            sp: [],   
            rp: []
        },
        master: 1,
        draft_type: 'h2h',
        email: 'admin@sleeperbot.com',
        name: 'SleeperBot 2011 Fantasy Baseball Tiersheet - H2H'
    }
    
    generateTier(tiersheet, 'c', c, 10);
    generateTier(tiersheet, 'b1', b1, 10);
    generateTier(tiersheet, 'b2', b2, 10);
    generateTier(tiersheet, 'b3', b3, 10);
    generateTier(tiersheet, 'ss', ss, 10);
    generateTier(tiersheet, 'lf', lf, 10);
    generateTier(tiersheet, 'rf', rf, 10);
    generateTier(tiersheet, 'cf', cf, 10);
    generateTier(tiersheet, 'of', of, 10);
    generateTier(tiersheet, 'dh', dh, 10);
    generateTier(tiersheet, 'sp', sp, 10);
    generateTier(tiersheet, 'rp', rp, 10);
    
    insertTiersheet(tiersheet);
}

function generateTier( tiersheet, pos, arr, max_tiers ) {
    for (var i=0; i < arr.length; i++) {
        var tier = i;
        if (i >= max_tiers ) {
            tier = max_tiers-1;
        } else {
            tiersheet.tiers[pos].push([]);
        }
        tiersheet.tiers[pos][tier].push( arr[i]._id );
    }
}

function insertTiersheet( tiersheet ){
    db.insert('baseball_tiersheets', tiersheet, function(err, docs){
        console.log('Added a tiersheet');
    });
}

