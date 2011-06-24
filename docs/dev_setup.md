MMO Development Environment Setup (Mac OSX)
==================================================

Install XCode Tools
--------------------------------------------------
Download and install [xcode][xcode]

Install Homebrew
--------------------------------------------------
[Homebrew][homebrew] is a package manager for OSX similar to apt-get

	ruby -e "$(curl -fsSL https://gist.github.com/raw/323731/install_homebrew.rb)"

Install MongoDB and Redis
--------------------------------------------------
Note: After installing each one, make sure to follow
the instructions for having Mongo & Redis startup
automatically after restart.
	
	brew update
	brew install haproxy
	brew install nginx
	brew install zeromq
	brew install redis
	brew install mongo
	brew install node
	mkdir -p /data/db # for mongodb

Getting Started
--------------------------------------------------

Clone the SleeperBot Repository

	cd ~/
	mkdir mmo
	cd mmo
	git clone git@github.com:weixiyen/mmo.git

Create the following empty directories as GIT does not track empty ones

	mkdir tmp
	mkdir test

Install Node.js & NPM (Node Package Manager)
--------------------------------------------------
Follow instructions on [http://nodejs.org/][nodejs] (Do not use Homebrew for Node.js or NPM)

Download & install npm, coffee-script, and stylus

	curl http://npmjs.org/install.sh | sh
	npm install stylus -g
	npm install coffee-script -g
	npm install email
	npm install mongodb
	npm install mongoose
	npm install redis
	npm install socket.io@0.6.1
	npm install uuid
	npm install zeromq
	npm install jade

Setup
--------------------------------------------------

Edit copy and paste the following into ~/.bash_profile where ~/mmo

	# aliases
	alias dev='cd ~/mmo && sudo node scripts/dev_start.js && cd -'
	
	#exports
	export PATH=${PATH}:/usr/local/sbin
	export ENV=dev

Run the dev environment and visit localhost:5000

	# QUIT and RE-OPEN terminal first
	# then run the dev command
	dev

Edit your /etc/hosts file

	sudo nano /etc/hosts

Add these 2 lines

	127.0.0.1 sbdev.com
	127.0.0.1 www.sbdev.com

Visit this URL:

	sbdev.com
	
**Congratulations!** Your dev environment setup is complete!

Remember to run these commands every now and then:
  
	brew upgrade
	npm update

In your LOCAL repository:

    git remote add web ssh://root@96.126.102.183/root/mmo.git
    git push web +master:refs/heads/master

You can now use this command to push code to master

    git push web

[xcode]:http://developer.apple.com/technologies/xcode.html
[homebrew]:https://github.com/mxcl/homebrew
[nodejs]:http://nodejs.org/