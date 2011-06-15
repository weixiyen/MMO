(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  MM.add('map', function(opts) {
    var Map, ui_path;
    Map = (function() {
      function Map(options) {
        this.change = options.change;
        this.$map = options.$map;
        this.$tileMap = options.$tileMap;
        this.tileSize = options.tileSize;
        this.halfTileSize = Math.floor(options.tileSize / 2);
        this.tileMap = options.tileMap;
        this.viewableTiles = {};
        this.collisionTypes = options.collisionTypes;
        this.dir = {
          N: 'n',
          E: 'e',
          S: 's',
          W: 'w'
        };
        this.setViewportInfo();
        this.goTo(options.xcoord, options.ycoord);
        this.startTileGenerator();
        this.generateCollisionGraph(this.tileMap);
      }
      Map.prototype.accessible = function(xcoord, ycoord) {
        var tileType;
        tileType = this.getTileType(xcoord, ycoord);
        if (tileType === false) {
          return false;
        }
        return -1 === $.inArray(tileType, this.collisionTypes);
      };
      Map.prototype.canShift = function(direction, xBound, yBound) {
        var newXcoord, newYcoord;
        newXcoord = this.xcoord;
        newYcoord = this.ycoord;
        xBound += this.change;
        yBound += this.change;
        if (direction === this.dir.W) {
          newXcoord -= xBound;
        } else if (direction === this.dir.E) {
          newXcoord += xBound;
        } else if (direction === this.dir.N) {
          newYcoord -= yBound;
        } else if (direction === this.dir.S) {
          newYcoord += yBound;
        }
        return this.accessible(newXcoord, newYcoord);
      };
      Map.prototype.completedPath = function(node1, node2) {
        var direction;
        direction = MM.user.getSimpleDirection(this.getDirection(node1, node2));
        if (direction === this.dir.W && this.xcoord <= node2[0]) {
          return true;
        } else if (direction === this.dir.E && this.xcoord >= node2[0]) {
          return true;
        } else if (direction === this.dir.N && this.ycoord <= node2[1]) {
          return true;
        } else if (direction === this.dir.S && this.ycoord >= node2[1]) {
          return true;
        }
        return false;
      };
      Map.prototype.generateCollisionGraph = function(tiles) {
        var collisionMap, collisionTypes, createRow, createTile, getAccessible, len, row, x, y, _i, _len;
        collisionMap = [];
        collisionTypes = this.collisionTypes;
        x = y = 0;
        len = tiles[0].length;
        getAccessible = function(type) {
          if (-1 === $.inArray(type, collisionTypes)) {
            return 0;
          } else {
            return 1;
          }
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
        return this.collisionGraph = $.astar.graph(collisionMap);
      };
      Map.prototype.generateTiles = function() {
        var k, left, mapHtml, newViewableTiles, purgeList, stub, tile, tileSize, top, v, x, x1, x2, x2max, y, y1, y2, y2max, _ref;
        tileSize = this.tileSize;
        mapHtml = [];
        purgeList = [];
        newViewableTiles = {};
        x2max = this.tileMap[0].length;
        y2max = this.tileMap.length;
        x1 = this.xcoord - this.viewportHalfWidth;
        y1 = this.ycoord - this.viewportHalfHeight;
        x2 = this.xcoord + this.viewportHalfWidth;
        y2 = this.ycoord + this.viewportHalfHeight;
        x1 = Math.floor(x1 / tileSize) - 3;
        y1 = Math.floor(y1 / tileSize) - 3;
        x2 = Math.floor(x2 / tileSize) + 3;
        y2 = Math.floor(y2 / tileSize) + 3;
        x1 = x1 < 0 ? 0 : x1;
        y1 = y1 < 0 ? 0 : y1;
        x2 = x2 > x2max ? x2max : x2;
        y2 = y2 > y2max ? y2max : y2;
        y = y1;
        while (y <= y2) {
          x = x1;
          while (x <= x2) {
            stub = 't_' + x + '_' + y;
            tile = this.tileMap[y][x];
            newViewableTiles[stub] = tile;
            if (!(this.viewableTiles[stub] != null)) {
              this.viewableTiles[stub] = tile;
              left = (x * tileSize) + 'px';
              top = (y * tileSize) + 'px';
              mapHtml.push('<div id="' + stub + '" class="tile type-' + tile + '" style="left:' + left + ';top:' + top + ';"></div>');
            }
            x++;
          }
          y++;
        }
        _ref = this.viewableTiles;
        for (k in _ref) {
          v = _ref[k];
          if (!(newViewableTiles[k] != null)) {
            delete this.viewableTiles[k];
            purgeList.push('#' + k);
          }
        }
        this.$tileMap.append(mapHtml.join(''));
        return $(purgeList.join(',')).remove();
      };
      Map.prototype.getCoordsByPos = function(left, top) {
        var xcoord, ycoord;
        xcoord = Math.floor(left / this.tileSize);
        ycoord = Math.floor(top / this.tileSize);
        return [xcoord, ycoord];
      };
      Map.prototype.getDirection = function(from, to) {
        var direction;
        direction = '';
        if (from[1] > to[1]) {
          direction += this.dir.N;
        } else if (from[1] < to[1]) {
          direction += this.dir.S;
        }
        if (from[0] > to[0]) {
          direction += this.dir.W;
        } else if (from[0] < to[0]) {
          direction += this.dir.E;
        }
        return direction;
      };
      Map.prototype.getPath = function(start, end) {
        var a, b, halfTileSize, html, left, node, nodepath, path, tileHtml, tileSize, top, x, y, _i, _len;
        a = this.collisionGraph.nodes[start[1]][start[0]];
        b = this.collisionGraph.nodes[end[1]][end[0]];
        path = $.astar.search(this.collisionGraph.nodes, a, b);
        nodepath = [];
        tileSize = this.tileSize;
        halfTileSize = this.halfTileSize;
        this.$tileMap.find('.path').remove();
        html = [];
        for (_i = 0, _len = path.length; _i < _len; _i++) {
          node = path[_i];
          left = node[0] * tileSize + 'px';
          top = node[1] * tileSize + 'px';
          tileHtml = '<div class="tile path" style="left:' + left + ';top:' + top + ';"></div>';
          html.push(tileHtml);
          x = node[0] * tileSize + halfTileSize;
          y = node[1] * tileSize + halfTileSize;
          nodepath.push([x, y]);
        }
        this.$tileMap.append(html.join(''));
        return nodepath;
      };
      Map.prototype.getTileType = function(xcoord, ycoord) {
        var x, y;
        x = Math.floor(xcoord / this.tileSize);
        y = Math.floor(ycoord / this.tileSize);
        if (void 0 === this.tileMap[y] || void 0 === this.tileMap[y][x]) {
          return false;
        }
        return this.tileMap[y][x];
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
        return $.loop.add(loopId, __bind(function() {
          if (this.canShift(direction, xBound, yBound)) {
            return map.css(this.shift(direction));
          }
        }, this));
      };
      Map.prototype.panStop = function(direction) {
        return $.loop.remove('pan_map_' + direction);
      };
      Map.prototype.setCoords = function(xcoord, ycoord) {
        this.xcoord = xcoord;
        this.ycoord = ycoord;
        this.left = xcoord * -1 + this.viewportHalfWidth;
        return this.top = ycoord * -1 + this.viewportHalfHeight;
      };
      Map.prototype.setViewportInfo = function() {
        this.viewportWidth = $(window).width();
        this.viewportHeight = $(window).height();
        this.viewportHalfWidth = parseInt(this.viewportWidth / 2, 10);
        return this.viewportHalfHeight = parseInt(this.viewportHeight / 2, 10);
      };
      Map.prototype.shift = function(direction) {
        var change, pos;
        change = this.change;
        if (MM.user.movingDiagonally()) {
          change -= 1;
        }
        if (direction === this.dir.W) {
          this.xcoord -= change;
          this.left += change;
        } else if (direction === this.dir.E) {
          this.xcoord += change;
          this.left -= change;
        } else if (direction === this.dir.N) {
          this.ycoord -= change;
          this.top += change;
        } else if (direction === this.dir.S) {
          this.ycoord += change;
          this.top -= change;
        }
        pos = {
          left: this.left,
          top: this.top
        };
        return pos;
      };
      Map.prototype.startTileGenerator = function() {
        this.generateTiles();
        return $.loop.add('map:tileGenerator', 40, __bind(function() {
          return this.generateTiles();
        }, this));
      };
      return Map;
    })();
    ui_path = 'maps/map_' + opts.map_id;
    MM.require(ui_path, 'css');
    return MM.run(function() {
      MM.render(opts.el, ui_path);
      MM.map = new Map({
        $map: opts.el,
        $tileMap: $('#ui-map-1'),
        xcoord: 700,
        ycoord: 650,
        change: 3,
        tileSize: 75,
        tileMap: [[0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5], [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5], [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5], [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5], [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5], [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5], [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5], [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5], [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5], [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5], [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5], [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5], [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5], [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5], [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5], [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5], [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5], [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5], [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]],
        collisionTypes: [99, 98]
      });
      return MM.map.$tileMap.delegate('.tile', 'click', function(e) {
        var left, tgt, top;
        tgt = $(e.target);
        left = parseInt(tgt.css('left'), 10);
        top = parseInt(tgt.css('top'), 10);
        return MM.user.runTo([left, top]);
      });
    });
  });
}).call(this);
