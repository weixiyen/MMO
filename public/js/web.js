(function() {
  var History, WEB, ajax, css_queue, extensions, getPatternRegex, jade, js_queue, module, paths_list, routes, tokenize;
  WEB = {};
  WEB.VERSION = window.VERSION || guid();
  WEB.options = {
    paths: {
      tpl: '/tpl/',
      css: '/css/',
      js: '/js/',
      modules: '/js/modules/'
    }
  };
  WEB.namespace = function(namespace) {
    return window[namespace] = WEB;
  };
  WEB.log = function(label, print) {
    if (print == null) {
      print = null;
    }
    if (typeof console !== "undefined" && console !== null) {
      if (print != null) {
        console.log(label + ' => ' + print);
        return;
      }
      return console.log(label);
    }
  };
  module = new Object;
  WEB.add = function(name, fn) {
    if (!module.hasOwnProperty(name)) {
      return module[name] = fn;
    }
  };
  WEB.use = function(name, opts) {
    if (module.hasOwnProperty(name)) {
      return module[name](opts);
    }
    WEB.require(name);
    return WEB.run(function() {
      if (module.hasOwnProperty(name)) {
        return module[name](opts);
      }
    });
  };
  extensions = [];
  WEB.extend = function(name, ext) {
    if (!(WEB[name] != null)) {
      WEB[name] = ext;
      return extensions.push(name);
    }
  };
  ajax = function(options) {
    return $.ajax(options);
  };
  WEB.get = function(options) {
    options.type = 'GET';
    return ajax(options);
  };
  WEB.post = function(options) {
    options.type = 'POST';
    return ajax(options);
  };
  WEB.put = function(options) {
    options.type = 'PUT';
    return ajax(options);
  };
  WEB.del = function(options) {
    options.type = 'DELETE';
    return ajax(options);
  };
  History = window.History;
  History.Adapter.bind(window, 'statechange', function() {
    var data;
    data = History.getState().data;
    if ((data != null) && (data.module != null)) {
      return WEB.use(data.module, data);
    }
  });
  WEB.go = function(opts) {
    if (opts.path === window.location.pathname || document.location.href.match("#.[a-zA-Z0-9/]+\\?")) {
      WEB.use(opts.module, opts);
    }
    return History.pushState(opts, opts.title, opts.path);
  };
  js_queue = [];
  css_queue = [];
  paths_list = {};
  WEB.require = function(name, type) {
    var key, src;
    if (type == null) {
      type = 'js';
    }
    key = name + '.' + type;
    if (paths_list[key] != null) {
      return;
    }
    paths_list[key] = true;
    if (type === 'js') {
      src = WEB.options.paths.modules + name + '.js?v=' + WEB.VERSION;
      return js_queue.push(src);
    } else {
      src = WEB.options.paths.css + name + '.css?v=' + WEB.VERSION;
      return css_queue.push(src);
    }
  };
  WEB.run = function(fn) {
    if (css_queue.length > 0) {
      LazyLoad.css(css_queue);
      css_queue = [];
    }
    if (js_queue.length > 0) {
      LazyLoad.js(js_queue, function() {
        return fn();
      });
      return js_queue = [];
    } else {
      return fn();
    }
  };
  jade = require('jade');
  WEB.render = function(el, filename, options, callback) {
    var req, tpl_path;
    if (options == null) {
      options = {};
    }
    tpl_path = WEB.options.paths.tpl + filename + '.jade?v=' + WEB.VERSION;
    req = WEB.get({
      url: tpl_path,
      async: false,
      dataType: 'text'
    });
    return req.success(function(res) {
      el.html(jade.render(res, options));
      if (callback) {
        return callback();
      }
    });
  };
  routes = [];
  WEB.route = function(pathname) {
    var route, _i, _len, _results;
    if (pathname == null) {
      pathname = null;
    }
    if (pathname === null) {
      try {
        WEB.route(document.location.href.match("#.[a-zA-Z0-9/]+\\?")[0].replace(new RegExp('[#.\\?]', 'g'), ''));
      } catch (error) {
        WEB.route(document.location.pathname);
      }
      return;
    }
    _results = [];
    for (_i = 0, _len = routes.length; _i < _len; _i++) {
      route = routes[_i];
      if (pathname.match(getPatternRegex(route.path))) {
        route.fn(tokenize(route.path, pathname));
        break;
      }
    }
    return _results;
  };
  WEB.addRoute = function(path, fn) {
    var lastChar;
    if (fn == null) {
      fn = [];
    }
    lastChar = path.substring(path.length - 1, path.length);
    if (lastChar === '/') {
      routes.push({
        path: path.slice(0, -1),
        fn: fn
      });
      return routes.push({
        path: path,
        fn: fn
      });
    } else {
      routes.push({
        path: path + '/',
        fn: fn
      });
      return routes.push({
        path: path,
        fn: fn
      });
    }
  };
  getPatternRegex = function(pattern) {
    var alnum_pattern, pattern_re, token_re;
    alnum_pattern = '[-_a-zA-Z0-9]+';
    token_re = new RegExp(':' + alnum_pattern, 'g');
    pattern_re = pattern.replace(token_re, alnum_pattern);
    return new RegExp('^' + pattern_re + '$');
  };
  tokenize = function(pattern, url) {
    var h_frag, h_frags, params, u_frags, _i, _len;
    params = {};
    h_frags = pattern.split('/');
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
  WEB.comet = $.noop;
  $(function() {
    var comet, socket;
    comet = {};
    socket = io.connect('http://' + document.domain);
    return WEB.comet = function(channel, fn) {
      return socket.on(channel, function(data) {
        return fn(data);
      });
    };
  });
  WEB.resetUI = function() {
    return $('*').unbind().undelegate().die();
  };
  this.WEB = WEB;
}).call(this);
