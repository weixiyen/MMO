SleeperBot - Fantasy Sports Talk
===

To create a database populated with real user data:

Have "dev" running...

Then... run the following command from /sleeperbot/ directory in a different terminal window:

	mongorestore scripts/dump

Current Tasks
---
- Code the SB feed page for all 3 sports (no cookies support) 
- Code a way for users to login (re-usable modal) & backend authentication 
- prepare production instances and one push deploy script
- Launch new site

Documentation
---
[Development Setup on Mac OSX][dev_setup]

[Web Server Docs][web_server]

[Stream Server Docs][stream_server]

[Data Access Layer Docs][data_access]

[Load Balancing Docs][load_balancing]

[Front-end Development Docs][frontend_dev]

[dev_setup]:https://github.com/weixiyen/sleeperbot/blob/master/docs/dev_setup.md
[web_server]:https://github.com/weixiyen/sleeperbot/blob/master/docs/web_server.md
[stream_server]:https://github.com/weixiyen/sleeperbot/blob/master/docs/stream_server.md
[data_access]:https://github.com/weixiyen/sleeperbot/blob/master/docs/data_access.md
[load_balancing]:https://github.com/weixiyen/sleeperbot/blob/master/docs/load_balancing.md
[frontend_dev]:https://github.com/weixiyen/sleeperbot/blob/master/docs/frontend_dev.md