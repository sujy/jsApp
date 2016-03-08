//=====================================
//function:   booking model
//=====================================

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var bookingSchema = new Schema(
	{
		bookingID : String,
		bookingDay : Date,
		bookingIW : String,
		bookingTime : String,
		userID : String,
		doctorID : String
	});

mongoose.model("Booking", bookingSchema);