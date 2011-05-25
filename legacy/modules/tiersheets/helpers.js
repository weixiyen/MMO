var arrayToOid = require('../../lib/mongo').arrayToOid;

var tiersToOid = function(pos) {
    var arr = [],
        len = pos.length;
    
    for (var i=0; i<len; i+=1){
        arr.push( arrayToOid( pos[i] ) );
    }

    return arr;
};

this.tiersToOid = tiersToOid;