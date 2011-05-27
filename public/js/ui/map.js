(function() {
  MM.ui('map', function(opts) {
    var Map, ui_path;
    Map = (function() {
      function Map(el) {
        this.el = el;
        this.top = 0;
        this.left = 0;
        this.change = 2;
      }
      Map.prototype.panStart = function(direction) {
        if (direction === 'left') {
          $.loop.add('pan_map_left', function() {
            return MM.map.el.css({
              left: MM.map.left += MM.map.change
            });
          });
        }
        if (direction === 'right') {
          $.loop.add('pan_map_right', function() {
            return MM.map.el.css({
              left: MM.map.left -= MM.map.change
            });
          });
        }
        if (direction === 'up') {
          $.loop.add('pan_map_up', function() {
            return MM.map.el.css({
              top: MM.map.top += MM.map.change
            });
          });
        }
        if (direction === 'down') {
          return $.loop.add('pan_map_down', function() {
            return MM.map.el.css({
              top: MM.map.top -= MM.map.change
            });
          });
        }
      };
      Map.prototype.panStop = function(direction) {
        var handle;
        handle = 'pan_map_' + direction;
        return $.loop.remove(handle);
      };
      return Map;
    })();
    ui_path = 'maps/map_' + opts.map_id;
    MM.require(ui_path, 'css');
    return MM.run(function() {
      MM.render(opts.el, ui_path);
      return MM.map = new Map(opts.el);
    });
  });
}).call(this);
