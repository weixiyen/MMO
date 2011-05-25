var db = require('../../lib/mongo').db,
    OID = require('../../lib/mongo').OID,
    mapper = require('../../lib/mongo').mapper;

this.saveTiersheet = function(data, callback) {
    db.insert('football_tiersheets', data, function(err, docs){
        var tier = docs[0];
        tier._id = OID(tier._id);
        if (callback) callback(tier);
    });
};

this.getMasterTiersheet = function(draft_type, callback) {

    db.findOne('football_tiersheets', {master:1, draft_type: draft_type}, {}, function(result){
        var tiersheet = result;
    
    db.find('nfl_teams', {}, {}, function(result){
        var teams = result;
    db.find('nfl_players', {active:1}, {}, function(result){
        var players = result;
        
        if (!tiersheet) {
            if (callback) callback( null );
            return;
        }
        
        tiersheet.tiers.qb = detailTiers(tiersheet.tiers.qb, players);
        tiersheet.tiers.rb = detailTiers(tiersheet.tiers.rb, players);
        tiersheet.tiers.wr = detailTiers(tiersheet.tiers.wr, players);
        tiersheet.tiers.te = detailTiers(tiersheet.tiers.te, players);
        tiersheet.tiers.pk = detailTiers(tiersheet.tiers.pk, players);
        tiersheet.tiers.def = detailTiers(tiersheet.tiers.def, teams);
        
        if (callback) callback( OID(tiersheet) );
    
    }); // END players
    }); // END teams
    }); // END tiersheet
        
};

this.getTiersheet = function(id, callback) {
    db.findOne('football_tiersheets', {'_id': OID(id)}, {}, function(result){
        var tiersheet = result;
    
    db.find('nfl_teams', {}, {}, function(result){
        var teams = result;
    db.find('nfl_players', {active:1}, {}, function(result){
        var players = result;
        
        if (!tiersheet) {
            if (callback) callback( null );
            return;
        }
        
        tiersheet.tiers.qb = detailTiers(tiersheet.tiers.qb, players);
        tiersheet.tiers.rb = detailTiers(tiersheet.tiers.rb, players);
        tiersheet.tiers.wr = detailTiers(tiersheet.tiers.wr, players);
        tiersheet.tiers.te = detailTiers(tiersheet.tiers.te, players);
        tiersheet.tiers.pk = detailTiers(tiersheet.tiers.pk, players);
        tiersheet.tiers.def = detailTiers(tiersheet.tiers.def, teams);
        
        if (callback) callback( OID(tiersheet) );
    
    }); // END players
    }); // END teams
    }); // END tiersheet
}


/* basketball
-------------------*/
this.saveBasketballTiersheet = function(data, callback) {
    db.insert('basketball_tiersheets', data, function(err, docs){
        var tier = docs[0];
        tier._id = OID(tier._id);
        if (callback) callback(tier);
    });
};

this.getBasketballMasterTiersheet = function(draft_type, callback) {
    db.findOne('basketball_tiersheets', {master:1, draft_type: draft_type}, {}, function(result){
        var tiersheet = result;
    
    db.find('nba_players', {active:1,team:{$ne:'FA'}}, {}, function(result){
        var players = result;

        if (!tiersheet) {
            if (callback) callback( null );
            return;
        }
        
        tiersheet.tiers.pg = detailTiers(tiersheet.tiers.pg, players);
        tiersheet.tiers.sg = detailTiers(tiersheet.tiers.sg, players);
        tiersheet.tiers.sf = detailTiers(tiersheet.tiers.sf, players);
        tiersheet.tiers.pf = detailTiers(tiersheet.tiers.pf, players);
        tiersheet.tiers.c = detailTiers(tiersheet.tiers.c, players);
        
        if (callback) callback( OID(tiersheet) );
    
    }); // END players
    }); // END tiersheet
        
};

