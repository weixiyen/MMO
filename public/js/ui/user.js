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
        top = $(window).height() / 2 - this.height / 2;
        return this.put(left, top);
      };
      User.prototype.put = function(x, y) {
        return this.el.css({
          left: x,
          top: y
        });
      };
      User.prototype.move = function(direction) {
        return MM.map.panStart(direction);
      };
      User.prototype.stop = function(direction) {
        return MM.map.panStop(direction);
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
          right: [
            {
              l: "-72px",
              t: "-32px"
            }, {
              l: "-96px",
              t: "-32px"
            }, {
              l: "-120px",
              t: "-32px"
            }
          ],
          left: [
            {
              l: "-72px",
              t: "-96px"
            }, {
              l: "-96px",
              t: "-96px"
            }, {
              l: "-120px",
              t: "-96px"
            }
          ],
          up: [
            {
              l: "-72px",
              t: "0"
            }, {
              l: "-96px",
              t: "0"
            }, {
              l: "-120px",
              t: "0"
            }
          ],
          down: [
            {
              l: "-72px",
              t: "-64px"
            }, {
              l: "-96px",
              t: "-64px"
            }, {
              l: "-120px",
              t: "-64px"
            }
          ]
        }
      };
      MM.user = new User(data);
      doc = $(document);
      doc.keydown(function(e) {
        var code;
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
