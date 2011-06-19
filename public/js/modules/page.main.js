(function() {
  MM.add('page.main', function(opts) {
    MM.require('page.main', 'css');
    return MM.run(function() {
      MM.render($('#main'), 'page.main');
      return MM.use('map', {
        el: $('#map'),
        map_id: 1
      });
    });
  });
}).call(this);
