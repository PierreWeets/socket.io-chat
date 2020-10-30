var userObj;//global for the whole file client.js

/*global io*/
var socket = io();//

/**
 * Scroll down the page if the user has not moved up to read old messages
 */
function scrollToBottom() {
  if ($(window).scrollTop() + $(window).height() + 2 * $('#messages li').last().outerHeight() >= $(document).height()) {
    $("html, body").animate({ scrollTop: $(document).height() }, 0);
  }
}

/**
 * User login
 */
$('#login form').submit(function (e) { // event : submit of the form, inside the element with id="login"
  e.preventDefault();// We avoid reloading the page when validating the form
  // create the object 'user'
   userObj = {
    //in the active window, inside the element with id="login",
      // the value of the input element is trimmed (fct trim())
    username : $('#login input').val().trim()
  };

    console.log('LOGIN : userObj.username = ' + Object.values(userObj).toString());
    console.log('LOGIN : userObj.username = ' + userObj.username);
    

  // If the login field is not empty
  if (userObj.username.length > 0) { //in the object 'user', the length of the value of the key 'username' > 0
    // send the object 'user' to the server, with event named 'user-login' 
    socket.emit('user-login', userObj, function (success) {
      if (success) {
       // Login form cache
        $('body').removeAttr('id'); //in the active window, remove the attribute of the body element
          // => in CSS file, the lines with "body#logged-out" are deactivated
        
        // Focus on the message field
        $('#chat input').focus(); // in the active window, inside the element with id="chat", 
                                  //set focus on the input element 
      }
    });
  }
});



/**
 * Envoi d'un message
 */
// rem : $ = the active window
// In the active window , inside the element with id="chat", if the element form is submitted
  // => triggers the code
$('#chat form').submit(function (e) { 
  
  // avoid reloading the page when validating the form
  e.preventDefault();
  // create our JSON object corresponding to our message
  console.log("userObj.username: "  + userObj.username);
  var message = {
    username : userObj.username,
    text : $('#m').val() // $('#m').val() = in the active window, content of the input element with id="m", 
  };
  $('#m').val('');  // in the active window, the content of the input element with id="m" is made empty

  if (message.text.trim().length !== 0) { // If message is NOT empty
    socket.emit('chat-message', message); //send the message to the server
  }

  $('#chat input').focus(); // inside the element with id="chat", Focus on the input element 
});

/**
 * Receiving a message
 */
socket.on('chat-message', function (messageObj) {
  //in the active window, in the <ul> element with id="messages", 
    // add an element <li> with value = message.text 
  // $('#messages').append($('<li>').text(messageObj.text));
  $('#messages').append($('<li>').html('<span class="username">' + messageObj.username + '</span> ' + messageObj.text));
  scrollToBottom();
});

/**
 * Receiving a service message
 */
socket.on('service-message', function (message) {
  $('#messages').append($('<li class="' + message.type + '">').html('<span class="info">information</span> ' + message.text));
  scrollToBottom();
});

/**
 * New user login
 */
//EVENT 'user-login'
socket.on('user-login', function (user) {
  //$('#users').append($('<li class="' + user.username + ' new">').html(user.username) + '<span class="typing">typing</span>');
  $('#users').append($('<li class="' + user.username + ' new">').html(user.username + '<span class="typing">typing</span>'));
  //$('#users').append($('<li class="' + user.username + ' new">').html(user.username));
  //After 1000 ms, in HTML, remove the class 'new' to the element <li> => display of logged user changes
  setTimeout(function () {
    $('#users li.new').removeClass('new');
  }, 1000);
});

/**
 * Logging out of a user
 */
//EVENT 'user-logout' : remove the disconnected user from the UI 
socket.on('user-logout', function (user) {
  let selector = '#users li.' + user.username;
  //in HTML, remove the <li> element |-> unlogged user
  $(selector).remove();
});

/**
 * User input detection
 */
var typingTimer;
var isTyping = false;

//EVENT keypress
$('#m').keypress(function () { //$('#m') = Html element with id="m"
  clearTimeout(typingTimer);
  if (!isTyping) {//if isTyping => emit the event 'start-typing'
    socket.emit('start-typing');
    isTyping = true;//flag 'isTyping' activated
  }
});
//EVENT keyup
$('#m').keyup(function () {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(function () {
    if (isTyping) {//if isTyping => emit the event 'stop-typing'
      socket.emit('stop-typing');
      isTyping = false;//flag 'isTyping' deactivated
    }
  }, 500);// after 500ms , trigger the function content
});

/**
 * Input management of other users
 */
//EVENT 'update-typing'
socket.on('update-typing', function (typingUsers) {
  $('#users li span.typing').hide();
  for (i = 0; i < typingUsers.length; i++) {
    $('#users li.' + typingUsers[i].username + ' span.typing').show();
  }
});