child_process = require 'child_process'
fs = require 'fs'
procs = {}
cwd = process.cwd()

# UTILITY STUFF FOR DEVELOPMENT
# -------------------------------------------------
log = (thing) ->
	process.stdout.write thing
	
# DEV CLASS
# -------------------------------------------------
class Dev
	
	spawn: (server, port) ->
		id = server + ':' + port
		servername = 'services/' + server + '.js'
		procs[id] = child_process.spawn 'node', [servername, port]
		procs[id].stdout.on 'data', (data) ->
			log data
		procs[id].stderr.on 'data', (data) ->
			log data
		procs[id].on 'exit', (code) =>
			#log servername + ' exited: ' + code + '\n'
		
	coffee: (name, command) ->
		proc = child_process.exec command, (err, stdout, stderr) ->
		proc.stdout.on 'data', (data) =>
			log data
			if @restart_ok?
				spawn()
		proc.stderr.on 'data', (data) =>
			log data
		proc.on 'exit', (code) =>
			log name + ' exited: ' + code
	
	start: (name, command, type) ->
		proc = child_process.exec command, (err, stdout, stderr) ->
		if type != 'silent'
			proc.stdout.on 'data', (data) =>
				log data
			proc.stderr.on 'data', (data) =>
				log data
			proc.on 'exit', (code) =>
				log name + ' exited: ' + code
	
	nginx: ->
	  nginx_conf = cwd + '/scripts/nginx_dev.conf'
	  conf = fs.readFileSync nginx_conf, 'utf8'
	  conf = conf.replace /PATH_DIR/g, cwd
	  newfile = cwd + "/tmp/nginx_dev.conf"
	  fs.writeFileSync newfile, conf
	  command = 'nginx -c ' + cwd + '/tmp/nginx_dev.conf'
	  child_process.exec command, (err, stdout, stderr) ->
	    console.log '*** NGINX STARTED ***'

# START SERVERS
dev = new Dev()

# coffeescript and remove mongodb lock first
# kill processes
killAll = (all=false)->
  services = if all == true then '' else '| grep services | grep js'
  command = "ps auxwww | grep node "+services+" | awk '{ print $2 }' > " +cwd+ "/tmp/grepnode.txt"
  proc = child_process.exec command, (err, stdout, stderr) ->
    node_grep_file = cwd + '/tmp/grepnode.txt'
    pids = fs.readFileSync node_grep_file, 'utf8'
    pids = pids.split("\n").join(" ")
    kill = "kill " + pids
    child_process.exec kill, (err, stdout, stderr) ->
      console.log 'node processes killed'
      
killNginx = ->
  command = 'nginx -s stop'
  child_process.exec command, (err, stdout, stderr) ->
    console.log 'nginx stopped'

dev.start 'dev_start', 'coffee -cb scripts/dev_start.coffee'

start = ->
  killNginx()
  dev.coffee 'bare', 'coffee -wcbl services/ lib/ scripts/ tmp/ test/ models/ handlers/ middleware/'
  dev.coffee 'safe', 'coffee -wcl public/'
  dev.coffee 'stylus', 'stylus -w public/css'
  dev.coffee 'stylus', 'stylus -w public/css/maps'
  dev.start 'mongolock', 'rm /data/db/mongod.lock', 'silent'
  dev.start 'redis', 'redis-server', 'silent'
  dev.start 'brew', 'brew update', 'silent'
  dev.start 'npm', 'npm update', 'silent'
  dev.start 'mongo', 'mongod', 'silent'
  dev.start 'lb', 'haproxy -f scripts/haproxy.conf -p /var/run/haproxy.pid', 'silent'
  dev.nginx()
start()

# app servers second
spawn = ->
  killAll()
  respawn = ->
    dev.spawn 'app', 5000
    dev.spawn 'app', 5001
    dev.spawn 'app', 5002
    dev.spawn 'app', 5003
    dev.spawn 'stream', 5100
    dev.spawn 'stream', 5101
    dev.spawn 'stream', 5102
    dev.spawn 'stream', 5103
    dev.spawn 'db', 0
    log '\n----------------------------------\n\n'
  setTimeout respawn, 250
spawn()

enableRespawn = ->
  dev.restart_ok = true
  log '\n*** respawn enabled ***\n\n'
setTimeout enableRespawn, 5000

process.on 'exit', ->
  # kill all services
	killAll true 
	killNginx()
	