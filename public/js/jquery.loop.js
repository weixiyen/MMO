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
        if (0 === ($.loop.count % items[i].skip) ) {
          items[i].fn();
        }
      }
    },
    int : 1000,
    setInterval: function(interval) {
      $.loop.int = interval;
      $.loop.stop();
      $.loop.start();
    },
    items : {},
    add : function(id, skip, fn) {
      $.loop.items[id] = {};
      if($.isFunction(skip)) {
        fn = skip;
        skip = 1;
      }
      $.loop.items[id].skip = skip;
      $.loop.items[id].fn = fn;
    },
    remove : function(id) { delete $.loop.items[id]; },
    stop : function() { clearInterval(loop); },
    start : function() { loop = setInterval($.loop._construct, $.loop.int); }
  };
  loop = setInterval($.loop._construct, $.loop.int);
})(jQuery);