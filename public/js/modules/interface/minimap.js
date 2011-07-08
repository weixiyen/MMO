(function() {
  MM.add('interface/minimap', function(opts) {
    var Minimap;
    Minimap = (function() {
      function Minimap(data) {
        this.$el = data.el;
        this.$bg = this.$el.find('.ui-minimap:first');
        this.height = MM.settings.partyBox.height;
        this.width = MM.settings.partyBox.width;
        this.create();
      }
      Minimap.prototype.create = function() {
        return this.$bg.css({
          width: this.width,
          height: this.height
        });
      };
      return Minimap;
    })();
    MM.require('interface/minimap', 'css');
    return MM.run(function() {
      var minimap;
      MM.render(opts.el, 'interface/minimap');
      return minimap = new Minimap({
        el: opts.el
      });
    });
  });
}).call(this);
