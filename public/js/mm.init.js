(function() {
  WEB.namespace('MM');
  $.loop.setInterval(30);
  MM.global = {};
  MM.addRoute('/', function(tokens) {
    return MM.use('page.main', {
      title: 'RPG Demo'
    });
  });
  MM.addRoute('/login', function(tokens) {
    return MM.use('login', {
      title: 'Login',
      fancy: true
    });
  });
  MM.route();
}).call(this);
