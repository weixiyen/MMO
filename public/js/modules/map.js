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
        this.generateTiles();
        this.goTo(options.xcoord, options.ycoord);
        this.collisionTypes = options.collisionTypes;
        this.generateCollisionGraph(this.tileMap);
        this.dir = {
          N: 'n',
          E: 'e',
          S: 's',
          W: 'w',
          NE: 'ne',
          NW: 'nw',
          SE: 'se',
          SW: 'sw'
        };
      }
      Map.prototype.accessible = function(xcoord, ycoord) {
        var tileType;
        tileType = this.getTileType(xcoord, ycoord);
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
        this.left = xcoord * -1 + $(window).width() / 2;
        return this.top = ycoord * -1 + $(window).height() / 2;
      };
      Map.prototype.shift = function(direction) {
        var change, pos;
        change = this.change;
        if (MM.user.movingDiagonally()) {
          change = 2;
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
        if (direction === this.dir.NW) {
          this.xcoord -= change;
          this.left += change;
          this.ycoord -= change;
          this.top += change;
        } else if (direction === this.dir.NE) {
          this.ycoord -= change;
          this.top += change;
          this.xcoord += change;
          this.left -= change;
        } else if (direction === this.dir.SW) {
          this.ycoord += change;
          this.top -= change;
          this.xcoord -= change;
          this.left += change;
        } else if (direction === this.dir.SE) {
          this.ycoord += change;
          this.top -= change;
          this.xcoord += change;
          this.left -= change;
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
