(function() {
  var History, WEB, ajax, css_queue, getPatternRegex, jade, js_queue, paths_list, routes, tokenize, ui;
  WEB = {};
  WEB.VERSION = guid();
  WEB.options = {
    paths: {
      tpl: '/tpl/',
      css: '/css/',
      js: '/js/',
      ui: '/js/ui/'
    }
  };
  WEB.namespace = function(namespace) {
    return window[namespace] = WEB;
  };
  WEB.log = function(thing) {
    if (typeof console !== "undefined" && console !== null) {
      return console.log(thing);
    }
  };
  ui = {};
  WEB.ui = function(name, opts) {
    if (opts == null) {
      opts = {};
    }
    if (typeof opts === 'function' && !(ui[name] != null)) {
      return ui[name] = opts;
    }
    if (!(ui[name] != null)) {
      WEB.require(name);
      return WEB.run(function() {
        return ui[name](opts);
      });
    } else {
      return ui[name](opts);
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
    if ((data != null) && (data.ui != null)) {
      return WEB.ui(data.ui, data);
    }
  });
  WEB.go = function(opts) {
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
      src = WEB.options.paths.ui + name + '.js?v=' + WEB.VERSION;
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
  WEB.render = function(el, filename, options) {
    var req, tpl_path;
    tpl_path = WEB.options.paths.tpl + filename + '.jade?v=' + WEB.VERSION;
    req = WEB.get({
      url: tpl_path,
      async: false
    });
    return req.success(function(res) {
      return el.html(jade.render(res, options));
    });
  };
  routes = [];
  WEB.route = function(pathname) {
    var route, _i, _len, _results;
    if (pathname == null) {
      pathname = null;
    }
    if (pathname === null) {
      return WEB.route(document.location.pathname);
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
    if (fn == null) {
      fn = [];
    }
    return routes.push({
      path: path,
      fn: fn
    });
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
  $(function() {
    var comet, reconn_interval, socket;
    comet = {};
    socket = new io.Socket;
    reconn_interval = null;
    socket.connect();
    socket.on('connect', function() {
      return clearInterval(reconn_interval);
    });
    socket.on('message', function(msg) {
      return comet[msg.channel](msg.data);
    });
    socket.on('disconnect', function() {
      var reconn;
      reconn = function() {
        return socket.connect();
      };
      return reconn_interval = setInterval(reconn, 5000);
    });
    return WEB.comet = function(channel, fn) {
      comet[channel] = fn;
      return socket.send({
        channel: channel
      });
    };
  });
  this.WEB = WEB;
}).call(this);
