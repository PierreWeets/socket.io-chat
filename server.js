const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

//require("dotenv/config"); //get content of the .env file
require('dotenv').config(); //get content of the .env file

mongoose.connect(
  process.env.DB_CONNECTION_STRING, // retrieve in the .env file the value |-> key "DB_CONNECTION_STRING"
  { useUnifiedTopology : true , useNewUrlParser : true},
  (req, res) => {
    console.log("connection to MongoDB : " + process.env.DB_CONNECTION_STRING);
});

const Message = require("./models/message");
// const Message = new mongoose.Schema({
// 	username: { type: String,
// 			required : true},
// 	text: { type : String
// 		  }
//   }) ;

// parse body of incoming requests, from 'req' parameter in app.post('/create_user'
app.use(express.json());

//const User = require("./model.user");
//require("doteven/config");

var maxNumbersOfMessage = 20;
// List of connected users
var users = [];

// history of the messages
var messages = [];

// List of the users typing a message
var typingUsers = [];

// from an object, list all the keys & their values.
function printObject(o) {
  let out = '';
  for (let p in o) {
    out += p + ': ' + o[p] + '\n';
  }
  console.log(out);
}

// send the reference to the public directory, containing the file 'index.html', TO the client sessions
app.use("/", express.static(__dirname + "/public"));

// Event 'connection' : each time a user connects on the page (http://localhost:3000/),
io.on('connection', function (socket) {

  var loggedUserObj; // object user{ username }, used to manage all the events
  var userID; // for console.log

  // trigger EVENT 'user-login' to each connected user
  for (i = 0; i < users.length; i++) {
    socket.emit('user-login', users[i]);
  }

  // trigger EVENT 'chat-message' for each message in the history of messages
  for (i = 0; i < messages.length; i++) {
    if (messages[i].username !== undefined) { // if the message contains a username
      socket.emit('chat-message', messages[i]); // send the message as a user message
    } else {
      socket.emit('service-message', messages[i]); // send the message as a service message
    }
  }

  /* Connection of user with the login form :
   *  - save the user
   *  - broadcast a service message
   */
  // EVENT 'user-login' = send a service message to each connected user
  socket.on('user-login', function (user,callback) {
    
    // check if user is ALREADY connected
    var userIndex = -1;
    for (i = 0; i < users.length; i++) {
      if (users[i].username === user.username) {
        userIndex = i;
      }
    }
    // if user is new on the chat
    if (user !== undefined && userIndex === -1) { //if received object user exists & not found in the array of connected users
      loggedUserObj = user;
      userID = loggedUserObj.username;// for console.log
      console.log('user logged in : ' + userID);

      users.push(loggedUserObj);// add the new logged user to the array of logged users

      // send the service messages
      let userServiceMessage = {
        text: 'You logged in as "' +loggedUserObj.username + '"',
        type: 'login'
      };

      let broadcastedServiceMessage = {
        text: 'User "' +loggedUserObj.username + '" logged in',
        type: 'login'
	  };
	  
	  // trigger the EVENT 'service-message' on client side = send a service message to every user connected
      socket.emit('service-message', userServiceMessage);

      // add the service message to the history of messages
      messages.push(userServiceMessage);
      if (messages.length > maxNumbersOfMessage) { // if history contains more than the limit number of messages
        messages.splice(0, 1);//remove the oldest message
      }
		
	  // trigger the EVENT 'service-message' on client side = send a service message to every user connected user
	  	// except the current user
      socket.broadcast.emit('service-message', broadcastedServiceMessage);
      // add the service message to the history of messages
      messages.push(broadcastedServiceMessage);
      if (messages.length > maxNumbersOfMessage) { // if history contains more than the limit number of messages
        messages.splice(0, 1);//remove the oldest message
      }

      // trigger the EVENT 'user-login' 
      io.emit('user-login',loggedUserObj);

      callback(true); // give back the value 'true' to "socket.emit('user-login'" from client.js
    } else {
      callback(false); // give back the value 'false' to "socket.emit('user-login'" from client.js
    }
  });

  // EVENT 'disconnect' : each time a user disconnects from URL: http://localhost:3000/

  socket.on('disconnect', function (){ // 'disconnect' = reserved flag  
    if (loggedUserObj !== undefined) {
      console.log(`user ${userID} disconnected`);

      // service message of disconnection
      var serviceMessage = {
        text: 'User "' + loggedUserObj.username + '" disconnected',
        type: 'logout'
      };
      socket.broadcast.emit('service-message', serviceMessage);

      // delete from the list of connected users
      var userIndex = users.indexOf(loggedUserObj);
      if (userIndex !== -1) {
        users.splice(userIndex, 1);//remove at userIndex from the array 'users'
      }

      // send EVENT 'user-logout' contenant le user
      io.emit('user-logout', loggedUserObj);
      // add message to the history
      messages.push(serviceMessage);
      if (messages.length > maxNumbersOfMessage) {
        messages.splice(0, 1);
      }

      // Si jamais il était en train de saisir un texte, on l'enlève de la liste
      let typingUserIndex = typingUsers.indexOf(loggedUserObj);
      if (typingUserIndex !== -1) {
        typingUsers.splice(typingUserIndex, 1);
      }
    }
  });

  // EVENT 'chat-message' = resend to all connected users 
  socket.on('chat-message', function (messageObj) {
	
	//transform an object into an array & after into a string
    //console.log('messageObj values  = ' + Object.values(messageObj).toString());
    
    messageObj.username = loggedUserObj.username;
    // re-emit the received & modified message to all the users
    io.emit('chat-message', messageObj);

    try{

		console.log("messageObj :");
		printObject(messageObj);
		console.log("POST /messageObj : %j" , messageObj);
		
		let message = { "name" : messageObj.username  , "message" : messageObj.text};
		console.log("message :");
		printObject(message);

		//save the message in the MongoDB
		const messageToSave = new Message(message);// create a mongo document & give an objectId '_id' to the mongo document

		messageToSave.save();// give a versionKey '__v' of the mongo document & save the document in the distant MongoDB
		// test also if the request data (req.body) |-> the User schema, if not then error message sent to the request sender
		
    } catch(error){
		console.log (`Error access to MongoDB : ${error}`);
    }  

    // add the message to the history of message & purge if needed
    messages.push(messageObj);
    if (messages.length > maxNumbersOfMessage) {
      messages.splice(0, 1);//delete the 1st message from the array 'messages'
    }
  });

  /**
   * Réception de l'événement 'start-typing'
   * L'utilisateur commence à saisir son message
   */
  socket.on('start-typing', function () {
    // Ajout du user à la liste des utilisateurs en cours de saisie
    if (typingUsers.indexOf(loggedUserObj) === -1) {//if the current user is NOT YET in the list of the typing Users
      typingUsers.push(loggedUserObj);//add it in the list
    }
    io.emit('update-typing', typingUsers);
  });

  /**
   * Réception de l'événement 'stop-typing'
   * L'utilisateur a arrêter de saisir son message
   */
  socket.on('stop-typing', function () {
    let typingUserIndex = typingUsers.indexOf(loggedUserObj);// retrieve the index of the user in the list of the typing Users
    if (typingUserIndex !== -1) {//if the current user is in the list of the typing Users
      typingUsers.splice(typingUserIndex, 1);// remove it from the list
    }
    io.emit('update-typing', typingUsers);
  });

});


/**
 * Lancement du serveur en écoutant les connexions arrivant sur le port 3000
 */
const PORT = process.env.PORT;
http.listen(PORT, function () {
  console.log(`Server is listening on port:${PORT}`);
});
