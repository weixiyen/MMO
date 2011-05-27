(function($) {
  $.loop = {
    _construct : function() {
      for(var i in $.loop.items) {
        $.loop.items[i]();
      }
    },
    int : 20,
    items : {},
    add : function(id, fn) {
      if($.isFunction(fn)) {
        $.loop.items[id] = fn;
      }
    },
    remove : function(id) { delete $.loop.items[id]; },
    stop : function() { clearInterval(loop); },
    start : function() { loop = setInterval($.loop._construct, $.loop.int); }
  };
  var loop = setInterval($.loop._construct, $.loop.int);
})(jQuery);