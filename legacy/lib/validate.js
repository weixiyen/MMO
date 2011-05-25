var _ = require('../web/underscore')._;

var valid = {
    alphanum: function( input ) {
        if ( input.match(/[0-9a-zA-Z' ']/) ) return true;
        return false;
    },
    alpha: function( input ) {
        if ( input.match(/[a-zA-Z' ']/) ) return true;
        return false;
    },
    email: function( input ) {
        if ( input.match(/^[^@]+@[^@]+.[a-z]{2,}$/i) ) return true;
        return false;
    },
    exists: function( input ) {
        if (input.replace(' ','').length > 0) return true;
        return false;
    },
    matches: function( input ) {
        if ( input[0] === input[1] ) return true;
        return false;
    },
    nospaces: function( input ) {
        if ( !input.match(' ') ) return true;
        return false;
    },
    betacode: function( input ) {
        if ( input.match('kickoff') || input.match('tipoff') ) return true;
        return false;
    }
}

var validate = function( data ) {
    var errors = [];
    
    _.each(data, function(field){
        var is_valid = valid[ field.check ]( field.input );
        if ( is_valid === false ) {
            errors.push({
                id: field.id,
                msg: field.msg
            });
        }
    });
    
    return errors;
};

var xss = function( input ) {
    return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

this.validate = validate;
this.xss = xss;