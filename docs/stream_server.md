SB Stream Server
======

The stream server handles comet long-polling operations, 
making possible real-time collaborative user interfaces on the front-end.

The stream server is able to communicate with 2 entities

- web server
	- the stream server accepts messages from the web server when updates come
- web client (browser)
	- the web client polls the stream server to wait for info
	- the stream server pushes data to browser when web server messages come in

The relationship looks like this

	browser <----> stream server <----- web server
	
The web server also communicates directly with the browser.

Now we have established the 3 entities:

	- web client (browser)
	- web server
	- stream server
	
Lets say you want to update the UI with messages as they come in.
Lets look at what the API looks like for each entity.

Web Client (Browser) API
-----------
The web client interacts with the stream server
by sending messages, and passing a callback to be 
executed at a later time.

Here's some example code:

	SB.comet(channel, function( data ){
		// do stuff after getting data
	});
	
	SB.comet(channel, function( data ){
		// do stuff after getting data
	});

Web Server
----------
The web server makes decisions on when to send data
to the stream server to pass back to the web client.

In the web server, here is some sample code to send data:

	web.stream(channel, data); // data gets passed back to web client
	
Stream Server
--------
The Stream Server does the following in order

1. accepts the comet requests
2. determines if the user is a member and gets the ID (or makes a random ID)
3. takes the channel and waits for the message from web server
4. places the response in a queue
5. gets message from web server of channel
6. sends the response back to web client from web server

Stream Server implementation with Socket.io
---------
Each stream server contains 2 objects which holds

- session object
	- each key is the sessionid
	- each value is the .send function to execute for that session
- channel object
	- each key is the channel tag (e.g. feed:football:fantasy)
	- each value is the array of session ids
	
When each client disconnects
	
	delete sessions[ client.sessionId ]
	
When we receive a message from client

	# we figure out the channel it wants and add it to the queue
	channels[ 'football:fantasy' ][ sessionId ] = client

When we receive a message from web app
	
	channel = channels[ tag ]
	# traverse the channel and send data using the client object
	for sid, client of channel
		client.send data