/*
  jQuery.loop is an enhanced version of the original jQuery.timers plugin
  
  Example 1:
    $.loop.add( 'myCustomId' , function() {
      // I run once every second
    });
    
    // now let's stop execution of the previous loop
    $.loop.remove( 'myCustomId' );
  
  Example 2:
    // set the interval to every 40 milliseconds
    $.loop.setInterval( 40 );
    
    $.loop.add( 'spriteMoveLeft', function(){
      // I run every 40 milliseconds
    });
    
    $.loop.add( 'panMapLeft', 3, function(){
      
      // notice the 2nd parameter "3"
      // this means I run every 3 intervals (aka ticks)
      // I run every 120 milleseconds
    
    });
*/
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
    remove : function(id) { try{ delete $.loop.items[id]; } catch(e) {} },
    stop : function() { clearInterval(loop); },
    start : function() { loop = setInterval($.loop._construct, $.loop.int); }
  };
  loop = setInterval($.loop._construct, $.loop.int);
})(jQuery);