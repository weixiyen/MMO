var settings = require('../settings').mongo,
    Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    ObjectID = require('mongodb').ObjectID,
    DBRef = require('mongodb').DBRef,
    db = new Db(settings.dbname, new Server( settings.host, settings.port, settings.options ), {native_parser:true});

var self = this;
self.db = {};

db.open(function(err, db){
    self.db.populate = function(collection, data, callback){
        db.dropCollection(collection, function(err, result) {
            db.createCollection(collection, function(err, collection) {                
                collection.insert(data, function(err, docs) {
                    if (callback) callback(err, docs);
                });
            });
        });
    };
    self.db.insert = function(collection, data, callback){
        db.collection(collection, function(err, collection) {
            collection.insert(data, function(err, docs){
                if (callback) callback(err, docs); 
            });
        });
    };
    self.db.find = function(collection, query, opts, callback) {
        db.collection(collection, function(err, collection) {
            collection.find(query, opts, function(err, cursor){
                cursor.toArray(function(err, docs) {
                    if (callback) callback(docs);
                });
            }); 
        });
    };
    self.db.findOne = function(collection, query, opts, callback) {
        db.collection(collection, function(err, collection) {
            collection.findOne(query, opts, function(err, doc){
                if (callback) callback(doc);
            });
        });
    };
    self.db.count = function(collection, query, callback) {
        db.collection(collection, function(err, collection) {
            collection.count(query, function(err, count){
                if (callback) callback(count);
            }); 
        });
    };
    self.db.save = function(collection, doc, opts, callback) {
        db.collection(collection, function(err, collection) {
            collection.save(doc, opts, function(err, result) {
                if (callback) callback(result); 
            });
        });
    };
    self.db.update = function(collection, query, opts, callback) {
        db.collection(collection, function(err, collection) {
            collection.update(query, opts, function(err, result) {
                if (callback) callback(result); 
            });
        });
    };
});

var OID = function( id ){
    if (typeof id === 'string') {
        return new ObjectID( id );
    } else if (id) {
        return JSON.parse( JSON.stringify(id) );
    } else {
        return new ObjectID();
    }
};

var ArrayToOID = function( arr ) {
    var len = arr.length,
        oid_arr = [];
    for (var i=0; i<len; i+=1) {
        var item = arr[i];
        oid_arr.push( new ObjectID(item) );
    }
    return oid_arr;
}

var DBRefArray = function( collection_name, id_arr ) {
    var arr = [],
        len = id_arr.length;
        
    for (var i=0; i < len; i+=1) {
        var id = id_arr[ i ];
        arr.push( DBREF(collection_name, OID(id)) );
    }
    
    return arr;
};

var DBREF = function( collection_name, oid ){
    return new DBRef( collection_name, oid );
};

var DBREF_MAPPER = function( items, list ) {
    var arr = [],
        len = items.length,
        list_len = list.length;
    
    for (var i=0; i < len; i+=1) {
        var item = items[i];
        for (var j=0; j < list_len; j+= 1) {
            var list_item = list[j];
            if (!item.oid || !list_item._id) break;
            if ( item.oid.id === list_item._id.id ) {
                arr.push( list_item );
                break;
            }
        }
    }
    
    return arr;
};

var MAPPER = function( items, list ) {
    var arr = [],
        len = items.length,
        list_len = list.length;
    
    for (var i=0; i < len; i+=1) {
        var item = items[i];
        for (var j=0; j < list_len; j+= 1) {
            var list_item = list[j];
            if (!item || !list_item._id) break;
            if ( item.id === list_item._id.id ) {
                arr.push( list_item );
                break;
            }
        }
    }
    
    return arr;
};

this.dbref_mapper = DBREF_MAPPER;
this.mapper = MAPPER;
this.OID = OID;
this.arrayToOid = ArrayToOID;
this.DBRefArray = DBRefArray;
this.DBRef = DBREF;