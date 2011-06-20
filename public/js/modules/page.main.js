(function() {
  MM.add('page.main', function(opts) {
    MM.require('page.main', 'css');
    MM.require('map');
    MM.require('interface');
    return MM.run(function() {
      MM.render($('#main'), 'page.main');
      MM.use('map', {
        el: $('#map'),
        map_id: 1
      });
      return MM.use('interface', {
        el: $('#interface')
      });
    });
  });
}).call(this);
