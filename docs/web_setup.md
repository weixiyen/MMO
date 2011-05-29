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

Install NPM

    curl http://npmjs.org/install.sh | sh

Install NPM Modules

    npm install -g stylus 
    npm install -g coffee-script

Install in node_modules

    npm install email 
    npm install mongodb 
    npm install mongoose 
    npm install redis 
    npm install socket.io 
    npm install jade 
    npm install uuid 
    npm install zeromq