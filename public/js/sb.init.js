(function() {
  WEB.namespace('SB');
  SB.addRoute('/', function(tokens) {
    return SB.ui('page.main', {
      title: 'SleeperBot Fantasy Sports'
    });
  });
  SB.addRoute('/login', function(tokens) {
    return SB.ui('login', {
      title: 'Login',
      fancy: true
    });
  });
  SB.route();
}).call(this);
