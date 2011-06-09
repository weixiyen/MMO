(function() {
  MM.ui('user', function(opts) {
    var User;
    User = (function() {
      function User(data) {
        this.el = data.el;
        this.height = data.height;
        this.width = data.width;
        this.imgpath = data.imgpath;
        this.id = data.id;
        this.anim = data.anim;
        this.moving = {
          n: false,
          e: false,
          s: false,
          w: false
        };
        this.moveQueue = [];
        this.el.css({
          height: this.height,
          width: this.width,
          background: 'no-repeat url(' + this.imgpath + ')'
        });
        this.tag = {
          automove: 'user:path:automove',
          pathloop: 'user:path:loop'
        };
        this.center();
        this.face(data.facing);
      }
      User.prototype.center = function() {
        var left, top;
        left = $(window).width() / 2 - this.width / 2;
        top = $(window).height() / 2 - this.height / 2;
        return this.put(left, top);
      };
      User.prototype.put = function(x, y) {
        return this.el.css({
          left: x,
          top: y
        });
      };
      User.prototype.runTo = function(coords) {
        var LOOPID, NODE1, NODE2, divisor, path, run, x1, x2, y1, y2;
        LOOPID = this.tag.pathloop;
        NODE1 = 'user:path:node:1';
        NODE2 = 'user:path:node:2';
        $.loop.remove(LOOPID);
        MM.user.stopAll();
        divisor = MM.map.tileSize;
        x1 = Math.floor(MM.map.xcoord / divisor);
        y1 = Math.floor(MM.map.ycoord / divisor);
        x2 = Math.floor(coords[0] / divisor);
        y2 = Math.floor(coords[1] / divisor);
        path = MM.map.getPath([x1, y1], [x2, y2]);
        if (path.length < 2) {
          return;
        }
        run = function() {
          if (path.length < 2) {
            $.loop.remove(LOOPID);
            MM.user.stopAll();
            return;
          }
          MM.global[NODE1] = path.shift();
          MM.global[NODE2] = path[0];
          return MM.user.move(MM.map.getDirection(MM.global[NODE1], MM.global[NODE2]));
        };
        MM.global[this.tag.automove] = true;
        run();
        return $.loop.add(LOOPID, function() {
          if (MM.map.completedPath(MM.global[NODE1], MM.global[NODE2])) {
            MM.user.stopAll();
            return run();
          }
        });
      };
      User.prototype.keyMove = function(direction) {
        $.loop.remove(this.tag.pathloop);
        if (MM.global[this.tag.automove] === true) {
          MM.user.stopAll();
          MM.global[this.tag.automove] = false;
        }
        return this.move(direction);
      };
      User.prototype.move = function(direction) {
        var stub, xBound, yBound;
        if (this.moving[direction] === true) {
          return;
        } else {
          this.moving[direction] = true;
          this.moveQueue.push(direction);
        }
        xBound = Math.floor(this.width / 2);
        yBound = Math.floor(this.height / 2);
        MM.map.panStart(direction, xBound, yBound);
        direction = this.getSimpleDirection(this.moveQueue[0]);
        stub = 'user_' + direction;
        MM.global[stub] = 0;
        $.loop.add(stub, 2, function() {
          MM.user.el.css({
            'background-position': MM.user.anim[direction][MM.global[stub]]
          });
          if (MM.global[stub] === 2) {
            return MM.global[stub] = 0;
          }
          return MM.global[stub] += 1;
        });
        return direction;
      };
      User.prototype.stop = function(direction) {
        var index;
        this.moving[direction] = false;
        index = this.moveQueue.indexOf(direction);
        this.moveQueue.splice(index, 1);
        if (this.moveQueue.length) {
          this.stop(this.moveQueue[0]);
          this.move(this.moveQueue[0]);
        }
        MM.map.panStop(direction);
        $.loop.remove('user_' + direction);
        if (MM.global[this.tag.automove] === false) {
          return this.face(direction);
        }
      };
      User.prototype.stopAll = function() {
        var k, v, _ref, _results;
        _ref = this.moving;
        _results = [];
        for (k in _ref) {
          v = _ref[k];
          _results.push(this.moving[k] === true ? this.stop(k) : void 0);
        }
        return _results;
      };
      User.prototype.teleport = function(xcoord, ycoord) {
        return MM.map.goTo(xcoord, ycoord);
      };
      User.prototype.getSimpleDirection = function(direction) {
        if (direction.length === 2) {
          return direction.substr(0, 1);
        } else {
          return direction;
        }
      };
      User.prototype.face = function(direction) {
        direction = this.getSimpleDirection(direction);
        return this.el.css({
          'background-position': this.anim[direction][1]
        });
      };
      return User;
    })();
    MM.require('user', 'css');
    MM.require('sprites', 'css');
    return MM.run(function() {
      var $doc;
      MM.user = new User({
        el: opts.el,
        height: 32,
        width: 24,
        imgpath: '/img/sprites.png',
        facing: 's',
        anim: {
          e: ["-72px -32px", "-96px -32px", "-120px -32px"],
          w: ["-72px -96px", "-96px -96px", "-120px -96px"],
          n: ["-72px 0", "-96px 0", "-120px 0"],
          s: ["-72px -64px", "-96px -64px", "-120px -64px"]
        }
      });
      $doc = $(document);
      $doc.keydown(function(e) {
        var code;
        e.preventDefault();
        e.stopPropagation();
        code = e.keyCode;
        if (code === 37) {
          return MM.user.keyMove('w');
        } else if (code === 38) {
          return MM.user.keyMove('n');
        } else if (code === 39) {
          return MM.user.keyMove('e');
        } else if (code === 40) {
          return MM.user.keyMove('s');
        }
      });
      $doc.keyup(function(e) {
        var code;
        e.preventDefault();
        e.stopPropagation();
        code = e.keyCode;
        if (code === 37) {
          return MM.user.stop('w');
        } else if (code === 38) {
          return MM.user.stop('n');
        } else if (code === 39) {
          return MM.user.stop('e');
        } else if (code === 40) {
          return MM.user.stop('s');
        }
      });
      return $(window).blur(function() {
        return MM.user.stopAll();
      });
    });
  });
}).call(this);
