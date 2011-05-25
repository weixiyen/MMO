var db = require('../lib/mongo').db,
    DBRef = require('../lib/mongo').DBRef;

db.open(function(){
    db.find('nfl_players', {position:'QB', active:1}, {}, function(result){
        var qb = result;
    
    db.find('nfl_players', {position:'RB', active:1}, {}, function(result){
        var rb = result;
    
    db.find('nfl_players', {position:'WR', active:1}, {}, function(result){
        var wr = result;
    
    db.find('nfl_players', {position:'TE', active:1}, {}, function(result){
        var te = result;
    
    db.find('nfl_players', {position:'PK', active:1}, {}, function(result){
        var pk = result;
    
    db.find('nfl_teams', {}, {'sort':[['team', 1]]}, function(result){
        
        var def = result;
        generateTiersheet( qb, rb, wr, te, pk, def);
        
    }); // END team
    }); // END pk 
    }); // END te
    }); // END wr
    }); // END rb
    }); // END qb
});  

function generateTiersheet( qb, rb, wr, te, pk, def ) {
    
    var tiersheet = {
        tiers: {
            qb: [],  // 8
            rb: [],  // 10
            wr: [],  // 10
            te: [],  // 5
            pk: [],   // 5
            def: []  // 5
        },
        master: 1,
        draft_type: 'standard',
        email: 'admin@sleeperbot.com',
        name: 'SleeperBot'
    }
    
    generateTier(tiersheet, 'qb', qb, 8);
    generateTier(tiersheet, 'rb', rb, 10);
    generateTier(tiersheet, 'wr', wr, 10);
    generateTier(tiersheet, 'te', te, 5);
    generateTier(tiersheet, 'pk', pk, 5);
    generateTier(tiersheet, 'def', def, 5);
    
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
        tiersheet.tiers[pos][tier].push( DBRef('nfl_players', arr[i]._id) );
    }
}

function insertTiersheet( tiersheet ){
    db.populate('football_tiersheets', tiersheet, function(err, docs){
        console.log('Added a tiersheet');
        db.close();
    });
}