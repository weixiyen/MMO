var Dev, child_process, cwd, dev, enableRespawn, fs, killAll, killNginx, log, procs, spawn, start;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
child_process = require('child_process');
fs = require('fs');
procs = {};
cwd = process.cwd();
log = function(thing) {
  return process.stdout.write(thing);
};
Dev = (function() {
  function Dev() {}
  Dev.prototype.spawn = function(server, port) {
    var id, servername;
    id = server + ':' + port;
    servername = 'services/' + server + '.js';
    procs[id] = child_process.spawn('node', [servername, port]);
    procs[id].stdout.on('data', function(data) {
      return log(data);
    });
    procs[id].stderr.on('data', function(data) {
      return log(data);
    });
    return procs[id].on('exit', __bind(function(code) {}, this));
  };
  Dev.prototype.coffee = function(name, command) {
    var proc;
    proc = child_process.exec(command, function(err, stdout, stderr) {});
    proc.stdout.on('data', __bind(function(data) {
      log(data);
      if (this.restart_ok != null) {
        return spawn();
      }
    }, this));
    proc.stderr.on('data', __bind(function(data) {
      return log(data);
    }, this));
    return proc.on('exit', __bind(function(code) {
      return log(name + ' exited: ' + code);
    }, this));
  };
  Dev.prototype.start = function(name, command, type) {
    var proc;
    proc = child_process.exec(command, function(err, stdout, stderr) {});
    if (type !== 'silent') {
      proc.stdout.on('data', __bind(function(data) {
        return log(data);
      }, this));
      proc.stderr.on('data', __bind(function(data) {
        return log(data);
      }, this));
      return proc.on('exit', __bind(function(code) {
        return log(name + ' exited: ' + code);
      }, this));
    }
  };
  Dev.prototype.nginx = function() {
    var command, conf, newfile, nginx_conf;
    nginx_conf = cwd + '/scripts/nginx_dev.conf';
    conf = fs.readFileSync(nginx_conf, 'utf8');
    conf = conf.replace(/PATH_DIR/g, cwd);
    newfile = cwd + "/tmp/nginx_dev.conf";
    fs.writeFileSync(newfile, conf);
    command = 'nginx -c ' + cwd + '/tmp/nginx_dev.conf';
    return child_process.exec(command, function(err, stdout, stderr) {
      return console.log('*** NGINX STARTED ***');
    });
  };
  return Dev;
})();
dev = new Dev();
killAll = function(all) {
  var command, proc, services;
  if (all == null) {
    all = false;
  }
  services = all === true ? '' : '| grep services | grep js';
  command = "ps auxwww | grep node " + services + " | awk '{ print $2 }' > " + cwd + "/tmp/grepnode.txt";
  return proc = child_process.exec(command, function(err, stdout, stderr) {
    var kill, node_grep_file, pids;
    node_grep_file = cwd + '/tmp/grepnode.txt';
    pids = fs.readFileSync(node_grep_file, 'utf8');
    pids = pids.split("\n").join(" ");
    kill = "kill " + pids;
    return child_process.exec(kill, function(err, stdout, stderr) {
      return console.log('node processes killed');
    });
  });
};
killNginx = function() {
  var command;
  command = 'nginx -s stop';
  return child_process.exec(command, function(err, stdout, stderr) {
    return console.log('nginx stopped');
  });
};
dev.start('dev_start', 'coffee -cb scripts/dev_start.coffee');
start = function() {
  killNginx();
  dev.coffee('bare', 'coffee -wcbl services/ lib/ scripts/ tmp/ test/ models/ handlers/ middleware/');
  dev.coffee('safe', 'coffee -wcl public/');
  dev.coffee('stylus', 'stylus -w public/css/*');
  dev.start('mongolock', 'rm /data/db/mongod.lock', 'silent');
  dev.start('redis', 'redis-server', 'silent');
  dev.start('brew', 'brew update', 'silent');
  dev.start('npm', 'npm update', 'silent');
  dev.start('mongo', 'mongod', 'silent');
  dev.start('lb', 'haproxy -f scripts/haproxy.conf -p /var/run/haproxy.pid', 'silent');
  return dev.nginx();
};
start();
spawn = function() {
  var respawn;
  killAll();
  respawn = function() {
    dev.spawn('app', 5000);
    dev.spawn('app', 5001);
    dev.spawn('app', 5002);
    dev.spawn('app', 5003);
    dev.spawn('stream', 5100);
    dev.spawn('stream', 5101);
    dev.spawn('stream', 5102);
    dev.spawn('stream', 5103);
    dev.spawn('db', 0);
    return log('\n----------------------------------\n\n');
  };
  return setTimeout(respawn, 250);
};
spawn();
enableRespawn = function() {
  dev.restart_ok = true;
  return log('\n*** respawn enabled ***\n\n');
};
setTimeout(enableRespawn, 5000);
process.on('exit', function() {
  killAll(true);
  return killNginx();
});