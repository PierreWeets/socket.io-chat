# Socket.io : Chat
This application uses the sources of the [tutorial] (http://blog.bini.io/developper-une-application-avec-socket-io/) present on the blog [bini.io] (http: //blog.bini .io), which is itself an adaptation of the [official tutorial] (http://socket.io/get-started/chat/) from socket.io.

## Installation

If you do not have bower installed on your machine, install it first as follows:  
````
npm install -g bower
````

To install the application, download the sources (git clone) and run the following command from the root of the project.  
````
npm install
bower install
````

## Start the application
To start the application, run the following command from the root of the project.  
````
node server
````

The application is now accessible at the url ** http: // localhost: 4000 / **.  
****************************
INFORMATION :  

In file ./Server.js :  

- each time a user connects on the page (http://localhost:4000/).  
"io.on('connection', function (socket) "  // 'connection' = reserved word

- Correspondance between the methods 'socket.emit' AND 'socket.on' inside Server.js.  
ex: (server side) socket.emit -> socket.on  (server side)  
"socket.emit('user-login', users[i])" --TRIGGERS--> "socket.on('user-login', function (user,callback)"

- Correspondance between the methods 'io.emit' from Server.js AND method 'socket.on' in each Client.js.  
ex: (server side) io.emit -> socket.on  (client side)  
"io.emit('user-logout', loggedUserObj)" --TRIGGERS--> "socket.on('user-logout', function (user)" in each Client.js.

- Correspondance between the methods 'socket.broadcast.emit' from Server.js AND method 'socket.on' in each Client.js EXCEPT the current user.  
ex: (server side) socket.broadcast.emit -> socket.on (client side EXCEPT the current user)  
"socket.broadcast.emit('service-message', broadcastedServiceMessage)" --TRIGGERS--> socket.on('service-message', function (message) 
---------------------
In file ./public/Client.js :

- Correspondance between the methods 'socket.emit' AND 'socket.on' inside Client.js.  
ex: (client side) socket.emit -> socket.on (client side)  
"socket.emit('chat-message', message)" --TRIGGERS--> "socket.on('chat-message', function (messageObj)" 

- Correspondance between the methods 'socket.emit' from Client.js AND 'socket.on' inside Server.js.  
ex: (client side) socket.emit -> socket.on (Server side)  
"socket.emit('start-typing')" --TRIGGERS--> "socket.on('start-typing', function ()"
