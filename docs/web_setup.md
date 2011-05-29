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
    #!/bin/sh
    GIT_WORK_TREE=/root/mmo git checkout -f
    chmod +x hooks/post-receive

In your LOCAL repository:

    git remote add web ssh://root@96.126.102.183/root/mmo.git
    git push web +master:refs/heads/master

You can now use this command to push code to master

    git push web

Install NPM

    curl http://npmjs.org/install.sh | sh

Install in node_modules

    npm install email 
    npm install mongodb 
    npm install mongoose 
    npm install redis 
    npm install socket.io 
    npm install jade 
    npm install uuid 
    npm install zeromq