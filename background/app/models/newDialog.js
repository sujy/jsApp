//=====================================
//function:   new dialog model
//=====================================

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var newDialogSchema = new Schema(
	{
		dialogTime: Date,
		dialogMessage : String,
		fromUserID : String,
		toUserID : String,
		fromUserName : String,
		toUserName : String,
		fromUserPhoto : String
	});

mongoose.model("NewDialog", newDialogSchema);