//=====================================
//function:   announcement model
//=====================================

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var announcementSchema = new Schema({
	announcementID : String,
	clinicID : String,
	title : String,
	date : Date,
	content : String
});

mongoose.model("Announcement", announcementSchema);