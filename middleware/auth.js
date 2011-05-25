var app;
require.paths.unshift(process.cwd() + '/lib');
app = require('web');
app.createMiddleware('auth', function(mw) {
  mw.req.userid = 'whatever';
  mw.req.foo = 'bar';
  return mw.next();
});
app.createMiddleware('protect', function(mw) {
  mw.req.fan = 'baz';
  mw.req.foo = 'baz';
  if (mw.handler.options.intercept === true) {
    mw.res.end('middleware interception');
    return;
  }
  return mw.next();
});