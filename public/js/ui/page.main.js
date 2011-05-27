(function() {
  MM.ui('page.main', function(opts) {
    MM.require('page.main', 'css');
    return MM.run(function() {
      MM.render($('#main'), 'page.main');
      MM.ui('map', {
        el: $('#map'),
        map_id: 1
      });
      return MM.ui('user', {
        el: $('#user')
      });
    });
  });
}).call(this);
