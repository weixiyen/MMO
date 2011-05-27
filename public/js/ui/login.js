(function() {
  MM.ui('login', function(opts) {
    MM.require('sample', 'css');
    return MM.run(function() {
      var title;
      MM.render($('#main'), 'login');
      title = prompt('Give page new title');
      return MM.go({
        title: title,
        path: '/',
        ui: 'feed'
      });
    });
  });
}).call(this);
