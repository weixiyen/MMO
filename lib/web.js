var AsyncLoop, ENV, Handler, async, compileTemplates, createHandler, frontend_queue, frontends, fs, handlers, http, jade, log, middleware_queue, middlewares, oldheap, parseUrl, printMemory, querystring, settings, templates, util;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
util = require('util');
http = require('http');
fs = require('fs');
parseUrl = require('url').parse;
jade = require('jade');
querystring = require('querystring');
handlers = [];
frontend_queue = [];
frontends = {};
middleware_queue = [];
middlewares = {};
templates = {};
ENV = process.env.ENV;
settings = {
  port: 5100,
  dir: {
    templates: 'templates'
  }
};
exports.start = function(opts) {
  var server;
  if (opts == null) {
    opts = settings;
  }
  settings = __extends(settings, opts);
  server = http.createServer(function(req, res) {
    var handler_found;
    handler_found = false;
    return req.addParams(function() {
      return async.loop(frontend_queue, {
        req: req,
        res: res
      }, function(data) {
        var handler, _i, _len;
        req = data.req;
        res = data.res;
        for (_i = 0, _len = handlers.length; _i < _len; _i++) {
          handler = handlers[_i];
          if (req.method === handler.options.method && req.pathname.match(handler.pattern_regex)) {
            handler_found = true;
            req.params = handler.buildParams(req);
            async.loop(middleware_queue, {
              req: req,
              res: res,
              handler: handler
            }, function(data) {
              req = data.req;
              res = data.res;
              handler = data.handler;
              return handler.fn(req, res);
            });
            break;
          }
        }
        if (!handler_found) {
          return res.notFound();
        }
      });
    });
  });
  server.listen(settings.port);
  return compileTemplates(settings.dir.templates);
};
exports.get = function(pattern, options, fn) {
  return createHandler('GET', pattern, options, fn);
};
exports.post = function(pattern, options, fn) {
  return createHandler('POST', pattern, options, fn);
};
exports.put = function(pattern, options, fn) {
  return createHandler('PUT', pattern, options, fn);
};
exports.del = function(pattern, options, fn) {
  return createHandler('DELETE', pattern, options, fn);
};
createHandler = function(method, pattern, options, fn) {
  var handler;
  handler = new Handler(pattern, options, fn);
  handler.options.method = method;
  return handlers.push(handler);
};
exports.use = function(ware) {
  return middleware_queue.push(middlewares[ware]);
};
exports.createMiddleware = function(name, fn) {
  return middlewares[name] = fn;
};
exports.front = function(ware) {
  return frontend_queue.push(frontends[ware]);
};
exports.createFrontend = function(name, fn) {
  return frontends[name] = fn;
};
exports.render = function(key, locals) {
  var child, filepath, html, include_tags, inherit_tag, options, parent, path, tag, template, _i, _len;
  if (locals == null) {
    locals = {};
  }
  html = '';
  path = settings.dir.templates + '/' + key + '.jade';
  options = {
    locals: locals
  };
  if (ENV === 'dev') {
    template = fs.readFileSync(path, 'utf8');
    html = jade.render(template, options);
  } else {
    html = jade.render(templates[path], options);
  }
  if (html.match('%inherit:')) {
    inherit_tag = (html.match(new RegExp('%inherit:[-_a-zA-Z0-9]+', 'g')))[0];
    parent = exports.render(inherit_tag.split(':')[1], locals);
    return parent.replace('%body', html.replace(inherit_tag, ''));
  }
  if (html.match('%include:')) {
    include_tags = html.match(new RegExp('%include:[-_a-zA-Z0-9]+', 'g'));
    for (_i = 0, _len = include_tags.length; _i < _len; _i++) {
      tag = include_tags[_i];
      filepath = tag.split(':')[1];
      child = exports.render(filepath, locals);
      html = html.replace(tag, child);
    }
    return html;
  }
  return html;
};
exports.requireDir = function(dirname) {
  var filename, files, _i, _len, _results;
  require.paths.unshift(process.cwd() + '/' + dirname);
  files = fs.readdirSync(dirname);
  if (files) {
    _results = [];
    for (_i = 0, _len = files.length; _i < _len; _i++) {
      filename = files[_i];
      _results.push(filename.match(new RegExp('.js$')) ? require(filename.slice(0, -3)) : void 0);
    }
    return _results;
  }
};
Handler = (function() {
  function Handler(pattern, options, fn) {
    var alnum_pattern, pattern_re, token_re, _ref;
    this.pattern = pattern;
    this.options = options;
    this.fn = fn != null ? fn : {};
    if (typeof this.options === 'function') {
      _ref = [this.options, this.fn], this.fn = _ref[0], this.options = _ref[1];
    }
    alnum_pattern = '[-_a-zA-Z0-9]+';
    token_re = new RegExp(':' + alnum_pattern, 'g');
    pattern_re = this.pattern.replace(token_re, alnum_pattern);
    this.pattern_regex = new RegExp('^' + pattern_re + '$');
  }
  Handler.prototype.buildParams = function(req) {
    var params;
    params = this.getUrlParams(req.pathname);
    if (req.query) {
      params = __extends(req.query, params);
    }
    if (req.body) {
      return __extends(req.body, params);
    }
  };
  Handler.prototype.getUrlParams = function(url) {
    var h_frag, h_frags, params, u_frags, _i, _len;
    params = {};
    h_frags = this.pattern.split('/');
    u_frags = url.split('/');
    for (_i = 0, _len = h_frags.length; _i < _len; _i++) {
      h_frag = h_frags[_i];
      if (h_frag.substr(0, 1) === ':') {
        h_frag = h_frag.substr(1);
        params[h_frag] = u_frags[_i];
      }
    }
    return params;
  };
  return Handler;
})();
http.IncomingMessage.prototype.addParams = function(callback) {
  var body, url;
  url = parseUrl(this.url, true);
  this.pathname = url.pathname;
  this.query = url.query;
  body = '';
  this.addListener('data', function(chunk) {
    return body += chunk;
  });
  return this.addListener('end', function() {
    this.body = querystring.parse(body);
    return callback();
  });
};
http.ServerResponse.prototype.html = function(html, status_code) {
  if (status_code == null) {
    status_code = 200;
  }
  this.statusCode = status_code;
  this.setHeader('Content-Type', 'text/html');
  return this.end(html, 'utf8');
};
http.ServerResponse.prototype.json = function(json, status_code) {
  if (status_code == null) {
    status_code = 200;
  }
  this.statusCode = status_code;
  this.setHeader('Content-Type', 'application/json');
  return this.end(JSON.stringify(json, 'json'));
};
http.ServerResponse.prototype.redirect = function(path) {
  this.statusCode = 302;
  this.setHeader('Location', path);
  this.setHeader('Content-Type', 'text/html');
  return this.end('Redirecting...');
};
http.ServerResponse.prototype.notFound = function() {
  this.statusCode = 404;
  this.setHeader('Content-Type', 'text/html');
  return this.end('404 - file not found', 'utf8');
};
compileTemplates = function(dir) {
  var filename, filenames, filepath, key, path, _i, _len, _results;
  path = process.cwd() + '/' + dir + '/';
  filenames = fs.readdirSync(path);
  if (filenames.length === 0) {
    return;
  }
  _results = [];
  for (_i = 0, _len = filenames.length; _i < _len; _i++) {
    filename = filenames[_i];
    key = dir + '/' + filename;
    _results.push((filename.substr(filename.length - 5)) === '.jade' ? (filepath = path + filename, templates[key] = fs.readFileSync(filepath, 'utf8')) : compileTemplates(key));
  }
  return _results;
};
exports.async = async = {
  loop: function(fn_queue, data, last) {
    return new AsyncLoop(fn_queue.slice(), data, last);
  }
};
AsyncLoop = (function() {
  function AsyncLoop(fn_queue, data, last) {
    var k, v, _ref, _ref2;
    this.fn_queue = fn_queue;
    this.data = data;
    this.last = last != null ? last : {};
    if (typeof this.data === 'function') {
      _ref = [this.data, this.last], this.last = _ref[0], this.data = _ref[1];
    }
    _ref2 = this.data;
    for (k in _ref2) {
      v = _ref2[k];
      if (this[k] !== 'next') {
        this[k] = v;
      }
    }
    this.next();
  }
  AsyncLoop.prototype.next = function() {
    if (this.fn_queue.length === 0) {
      this.end();
      return;
    }
    return this.fn_queue.shift()(this);
  };
  AsyncLoop.prototype.end = function() {
    return this.last(this);
  };
  return AsyncLoop;
})();
log = function(thing) {
  return util.log(util.inspect(thing, true, 3));
};
oldheap = 0;
printMemory = function() {
  var newheap, usage;
  usage = process.memoryUsage();
  newheap = usage.heapUsed;
  log(usage);
  log('');
  log('>>>>>>>' + (newheap - oldheap) + '<<<<<<');
  log('');
  return oldheap = newheap;
};