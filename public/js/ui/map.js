(function() {
  MM.ui('map', function(opts) {
    var Map, ui_path;
    Map = (function() {
      function Map(el) {
        this.el = el;
        this.top = 0;
        this.left = 0;
        this.tick = 50;
      }
      Map.prototype.pan = function(direction) {
        var properties;
        if (direction === 'left') {
          this.left += this.tick;
        }
        if (direction === 'right') {
          this.left -= this.tick;
        }
        if (direction === 'up') {
          this.top += this.tick;
        }
        if (direction === 'down') {
          this.top -= this.tick;
        }
        properties = {
          left: this.left,
          top: this.top
        };
        return this.el.animate(properties, {
          queue: false,
          easing: false
        });
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
