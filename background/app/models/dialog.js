//=====================================
//function:   dialog model
//=====================================

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var dialogSchema = new Schema(
	{
		dialogID : String,
		dialogTime: Date,
		dialogMessage : String,
		flag : Boolean,
		doctorID : String,
		userID : String
	});

mongoose.model("Dialog", dialogSchema);