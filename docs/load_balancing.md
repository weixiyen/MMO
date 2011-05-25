SleeperBot Load Balancing
=========================

Overview
-------------------------
SleeperBot's load balancing is handled by an HAProxy front-end.

Stream server requests are proxied directly to node.js.

App server requests are proxied to nginx, which reverse proxies to node.js or serves static files.

NOTE: Considering using Squid page templating / cacheing to replace nginx altogether and have HAProxy proxy
directly to the node.js app servers.

HAProxy configuration
--------------------------
HAProxy sends web server requests to a web server farm made up of of NGINX-fronted web servers.

- the web server farm is stateless
- load balancing by round robin (considering leastconn)

HAProxy directs stream server requests (requests with socket.io in the url path) to stream servers.

- stream servers are stateful
- load balancing by "balance source", looks at the visitor's source address to honor stateful persistence

NGINX configuration
--------------------------
Each nginx fronts 4 node.js app servers to use all 4 cores of the CPU.

Diagram
--------------------------
Here is a diagram of the load balancing architecture

	                 HAProxy Load balancer <---------> HAProxy backup
	                         |         |
	--------------------------         -----------
	|              |                   |         |         
	nginx          nginx               node.js   node.js
	app clusetr    app cluster         stream    stream
	|
	|
	-----------------------------------------
	|            |            |             |
	|            |            |             |
	node.js      node.js      node.js       node.js
	app server   app server   app server    app server

Reasons for architecture:

- HAProxy is a better load balancer than nginx, so it fronts everything.
- NGINX also mangles headers so websocket is done with HAProxy straight to node.js
- HAProxy cannot serve files, so node.js serves files