(function() {
  MM.ui('map', function(opts) {
    var Map, ui_path;
    Map = (function() {
      function Map(options) {
        this.change = options.change;
        this.$map = options.$map;
        this.$tileMap = options.$tileMap;
        this.tileSize = options.tileSize;
        this.tileMap = options.tileMap;
        this.generateTiles();
        this.goTo(options.xcoord, options.ycoord);
        this.generateCollisionMap(options.tileMap, options.collisionTypes);
        this.userXBound = 12 + options.change;
        this.userYBound = 16 + options.change;
      }
      Map.prototype.accessible = function(xcoord, ycoord) {
        var tileSize, x, y;
        tileSize = this.tileSize;
        x = Math.floor(xcoord / this.tileSize);
        y = Math.floor(ycoord / this.tileSize);
        if (void 0 === this.collisionMap[y]) {
          return false;
        }
        return this.collisionMap[y][x];
      };
      Map.prototype.canShift = function(direction, xBound, yBound) {
        var newXcoord, newYcoord;
        newXcoord = this.xcoord;
        newYcoord = this.ycoord;
        xBound += this.change;
        yBound += this.change;
        if (direction === 'left') {
          newXcoord -= xBound;
        } else if (direction === 'right') {
          newXcoord += xBound;
        } else if (direction === 'up') {
          newYcoord -= yBound;
        } else if (direction === 'down') {
          newYcoord += yBound;
        }
        return this.accessible(newXcoord, newYcoord);
      };
      Map.prototype.generateCollisionMap = function(tiles, types) {
        var collisionMap, createRow, createTile, getAccessible, len, row, x, y, _i, _len;
        collisionMap = [];
        x = y = 0;
        len = tiles[0].length;
        getAccessible = function(type) {
          return -1 === $.inArray(type, types);
        };
        createRow = function(row) {
          var tile, _i, _len;
          collisionMap.push([]);
          for (_i = 0, _len = row.length; _i < _len; _i++) {
            tile = row[_i];
            createTile(tile);
          }
          return y += 1;
        };
        createTile = function(tile) {
          collisionMap[y][x] = getAccessible(tile);
          x += 1;
          if (x === len) {
            return x = 0;
          }
        };
        for (_i = 0, _len = tiles.length; _i < _len; _i++) {
          row = tiles[_i];
          createRow(row);
        }
        return this.collisionMap = collisionMap;
      };
      Map.prototype.generateTiles = function() {
        var createTile, len, mapHtml, processRow, row, tileSize, tiles, x, y, _i, _len;
        tileSize = this.tileSize;
        tiles = this.tileMap;
        mapHtml = [];
        x = y = 0;
        len = tiles[0].length;
        processRow = function(row) {
          var tile, _i, _len;
          for (_i = 0, _len = row.length; _i < _len; _i++) {
            tile = row[_i];
            createTile(tile);
          }
          return y += 1;
        };
        createTile = function(tile) {
          var left, tileHtml, top;
          left = (x * tileSize) + 'px';
          top = (y * tileSize) + 'px';
          tileHtml = '<div class="tile type-' + tile + '" style="left:' + left + ';top:' + top + ';"></div>';
          mapHtml.push(tileHtml);
          x += 1;
          if (x === len) {
            return x = 0;
          }
        };
        for (_i = 0, _len = tiles.length; _i < _len; _i++) {
          row = tiles[_i];
          processRow(row);
        }
        return this.$tileMap.html(mapHtml.join(''));
      };
      Map.prototype.goTo = function(xcoord, ycoord) {
        this.setCoords(xcoord, ycoord);
        return this.$map.css({
          left: this.left,
          top: this.top
        });
      };
      Map.prototype.panStart = function(direction, xBound, yBound) {
        var loopId, map;
        if (xBound == null) {
          xBound = 0;
        }
        if (yBound == null) {
          yBound = 0;
        }
        map = this.$map;
        loopId = 'pan_map_' + direction;
        return $.loop.add(loopId, function() {
          if (MM.map.canShift(direction, xBound, yBound)) {
            return map.css(MM.map.shift(direction));
          }
        });
      };
      Map.prototype.panStop = function(direction) {
        return $.loop.remove('pan_map_' + direction);
      };
      Map.prototype.setCoords = function(xcoord, ycoord) {
        this.xcoord = xcoord;
        this.ycoord = ycoord;
        this.left = xcoord * -1 + $(window).width() / 2;
        return this.top = ycoord * -1 + $(window).height() / 2;
      };
      Map.prototype.shift = function(direction) {
        var change, pos;
        change = this.change;
        if (direction === 'left') {
          this.xcoord -= change;
          this.left += change;
        } else if (direction === 'right') {
          this.xcoord += change;
          this.left -= change;
        } else if (direction === 'up') {
          this.ycoord -= change;
          this.top += change;
        } else if (direction === 'down') {
          this.ycoord += change;
          this.top -= change;
        }
        pos = {
          left: this.left,
          top: this.top
        };
        return pos;
      };
      return Map;
    })();
    ui_path = 'maps/map_' + opts.map_id;
    MM.require(ui_path, 'css');
    return MM.run(function() {
      MM.render(opts.el, ui_path);
      return MM.map = new Map({
        $map: opts.el,
        $tileMap: $('#ui-map-1'),
        xcoord: 0,
        ycoord: 0,
        change: 3,
        tileSize: 50,
        tileMap: [[0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5], [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5], [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5], [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5]],
        collisionTypes: [99, 98]
      });
    });
  });
}).call(this);
