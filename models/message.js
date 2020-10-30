const mongoose = require("mongoose");

//define the schema of a message
const Message = new mongoose.Schema({
	// username: { type: String,
	// 		required : true},
	// text:  String
	name: { type: String,
		required : true},
	message:  String
  }) ;

module.exports = mongoose.model("message", Message);