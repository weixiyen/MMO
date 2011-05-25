var db = require('../lib/mongo').db,
    OID = require('../lib/mongo').OID,
    _ = require('../web/underscore')._;

// get all nba players
setTimeout(function(){
    db.find('nba_players', {active:1, team:{$ne:'FA'}}, {'sort':[['rank', 1]]}, function(players){
        generateTiersheet( players );
    }); // END
}, 2000);  

function generateTiersheet( players ) {
    
    // loop thru players assign to each tier
    var len = players.length,
        pg=[], sg=[], sf=[], pf=[], c=[];
        
    for (var i = 0; i < len; i += 1) {
        var player = players[i],
            pos = player.position;
            
        if (_.indexOf( pos, 'PG' ) !== -1) pg.push( player );
        if (_.indexOf( pos, 'SG' ) !== -1) sg.push( player );
        if (_.indexOf( pos, 'SF' ) !== -1) sf.push( player );
        if (_.indexOf( pos, 'PF' ) !== -1) pf.push( player );
        if (_.indexOf( pos, 'C' ) !== -1) c.push( player );
    }
    
    var tiersheet = {
        tiers: {
            pg: [], 
            sg: [],  
            sf: [],  
            pf: [],  
            c: []
        },
        master: 1,
        draft_type: 'h2h',
        email: 'admin@sleeperbot.com',
        name: 'SleeperBot 2010 Fantasy Basketball Tiersheet - H2H'
    }
    
    generateTier(tiersheet, 'pg', pg, 10);
    generateTier(tiersheet, 'sg', sg, 10);
    generateTier(tiersheet, 'sf', sf, 10);
    generateTier(tiersheet, 'pf', pf, 10);
    generateTier(tiersheet, 'c', c, 10);
    
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
    db.populate('basketball_tiersheets', tiersheet, function(err, docs){
        console.log('Added a tiersheet');
    });
}