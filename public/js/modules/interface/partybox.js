(function() {
  MM.add('interface/partybox', function(opts) {
    var Partybox;
    Partybox = (function() {
      function Partybox(data) {
        this.$el = data.el;
        this.$bg = this.$el.find('.ui-partybox:first');
        this.height = MM.settings.partyBox.height;
        this.width = MM.settings.partyBox.width;
        this.create();
      }
      Partybox.prototype.create = function() {
        return this.$bg.css({
          width: this.width,
          height: this.height
        });
      };
      return Partybox;
    })();
    MM.require('interface/partybox', 'css');
    return MM.run(function() {
      var partybox;
      MM.render(opts.el, 'interface/partybox');
      return partybox = new Partybox({
        el: opts.el
      });
    });
  });
}).call(this);
