(function() {
  SB.ui('feed', function(opts) {
    SB.require('feed', 'css');
    return SB.run(function() {
      var request;
      request = SB.get({
        url: '/api/feed/topics',
        data: {
          sport: 'football',
          skip: 0,
          limit: 25
        }
      });
      return request.success(function(topics) {
        return SB.render(opts.el, 'feed', {
          locals: {
            topics: topics
          }
        });
      });
    });
  });
}).call(this);