this.getBasketballTiersheet = function(id, callback) {
    db.findOne('basketball_tiersheets', {'_id': OID(id)}, {}, function(result){
        var tiersheet = result;

    db.find('nba_players', {active:1}, {}, function(result){
        var players = result;
        
        if (!tiersheet) {
            if (callback) callback( null );
            return;
        }
        
        tiersheet.tiers.pg = detailTiers(tiersheet.tiers.pg, players);
        tiersheet.tiers.sg = detailTiers(tiersheet.tiers.sg, players);
        tiersheet.tiers.sf = detailTiers(tiersheet.tiers.sf, players);
        tiersheet.tiers.pf = detailTiers(tiersheet.tiers.pf, players);
        tiersheet.tiers.c = detailTiers(tiersheet.tiers.c, players);
        
        if (callback) callback( OID(tiersheet) );
    
    }); // END players
    }); // END tiersheet
}



function detailTiers(pos, list) {
    var len = pos.length,
        arr = [];
    for (var i=0; i < len; i+=1) {
        arr.push( mapper(pos[i], list) );
    }
    return arr;
}


/* baseball
-------------------*/
this.saveBaseballTiersheet = function(data, callback) {
    db.insert('baseball_tiersheets', data, function(err, docs){
        var tier = docs[0];
        tier._id = OID(tier._id);
        if (callback) callback(tier);
    });
};

this.getBaseballMasterTiersheet = function(draft_type, callback) {
    db.findOne('baseball_tiersheets', {master:1, draft_type: draft_type}, {}, function(result){
        var tiersheet = result;
    
    db.find('mlb_players', {active:1,team:{$ne:'FA'}}, {}, function(result){
        var players = result;

        if (!tiersheet) {
            if (callback) callback( null );
            return;
        }
        
        tiersheet.tiers.c = detailTiers(tiersheet.tiers.c, players);
        tiersheet.tiers.b1 = detailTiers(tiersheet.tiers.b1, players);
        tiersheet.tiers.b2 = detailTiers(tiersheet.tiers.b2, players);
        tiersheet.tiers.b3 = detailTiers(tiersheet.tiers.b3, players);
        tiersheet.tiers.ss = detailTiers(tiersheet.tiers.ss, players);
	tiersheet.tiers.lf = detailTiers(tiersheet.tiers.lf, players);
        tiersheet.tiers.rf = detailTiers(tiersheet.tiers.rf, players);
        tiersheet.tiers.cf = detailTiers(tiersheet.tiers.cf, players);
        tiersheet.tiers.of = detailTiers(tiersheet.tiers.of, players);
	tiersheet.tiers.sp = detailTiers(tiersheet.tiers.sp, players);
        tiersheet.tiers.rp = detailTiers(tiersheet.tiers.rp, players);
        
        if (callback) callback( OID(tiersheet) );
    
    }); // END players
    }); // END tiersheet
        
};

this.getBaseballTiersheet = function(id, callback) {
    db.findOne('baseball_tiersheets', {'_id': OID(id)}, {}, function(result){
        var tiersheet = result;

    db.find('mlb_players', {active:1}, {}, function(result){
        var players = result;
        
        if (!tiersheet) {
            if (callback) callback( null );
            return;
        }
        
        tiersheet.tiers.c = detailTiers(tiersheet.tiers.c, players);
        tiersheet.tiers.b1 = detailTiers(tiersheet.tiers.b1, players);
        tiersheet.tiers.b2 = detailTiers(tiersheet.tiers.b2, players);
        tiersheet.tiers.b3 = detailTiers(tiersheet.tiers.b3, players);
        tiersheet.tiers.ss = detailTiers(tiersheet.tiers.ss, players);
	tiersheet.tiers.lf = detailTiers(tiersheet.tiers.lf, players);
        tiersheet.tiers.rf = detailTiers(tiersheet.tiers.rf, players);
        tiersheet.tiers.cf = detailTiers(tiersheet.tiers.cf, players);
        tiersheet.tiers.of = detailTiers(tiersheet.tiers.of, players);
	tiersheet.tiers.sp = detailTiers(tiersheet.tiers.sp, players);
        tiersheet.tiers.rp = detailTiers(tiersheet.tiers.rp, players);
        
        if (callback) callback( OID(tiersheet) );
    
    }); // END players
    }); // END tiersheet
}

