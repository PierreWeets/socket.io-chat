# Socket.io : Chat
This application uses the sources of the [tutorial] (http://blog.bini.io/developper-une-application-avec-socket-io/) present on the blog [bini.io] (http: //blog.bini .io), which is itself an adaptation of the [official tutorial] (http://socket.io/get-started/chat/) from socket.io.

## Installation

In a command line window :  

* install bower on your machine
```
npm install -g bower
```

* install the application, download the sources (git clone) 
```
git clone https://github.com/PierreWeets/socket.io-chat.git
```
and go into the root of the project.
```
cd socket.io-chat
```

* run the following commands, from the root of the project.  
```
npm install
bower install
```

* in the root of the project, create a '.env' file containing references to an existing MongoDB :   
```
DB_CONNECTION_STRING = "mongodb+srv://becodeUser:becodeUser2020@cluster0.qmkvi.mongodb.net/realtimeChat?retryWrites=true&w=majority"
PORT=4000
```  

# OR

* [create a DB on MongoDB Atlas](https://www.mongodb.com/cloud/atlas/signup).   

And in the root of the project, create a '.env' file containing informations about the connection string & the Port used by the client browser, to connect to the MongoDB.

Ex: file '.env' :
```
DB_CONNECTION_STRING = "mongodb+srv://[myUser]:[myPassword]@cluster0.qmkvi.mongodb.net/[myMongoDB]?retryWrites=true&w=majority"
PORT=4000
```
where
* [myUser] = your user-id on MongoDB Atlas
* [myPassword] = your password on MongoDB Atlas
* [myMongoDB] = name of your DB on MongoDB Atlas  
 


## Start the application
run the following command from the root of the project, to lauch the server-side application.  
```
node server
```
The client-side application is now accessible in a browser at the url [http://localhost:4000/](http://localhost:4000/).  

You can start several client-side applications with several browser with the url [http://localhost:4000/](http://localhost:4000/). 

## INFORMATION :  

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
