(function(UI){
    UI.dateFormat = function(date, mask) {
        var parsed_date = Date.parse( date.substr(0,19) ) || Date.parse( date.substr(0,24) );
        var gmt = parsed_date.getTime();
        var offset = (new Date()).getTimezoneOffset() * 60 * 1000;
        var localized_date = new Date(gmt - offset);
        return localized_date.format( mask );
    };
})(UI);