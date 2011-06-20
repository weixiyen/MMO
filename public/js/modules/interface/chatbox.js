(function() {
  MM.add('interface/chatbox', function(opts) {
    var Chatbox;
    Chatbox = (function() {
      function Chatbox(data) {
        this.$el = data.el;
        this.$bg = this.$el.find('.ui-chatbox:first');
        this.$log = this.$el.find('.ui-chatlog:first');
        this.height = $(window).height() - MM.settings.partyBox.height - 11;
        this.width = MM.settings.partyBox.width;
        this.create();
      }
      Chatbox.prototype.create = function() {
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
