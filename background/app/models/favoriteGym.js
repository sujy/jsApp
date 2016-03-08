//=====================================
//function:   favoriteClinic model
//=====================================
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var favoriteClinicSchema = new Schema({
	userID : String,
	clinicID : [String]
});

mongoose.model("FavoriteClinic", favoriteClinicSchema);