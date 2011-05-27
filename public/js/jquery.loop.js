(function($) {
  $.loop = {
    count: 0,
    _construct : function() {
      if (($.loop.count += 1) > 9999999) {
        $.loop.count = 0;
      }
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