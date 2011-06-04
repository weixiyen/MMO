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
        this.pressed = {
          n: false,
          e: false,
          s: false,
          w: false
        };
        this.el.css({
          height: this.height,
          width: this.width,
          background: 'no-repeat url(' + this.imgpath + ')'
        });
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
        var DIRECTION, LOOPID, NODE1, NODE2, divisor, path, run, stop, x1, x2, y1, y2;
        LOOPID = 'user:path:loop';
        NODE1 = 'user:path:node:1';
        NODE2 = 'user:path:node:2';
        DIRECTION = 'user:path:direction';
        $.loop.remove(LOOPID);
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
            return stop();
          }
          MM.global[NODE1] = path.shift();
          MM.global[NODE2] = path[0];
          return MM.user.move(MM.global[DIRECTION] = MM.map.getDirection(MM.global[NODE1], MM.global[NODE2]));
        };
        stop = function() {
          return MM.user.stop(MM.global[DIRECTION]);
        };
        if (MM.global[DIRECTION]) {
          stop();
        }
        run();
        return $.loop.add(LOOPID, function() {
          if (MM.map.completedPath(MM.global[NODE1], MM.global[NODE2])) {
            stop();
            return run();
          }
        });
      };
      User.prototype.move = function(direction) {
        var stub, xBound, yBound;
        if (this.pressed[direction] === true) {
          return;
        }
        this.pressed[direction] = true;
        xBound = Math.floor(this.width / 2);
        yBound = Math.floor(this.height / 2);
        MM.map.panStart(direction, xBound, yBound);
        direction = this.getSimpleDirection(direction);
        stub = 'user_' + direction;
        MM.global[stub] = 0;
        $.loop.add(stub, 2, function() {
          MM.user.el.css({
            'background-position': MM.user.anim[direction][MM.global[stub]]
          });
          if (MM.global[stub] === 2) {
            return MM.global[stub] = 0;
          } else {
            return MM.global[stub] += 1;
          }
        });
        return direction;
      };
      User.prototype.stop = function(direction) {
        this.pressed[direction] = false;
        MM.map.panStop(direction);
        $.loop.remove('user_' + direction);
        return this.face(direction);
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
        facing: 'e',
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
          return MM.user.move('w');
        } else if (code === 38) {
          return MM.user.move('n');
        } else if (code === 39) {
          return MM.user.move('e');
        } else if (code === 40) {
          return MM.user.move('s');
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
        MM.user.stop('w');
        MM.user.stop('n');
        MM.user.stop('e');
        return MM.user.stop('s');
      });
    });
  });
}).call(this);
