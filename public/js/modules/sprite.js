(function() {
  MM.add('sprite', function(opts) {
    var Sprite;
    Sprite = (function() {
      function Sprite() {}
      Sprite.prototype.start = function(id, opts, callback) {
        var el, len, queue, skip;
        id = 'mm-anim-' + id;
        el = opts.el;
        queue = opts.queue;
        len = queue.length;
        skip = opts.skip || 1;
        MM.global[id] = 0;
        $.loop.add(id, skip, function() {
          el.css({
            'background-position': queue[MM.global[id]]
          });
          if (MM.global[id] === len) {
            return MM.global[id] = 0;
          }
          return MM.global[id] += 1;
        });
        if (callback != null) {
          return this.callback(opts);
        }
      };
      Sprite.prototype.stop = function(id) {
        return $.loop.remove('mm-anim-' + id);
      };
      Sprite.prototype.once = function(options, callback) {};
      return Sprite;
    })();
    return MM.extend('sprite', new Sprite);
  });
}).call(this);
