var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var favoriteDoctorSchema = new Schema({
	userID : String,
	doctorID : [String]
});

mongoose.model("FavoriteDoctor", favoriteDoctorSchema);