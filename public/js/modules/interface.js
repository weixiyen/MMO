(function() {
  MM.add('interface', function(opts) {
    MM.require('interface/chatbox');
    MM.require('interface/partybox');
    return MM.run(function() {
      MM.render(opts.el, 'interface');
      MM.use('interface/chatbox', {
        el: $('#chatbox')
      });
      return MM.use('interface/partybox', {
        el: $('#partybox')
      });
    });
  });
}).call(this);
