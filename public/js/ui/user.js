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
          right: false,
          left: false,
          down: false,
          up: false
        };
        this.el.css({
          height: this.height,
          width: this.width,
          background: 'no-repeat url(' + this.imgpath + ')'
        });
        this.center();
      }
      User.prototype.center = function() {
        var left, top;
        left = $(window).width() / 2 - this.width / 2;
        top = 250 - this.height / 2;
        return this.put(left, top);
      };
      User.prototype.put = function(x, y) {
        return this.el.css({
          left: x,
          top: y
        });
      };
      User.prototype.move = function(direction) {
        var stub;
        if (this.pressed[direction] === true) {
          return;
        }
        this.pressed[direction] = true;
        MM.map.panStart(direction);
        stub = 'user_' + direction;
        MM.counter[stub] = 0;
        return $.loop.add(stub, function() {
          if (0 !== $.loop.count % 4) {
            return;
          }
          MM.user.el.css({
            'background-position': MM.user.anim[direction][MM.counter[stub]]
          });
          if (MM.counter[stub] === 2) {
            return MM.counter[stub] = 0;
          } else {
            return MM.counter[stub] += 1;
          }
        });
      };
      User.prototype.stop = function(direction) {
        this.pressed[direction] = false;
        MM.map.panStop(direction);
        return $.loop.remove('user_' + direction);
      };
      return User;
    })();
    MM.require('user', 'css');
    MM.require('sprites', 'css');
    return MM.run(function() {
      var data, doc;
      data = {
        el: opts.el,
        height: 32,
        width: 24,
        imgpath: '/img/sprites.png',
        anim: {
          right: ["-72px -32px", "-96px -32px", "-120px -32px"],
          left: ["-72px -96px", "-96px -96px", "-120px -96px"],
          up: ["-72px 0", "-96px 0", "-120px 0"],
          down: ["-72px -64px", "-96px -64px", "-120px -64px"]
        }
      };
      MM.user = new User(data);
      doc = $(document);
      doc.keydown(function(e) {
        var code;
        e.preventDefault();
        e.stopPropagation();
        code = e.keyCode;
        if (code === 37) {
          return MM.user.move('left');
        } else if (code === 38) {
          return MM.user.move('up');
        } else if (code === 39) {
          return MM.user.move('right');
        } else if (code === 40) {
          return MM.user.move('down');
        }
      });
      doc.keyup(function(e) {
        var code;
        e.preventDefault();
        e.stopPropagation();
        code = e.keyCode;
        if (code === 37) {
          return MM.user.stop('left');
        } else if (code === 38) {
          return MM.user.stop('up');
        } else if (code === 39) {
          return MM.user.stop('right');
        } else if (code === 40) {
          return MM.user.stop('down');
        }
      });
      return $(window).blur(function() {
        MM.user.stop('left');
        MM.user.stop('up');
        MM.user.stop('right');
        return MM.user.stop('down');
      });
    });
  });
}).call(this);
