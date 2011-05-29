Setting Production Server Up for Ubuntu
========

On your blank Linode Ubuntu 11 server

    apt-get update
    apt-get install build-essential
    apt-get install upstart
    apt-get install haproxy
    apt-get install nginx
    apt-get install git
    apt-get install redis-server
    apt-get install mongodb
    apt-get install libssl-dev
    apt-get install uuid-dev

ZeroMQ
    
    wget http://download.zeromq.org/historic/zeromq-2.1.3.tar.gz
    tar -xzvf zeromq-2.1.3.tar.gz
    cd zeromq-2.1.3
    ./configure 
    make
    make install
    cd ~/
    rm -rf zeromq*

Install Node.js (v4.6 works with zeromq node binding)

    cd ~/
    wget http://nodejs.org/dist/node-v0.4.6.tar.gz
    tar -xzvf node-v0.4.6.tar.gz
    cd node-v0.4.6
    ./configure
    make
    make install
    cd ~/
    rm -rf node*

Set up the REMOTE repository on your SERVER

    cd ~/
    mkdir mmo.git
    cd mmo.git
    git init --bare
    mkdir ~/mmo
    cat > hooks/post-receive

Type this out and Ctrl+C when done

    #!/bin/sh
    forever stopall
    GIT_WORK_TREE=/root/mmo git checkout -f
    sh /root/mmo/startup

Make it executable

    chmod +x hooks/post-receive

Install NPM

    curl http://npmjs.org/install.sh | sh

Install in node_modules

    cd ~/mmo
    npm install email 
    npm install mongodb 
    npm install mongoose 
    npm install redis 
    npm install socket.io 
    npm install jade 
    npm install uuid 
    npm install zeromq

Keep Node up and running forever

    npm install forever -g

Create a startup file to be run on server re-boot

    cd /etc/init
    vi mmo.conf

Place the following contents inside

    #!upstart
    description     "MMORPG"
    author          "Weixi Yen"
    start on startup
    stop on shutdown
    exec sudo -u root sh -c "/root/mmo/startup"

Now create /root/mmo/startup

    #!/bin/sh
    forever start services/app.js 5000
    forever start services/app.js 5001
    forever start services/app.js 5002
    forever start services/app.js 5003
    forever start services/stream.js 5100
    forever start services/stream.js 5101
    forever start services/stream.js 5102
    forever start services/stream.js 5103
    forever start services/db.js

Make it executable

    chmod +x /root/mmo/startup

Edit /etc/nginx/nginx.conf

    worker_processes  1;
    events {
        worker_connections  1024;
    }
    http {
      ## MIME types
      types {
        application/xml xml;
        application/javascript  js;
        image/gif       gif;
        image/jpeg      jpg;
        image/png       png;
        image/bmp       bmp;
        image/x-icon    ico;
        text/css        css;
        text/html      html;
        text/plain      bob;
        text/plain      txt;
      }
      ## Compression
      gzip              on;
      gzip_types        text/plain text/html text/css image/x-icon image/bmp application/javascript;
      server {
        listen       4000;
        server_name  localhost;
        location ~ (favicon.ico|robots.txt|humans.txt) {
         	expires 7d;
        	log_not_found off;
        	break;
        }
        location / {
          proxy_pass http://127.0.0.1:5000;
        }
        location ~ ^/(css|tpl|img|js)/ {
          root /root/mmo/public/;
          expires max;
        }
      }
      server {
        listen       4001;
        server_name  localhost;
        location ~ (favicon.ico|robots.txt|humans.txt) {
          expires 7d;
          log_not_found off;
          break;
        }
        location / {
          proxy_pass http://127.0.0.1:5001;
        }
        location ~ ^/(css|tpl|img|js)/ {
          root /root/mmo/public/;
          expires max;
        }
      }
      server {
        listen       4002;
        server_name  localhost;
        location ~ (favicon.ico|robots.txt|humans.txt) {
          expires 7d;
          log_not_found off;
          break;
        }
        location / {
          proxy_pass http://127.0.0.1:5002;
        }
        location ~ ^/(css|tpl|img|js)/ {
        	root /root/mmo/public/;
        	expires max;
        }
      }
      server {
        listen       4003;
        server_name  localhost;
        location ~ (favicon.ico|robots.txt|humans.txt) {
          expires 7d;
          log_not_found off;
          break;
        }
        location / {
          proxy_pass http://127.0.0.1:5003;
        }
        location ~ ^/(css|tpl|img|js)/ {
        	root /root/mmo/public/;
        	expires max;
        }
      }
      server {
        listen 843;
        server_name  localhost;
        location / {
          rewrite ^(.*)$ /crossdomain.xml;
        }
        error_page 400 /crossdomain.xml;
        location = /crossdomain.xml {
          root /root/mmo/public/;
        }
      }
    }

Edit /etc/haproxy/haproxy.cfg

    global
      maxconn     4096 # Total Max Connections. This is dependent on ulimit
    defaults
      mode        http
      option http-server-close
      option http-pretend-keepalive
    frontend all 0.0.0.0:80
      timeout client 86400000
      default_backend web_servers
      acl is_stream path_dir socket.io
      use_backend stream_servers if is_stream
    backend web_servers
      balance source
      option forwardfor # This sets X-Forwarded-For
      timeout server 30000
      timeout connect 4000
      server web1 127.0.0.1:4000 weight 1 maxconn 1024 check
      server web2 127.0.0.1:4001 weight 1 maxconn 1024 check
      server web3 127.0.0.1:4002 weight 1 maxconn 1024 check
      server web3 127.0.0.1:4003 weight 1 maxconn 1024 check
    backend stream_servers
      #balance roundrobin
      balance source
      option forwardfor # This sets X-Forwarded-For
      timeout queue 5000
      timeout server 86400000 # never
      timeout connect 86400000 # never
      server stream1 127.0.0.1:5100 weight 1 maxconn 1024 check
      server stream1 127.0.0.1:5101 weight 1 maxconn 1024 check
      server stream1 127.0.0.1:5102 weight 1 maxconn 1024 check
      server stream1 127.0.0.1:5103 weight 1 maxconn 1024 check

Enable haproxy
    
    cd /etc/defaults
    vi haproxy
    # change enabled from 0 to 1

In your LOCAL repository:

    git remote add web ssh://root@96.126.102.183/root/mmo.git
    git push web +master:refs/heads/master

You can now use this command to push code to master

    git push web