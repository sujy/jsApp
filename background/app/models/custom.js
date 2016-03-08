//=====================================
//function:   patient model
//=====================================

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var patientSchema = new Schema({
	uuid : String,
	userID : String,
	name : String,
	photo : String,
});

mongoose.model("Patient", patientSchema);