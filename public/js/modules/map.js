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
        this.NPC = options.NPC;
        this.Player = options.Player;
        this.npcs = {};
        this.players = {};
        this.unitStub = 'unit-';
        this.pos = [options.xcoord, options.ycoord];
        this.setViewportInfo();
        this.goTo(this.pos[0], this.pos[1]);
        this.startUIGenerator();
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
      Map.prototype.addNpc = function(data) {
        var tag;
        tag = this.unitStub + data.id;
        data.el = $('<div id="' + tag + '" class="unit"></div>');
        this.npcs[data.id] = new this.NPC(data);
        return this.$map.append(this.npcs[data.id].el);
      };
      Map.prototype.addPlayer = function(data) {
        var tag;
        tag = this.unitStub + data.id;
        data.el = $('<div id="' + tag + '" class="unit"></div>');
        this.npcs[data.id] = new this.NPC(data);
        return this.$map.append(this.npcs[data.id].el);
      };
      Map.prototype.addUnits = function(arrData) {
        var addHtml, data, _i, _len, _results;
        addHtml = [];
        if (false === arrData instanceof Array) {
          arrData = [arrData];
        }
        _results = [];
        for (_i = 0, _len = arrData.length; _i < _len; _i++) {
          data = arrData[_i];
          _results.push(!(this.npcs[data.id] != null) && !this.players[data.id] ? (data.type === 'npc' ? this.addNpc(data) : void 0, data.type === 'player' ? this.addPlayer(data) : void 0) : void 0);
        }
        return _results;
      };
      Map.prototype.canShift = function(direction, xBound, yBound) {
        var newXcoord, newYcoord;
        newXcoord = this.pos[0];
        newYcoord = this.pos[1];
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
      Map.prototype.completedPath = function(node1, node2, coords) {
        var direction;
        if (!(coords != null)) {
          coords = [this.pos[0], this.pos[1]];
        }
        direction = this.getSimpleDirection(this.getDirection(node1, node2));
        if (direction === this.dir.W && coords[0] <= node2[0]) {
          return true;
        } else if (direction === this.dir.E && coords[0] >= node2[0]) {
          return true;
        } else if (direction === this.dir.N && coords[1] <= node2[1]) {
          return true;
        } else if (direction === this.dir.S && coords[1] >= node2[1]) {
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
      Map.prototype.generateUI = function() {
        var addHtml, bottomRightCoord, purgeIds, tileSize, tiles, topLeftCoord, x1, x2, x2max, y1, y2, y2max;
        tileSize = this.tileSize;
        x2max = this.tileMap[0].length;
        y2max = this.tileMap.length;
        x1 = this.pos[0] - this.viewportHalfWidth;
        y1 = this.pos[1] - this.viewportHalfHeight;
        x2 = this.pos[0] + this.viewportHalfWidth;
        y2 = this.pos[1] + this.viewportHalfHeight;
        x1 = Math.floor(x1 / tileSize) - 3;
        y1 = Math.floor(y1 / tileSize) - 3;
        x2 = Math.floor(x2 / tileSize) + 3;
        y2 = Math.floor(y2 / tileSize) + 3;
        x1 = x1 < 0 ? 0 : x1;
        y1 = y1 < 0 ? 0 : y1;
        x2 = x2 > x2max ? x2max : x2;
        y2 = y2 > y2max ? y2max : y2;
        topLeftCoord = [x1, y1];
        bottomRightCoord = [x2, y2];
        tiles = this.getTilesToAddAndRemove(topLeftCoord, bottomRightCoord);
        addHtml = tiles[0];
        purgeIds = tiles[1];
        this.$tileMap.append(addHtml.join(''));
        return $(purgeIds.join(',')).remove();
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
      Map.prototype.getSimpleDirection = function(direction) {
        if (direction.length === 2) {
          return direction.substr(0, 1);
        } else {
          return direction;
        }
      };
      Map.prototype.getPath = function(start, end) {
        var a, b, halfTileSize, node, nodepath, path, tileSize, x, y, _i, _len;
        a = this.collisionGraph.nodes[start[1]][start[0]];
        b = this.collisionGraph.nodes[end[1]][end[0]];
        path = $.astar.search(this.collisionGraph.nodes, a, b);
        nodepath = [];
        tileSize = this.tileSize;
        halfTileSize = this.halfTileSize;
        for (_i = 0, _len = path.length; _i < _len; _i++) {
          node = path[_i];
          x = node[0] * tileSize + halfTileSize;
          y = node[1] * tileSize + halfTileSize;
          nodepath.push([x, y]);
        }
        return nodepath;
      };
      Map.prototype.getTilesToAddAndRemove = function(topLeftCoord, bottomRightCoord) {
        var addHtml, k, left, newViewableTiles, purgeIds, stub, tile, tileSize, top, v, x, x1, x2, y, y1, y2, _ref;
        x1 = topLeftCoord[0];
        y1 = topLeftCoord[1];
        x2 = bottomRightCoord[0];
        y2 = bottomRightCoord[1];
        tileSize = this.tileSize;
        addHtml = [];
        purgeIds = [];
        newViewableTiles = {};
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
              addHtml.push('<div id="' + stub + '" class="tile type-' + tile + '" style="left:' + left + ';top:' + top + ';"></div>');
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
            purgeIds.push('#' + k);
          }
        }
        return [addHtml, purgeIds];
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
        var loopId;
        if (xBound == null) {
          xBound = 0;
        }
        if (yBound == null) {
          yBound = 0;
        }
        loopId = 'pan_map_' + direction;
        return $.loop.add(loopId, __bind(function() {
          if (this.canShift(direction, xBound, yBound)) {
            this.$map.css(this.shift(direction));
            return MM.user.el.css({
              zIndex: this.pos[1]
            });
          }
        }, this));
      };
      Map.prototype.panStop = function(direction) {
        return $.loop.remove('pan_map_' + direction);
      };
      Map.prototype.setCoords = function(xcoord, ycoord) {
        this.pos[0] = xcoord;
        this.pos[1] = ycoord;
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
          this.pos[0] -= change;
          this.left += change;
        } else if (direction === this.dir.E) {
          this.pos[0] += change;
          this.left -= change;
        } else if (direction === this.dir.N) {
          this.pos[1] -= change;
          this.top += change;
        } else if (direction === this.dir.S) {
          this.pos[1] += change;
          this.top -= change;
        }
        pos = {
          left: this.left,
          top: this.top
        };
        return pos;
      };
      Map.prototype.removeUnit = function(id) {
        delete this.npcs[id];
        delete this.players[id];
        return $('#' + this.unitStub + id).remove();
      };
      Map.prototype.startUIGenerator = function() {
        this.generateUI();
        return $.loop.add('map:ui:generator', 40, __bind(function() {
          return this.generateUI();
        }, this));
      };
      return Map;
    })();
    ui_path = 'maps/map_' + opts.map_id;
    MM.require(ui_path, 'css');
    MM.require('map', 'css');
    MM.require('class/unit');
    MM.require('sprite');
    MM.require('user');
    return MM.run(function() {
      /*
          TESTING
          */      var NPC, Player, arrPos, i, id, pos, totalSprites, x, xMax, y, yMax, _i, _len;
      MM.global['username'] = prompt('Enter Your Character Name:');
      MM.use('sprite');
      NPC = MM.use('class/unit', 'npc');
      Player = MM.use('class/unit', 'pc');
      MM.render(opts.el, ui_path);
      MM.extend('map', new Map({
        $map: opts.el,
        $tileMap: $('#ui-map-1'),
        xcoord: 700,
        ycoord: 650,
        change: 3,
        tileSize: 75,
        tileMap: [[0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5], [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5], [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5], [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5], [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5], [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5], [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5], [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5], [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5], [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5], [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5], [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5], [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5], [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5], [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5], [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5, 0, 0, 99, 0, 0, 2, 99, 3, 1, 5, 5], [0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 99, 3, 3, 4, 4, 5], [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5], [0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 3, 3, 3, 4, 4, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5], [0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5, 0, 0, 99, 99, 0, 2, 2, 2, 1, 3, 5]],
        collisionTypes: [99, 98],
        NPC: NPC,
        Player: Player
      }));
      MM.use('user');
      MM.map.$tileMap.delegate('.tile', 'click', function(e) {
        var left, tgt, top;
        tgt = $(e.target);
        left = parseInt(tgt.css('left'), 10);
        top = parseInt(tgt.css('top'), 10);
        return MM.user.runTo([left, top]);
      });
      /*
          Testing purposes!!! BELOW
          */
      arrPos = [];
      totalSprites = 25;
      xMax = MM.map.tileMap[0].length * 50;
      yMax = MM.map.tileMap.length * 50;
      i = 0;
      while (i < totalSprites) {
        x = MM.random(0, xMax);
        y = MM.random(0, yMax);
        arrPos.push([x, y]);
        i++;
      }
      id = 0;
      for (_i = 0, _len = arrPos.length; _i < _len; _i++) {
        pos = arrPos[_i];
        id++;
        MM.map.addUnits({
          id: 'npc-' + id,
          type: 'npc',
          height: 60,
          width: 65,
          imgpath: '/img/sprite_monster.png',
          pos: pos,
          speed: id === 1 ? 3 : id < 11 ? 2 : 1,
          name: id === 1 ? 'Leaping Lizzy' : id < 11 ? 'Fast Lizard' : 'Lizard',
          skip: id === 1 ? 4 : id < 11 ? 6 : 8,
          anim: {
            s: ["0 0", "-65px 0", "-130px 0"],
            n: ["-195px 0", "-260px 0", "-325px 0"],
            w: ["-390px 0", "-455px 0", "-520px 0"],
            e: ["-585px 0", "-650px 0", "-715px 0"]
          }
        });
        x = MM.random(0, xMax);
        y = MM.random(0, yMax);
        MM.map.npcs['npc-' + id].chase(MM.map.npcs['npc-' + (id - 1)]);
      }
      return MM.log('total sprites', id);
    });
  });
}).call(this);
