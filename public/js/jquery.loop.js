(function($) {
  var loop;
  $.loop = {
    count: 0,
    _construct : function() {
      if (($.loop.count += 1) > 9999999) {
        $.loop.count = 0;
      }
      var items = $.loop.items;
      for(var i in items) {
        items[i]();
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
  loop = setInterval($.loop._construct, $.loop.int);
})(jQuery);