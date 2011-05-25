(function() {
  SB.ui('login', function(opts) {
    SB.require('sample', 'css');
    return SB.run(function() {
      var title;
      SB.render($('#main'), 'login');
      title = prompt('Give page new title');
      return SB.go({
        title: title,
        path: '/',
        ui: 'feed'
      });
    });
  });
}).call(this);
