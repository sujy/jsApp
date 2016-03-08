//=====================================
//function:   family menber model
//=====================================

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var memberSchema = new Schema({
	memberID : String,
	userID : String,
	name : String,
	relationship : String,
	gender : {type : String, default : ''},
	birthday : {type : String, default : ''},
	height : {type : String, default : ''},
	weight : {type : String, default : ''},
	bloodPressure : [{
						dbp : Number,
						sbp : Number,
						heartRate : Number,
						date : Date
					}],
	bloodSugar : [{
					record : Number,
					date : Date
				 }],
	label : [String]
});

mongoose.model("Member", memberSchema);