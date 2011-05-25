(function() {
  SB.ui('page.main', function(opts) {
    SB.require('page.main', 'css');
    return SB.run(function() {
      SB.render($('#main'), 'page.main');
      return SB.ui('feed', {
        el: $('#feed')
      });
    });
  });
}).call(this);
