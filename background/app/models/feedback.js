//=====================================
//function:   feedback model
//=====================================

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var feedbackSchema = new Schema({
	message : String,
	contact : String,
});

mongoose.model("Feedback", feedbackSchema);