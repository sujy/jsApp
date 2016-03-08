//=====================================
//function:   messageBoard model
//=====================================

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var messageBoardSchema = new Schema({
	isComplaint : Boolean,
	messageBoardId : String,
	messageNote : String,
	date : {type : Date, default : Date.now},
	userID : String,
	doctorID : String,
	clinicID : String
});

mongoose.model("MessageBoard", messageBoardSchema);