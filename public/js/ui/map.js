(function() {
  MM.ui('map', function(opts) {
    var Map, ui_path;
    Map = (function() {
      function Map(options) {
        this.change = options.change;
        this.el = options.el;
        this.goTo(options.xcoord, options.ycoord);
      }
      Map.prototype.panStart = function(direction) {
        var el;
        el = this.el;
        if (direction === 'left') {
          $.loop.add('pan_map_left', function() {
            return el.css({
              left: MM.map.left += MM.map.change
            });
          });
        }
        if (direction === 'right') {
          $.loop.add('pan_map_right', function() {
            return el.css({
              left: MM.map.left -= MM.map.change
            });
          });
        }
        if (direction === 'up') {
          $.loop.add('pan_map_up', function() {
            return el.css({
              top: MM.map.top += MM.map.change
            });
          });
        }
        if (direction === 'down') {
          return $.loop.add('pan_map_down', function() {
            return el.css({
              top: MM.map.top -= MM.map.change
            });
          });
        }
      };
      Map.prototype.panStop = function(direction) {
        return $.loop.remove('pan_map_' + direction);
      };
      Map.prototype.setCoords = function(xcoord, ycoord) {
        this.left = xcoord * -1 + $(window).width() / 2;
        return this.top = ycoord * -1 + $(window).height() / 2;
      };
      Map.prototype.goTo = function(xcoord, ycoord) {
        this.setCoords(xcoord, ycoord);
        return this.el.css({
          left: this.left,
          top: this.top
        });
      };
      return Map;
    })();
    ui_path = 'maps/map_' + opts.map_id;
    MM.require(ui_path, 'css');
    return MM.run(function() {
      var data;
      MM.render(opts.el, ui_path);
      data = {
        el: opts.el,
        xcoord: 60,
        ycoord: 1400,
        change: 2
      };
      return MM.map = new Map(data);
    });
  });
}).call(this);
