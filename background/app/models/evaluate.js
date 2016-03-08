//=====================================
//function:   evaluate model
//=====================================

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var evaluateSchema = new Schema({
	evaluateID : String,
	evaluateNote : String,
	date : {type : Date, default : Date.now},
	userID : String,
	doctorID : String,
	isFree : Boolean,
	serve : Number,
	result : Number,
	price : Number
});

mongoose.model("Evaluate", evaluateSchema);