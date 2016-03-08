//=====================================
//function:   doctor model
//=====================================

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var doctorSchema = new Schema({
	uuid : String,
	doctorID : String,
	name : String,
	photo : String,
	averServe : Number,
	averResult : Number,
	averPrice : Number,
	Monday : [{
				time : String,
				count : Number,
				max : Number
              }],
    Tuesday : [{
				time : String,
				count : Number,
				max : Number
              }],
    Wednesday : [{
				time : String,
				count : Number,
				max : Number
              }],
    Thursday : [{
				time : String,
				count : Number,
				max : Number
              }],
    Friday : [{
				time : String,
				count : Number,
				max : Number
              }],
    Saturday : [{
				time : String,
				count : Number,
				max : Number
              }],
    Sunday : [{
				time : String,
				count : Number,
				max : Number
              }]
});

mongoose.model("Doctor", doctorSchema);