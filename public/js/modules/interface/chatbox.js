(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  MM.add('interface/chatbox', function(opts) {
    var Chatbox;
    Chatbox = (function() {
      function Chatbox(data) {
        this.$el = data.el;
        this.$bg = this.$el.find('.ui-chatbox:first');
        this.$log = this.$el.find('.ui-chatlog:first');
        this.setDimensions();
        this.bindWindowResize();
      }
      Chatbox.prototype.bindWindowResize = function() {
        return $(window).resize(__bind(function() {
          return this.setDimensions();
        }, this));
      };
      Chatbox.prototype.setDimensions = function() {
        this.height = MM.settings.partyBox.height;
        this.width = $(window).width() - MM.settings.partyBox.width * 2 - 12;
        this.$bg.css({
          width: this.width,
          height: this.height
        });
        return this.$log.css({
          width: this.width,
          height: this.height
        });
      };
      return Chatbox;
    })();
    MM.require('interface/chatbox', 'css');
    return MM.run(function() {
      var chatbox;
      MM.render(opts.el, 'interface/chatbox');
      return chatbox = new Chatbox({
        el: opts.el
      });
    });
  });
}).call(this);
