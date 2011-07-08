(function() {
  MM.add('interface', function(opts) {
    MM.require('interface/chatbox');
    MM.require('interface/partybox');
    MM.require('interface/minimap');
    return MM.run(function() {
      MM.render(opts.el, 'interface');
      MM.use('interface/chatbox', {
        el: $('#chatbox')
      });
      MM.use('interface/partybox', {
        el: $('#partybox')
      });
      return MM.use('interface/minimap', {
        el: $('#minimap')
      });
    });
  });
}).call(this);
