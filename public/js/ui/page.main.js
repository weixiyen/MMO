(function() {
  SB.ui('page.main', function(opts) {
    SB.require('page.main', 'css');
    return SB.run(function() {
      return SB.log('okay...');
      /*
          SB.render $('#main'), 'page.main'
          SB.ui 'feed',
            el: $('#feed')
          */
    });
  });
}).call(this);
