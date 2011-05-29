Setting Production Server Up for Ubuntu
========

On your blank Linode Ubuntu 11 server

    apt-get update
    apt-get install build-essential
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

Install Node.js

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
    /etc/init.d/mmo

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

    cd /etc/init.d
    vi mmo

Place the following contents inside

    #!/bin/sh
    cd /root/mmo
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

    chmod +x mmo

In your LOCAL repository:

    git remote add web ssh://root@96.126.102.183/root/mmo.git
    git push web +master:refs/heads/master

You can now use this command to push code to master

    git push web