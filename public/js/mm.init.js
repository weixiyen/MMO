(function() {
  WEB.namespace('MM');
  MM.addRoute('/', function(tokens) {
    return MM.ui('page.main', {
      title: 'RPG Demo'
    });
  });
  MM.addRoute('/login', function(tokens) {
    return MM.ui('login', {
      title: 'Login',
      fancy: true
    });
  });
  MM.route();
}).call(this);
