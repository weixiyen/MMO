var db = require('../lib/mongo').db;

var nfl_teams = [
    // AFC EAST
    {name:'Bills', city:'Buffalo', abbr: 'BUF', division:'AFC East', bye: 6},
    {name:'Dolphins', city:'Miami', abbr: 'MIA', division:'AFC East', bye: 5},
    {name:'Patriots', city:'New England', abbr: 'NWE', division:'AFC East', bye: 5},
    {name:'Jets', city:'New York', abbr: 'NYJ', division:'AFC East', bye: 7},
    
    // NFC NORTH
    {name:'Ravens', city:'Baltimore', abbr: 'BAL', division:'AFC North', bye: 8},
    {name:'Bengals', city:'Cincinnati', abbr: 'CIN', division:'AFC North', bye: 6},
    {name:'Browns', city:'Cleveland', abbr: 'CLE', division:'AFC North', bye: 8},
    {name:'Steelers', city:'Pittsburgh', abbr: 'PIT', division:'AFC North', bye: 5},
    
    // NFC SOUTH
    {name:'Texans', city:'Houston', abbr: 'HOU', division:'AFC South', bye: 7},
    {name:'Colts', city:'Indianapolis', abbr: 'IND', division:'AFC South', bye: 7},
    {name:'Jaguars', city:'Jacksonville', abbr: 'JAC', division:'AFC South', bye: 9},
    {name:'Titans', city:'Tennessee', abbr: 'TEN', division:'AFC South', bye: 9},
    
    // NFC WEST
    {name:'Broncos', city:'Denver', abbr: 'DEN', division:'AFC West', bye: 9},
    {name:'Chiefs', city:'Kansas City', abbr: 'KC', division:'AFC West', bye: 4},
    {name:'Raiders', city:'Oakland', abbr: 'OAK', division:'AFC West', bye: 10},
    {name:'Chargers', city:'San Diego', abbr: 'SD', division:'AFC West', bye: 10},
    
    // NFC EAST
    {name:'Cowboys', city:'Dallas', abbr: 'DAL', division:'NFC East', bye: 4},
    {name:'Giants', city:'New York', abbr: 'NYG', division:'NFC East', bye: 8},
    {name:'Eagles', city:'Philadelphia', abbr: 'PHI', division:'NFC East', bye: 8},
    {name:'Redskins', city:'Washington', abbr: 'WAS', division:'NFC East', bye: 9},
    
    // NFC NORTH
    {name:'Bears', city:'Chicago', abbr: 'CHI', division:'NFC North', bye: 8},
    {name:'Lions', city:'Detroit', abbr: 'DET', division:'NFC North', bye: 7},
    {name:'Packers', city:'Green Bay', abbr: 'GB', division:'NFC North', bye: 10},
    {name:'Vikings', city:'Minnesota', abbr: 'MIN', division:'NFC North', bye: 4},
    
    // NFC SOUTH
    {name:'Falcons', city:'Atlanta', abbr: 'ATL', division:'NFC South', bye: 8},
    {name:'Panthers', city:'Carolina', abbr: 'CAR', division:'NFC South', bye: 6},
    {name:'Saints', city:'New Orleans', abbr: 'NO', division:'NFC South', bye: 10},
    {name:'Buccaneers', city:'Tampa Bay', abbr: 'TB', division:'NFC South', bye: 4},
    
    // NFC WEST
    {name:'Cardinals', city:'Arizona', abbr: 'ARI', division:'NFC West', bye: 6},
    {name:'Rams', city:'St. Louis', abbr: 'STL', division:'NFC West', bye: 9},
    {name:'49ers', city:'San Francisco', abbr: 'SF', division:'NFC West', bye: 9},
    {name:'Seahawks', city:'Seattle', abbr: 'SEA', division:'NFC West', bye: 5}
];

db.open(function(){
  db.populate('nfl_teams', nfl_teams, function(err, docs){
    console.log('Cleared and added ' + docs.length + ' NFL teams');
    db.close();
  });
});