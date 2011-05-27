(function() {
  MM.ui('user', function(opts) {
    var User;
    User = (function() {
      function User(data) {
        this.el = data.el;
        this.height = data.height;
        this.width = data.width;
      }
      return User;
    })();
    MM.require('user', 'css');
    return MM.run(function() {
      var data;
      data = {
        height: 100,
        width: 50
      };
      MM.user = new User({
        el: opts.el,
        height: data.height,
        width: data.width
      });
      $(document).keydown(function(e) {
        var code;
        e.preventDefault();
        code = e.keyCode;
        if (code === 37) {
          return MM.map.pan('left');
        } else if (code === 38) {
          return MM.map.pan('up');
        } else if (code === 39) {
          return MM.map.pan('right');
        } else if (code === 40) {
          return MM.map.pan('down');
        }
      });
      return $(document).keyup(function(e) {
        return e.preventDefault();
      });
    });
  });
}).call(this);
