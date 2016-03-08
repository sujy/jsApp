//=====================================
//function:   controller for doctors
//=====================================

var express = require('express'),
    router = express.Router(),
    encryp = require('../publicfunc/crypto'),
    request = require('../publicfunc/doctorRequest'),
    fileToBase64 = require('../publicfunc/fileToBase64'),
    deleteFile = require('../publicfunc/deleteFile'),
    mongoose = require('mongoose'),
    uuID = require('node-uuid'),
    cors = require('../publicfunc/cors'),
    async = require('async'),
    GetDateStr = require('../publicfunc/getDateStr'),
    weekToChinese = require('../publicfunc/weekToChinese'),
    Announcement = mongoose.model('Announcement'),
    MessageBoard = mongoose.model('MessageBoard'),
    Booking = mongoose.model('Booking'),
    Patient = mongoose.model('Patient'),
    Evaluate = mongoose.model('Evaluate'),
    Doctor = mongoose.model('Doctor');

module.exports = function (app) {
  app.use('/doctor', router);
};

//全局设置请求服务器地址和端口
var dataHost = 'localhost';
var dataPort = 8081;
var photoHost = 'localhost';
var photoPort = 5555;
//测试并发
// var testCount = 0;
// var oldTime ='';
//===================
// 测试区域
//===================
// console.log('test Date: ' + Date.now());
// var m = new Doctor;
// console.log(m);
// console.log(GetDateStr(Number('saf')));
//===================
// 测试区域
//===================


//===================
//医生登陆模块
//===================
router.post('/login', function (req, res) {
  res = cors(res);
  console.log(req.cookies);
  var session = req.session;
  if (session.doctorID) {
  	//用户已经登录
  	console.log('doctot login with cookies: ' + session.doctorID);
  	res.send({status : "success"});
  } else {
  	//发送登录请求给后端服务器
  	//发送前先加密用户密码
  	var doctorID = req.body.doctorID;
  	var password = encryp(req.body.password);

  	//请求数据
  	var postData = {
  		doctorID : doctorID,
  		password : password
  	}
  	//发送请求
  	request(dataHost, dataPort, 'POST', '/api/doctor/login', postData, function (data){
  		if(data.result == true){
  		    //写入医患互动数据库
  			var query  = Doctor.where({ uuid : data.uuid, doctorID : doctorID});
			query.findOne(function (err, doctor) {
			  if (err){
			  	res.send({status : 'failure', message : 'error : quering database'});
			  	return handleError(err);
			  }
			  if (doctor) {
			  	session.doctorID = doctorID;
  				session.uuid = data.uuid;
  				session.clinicID = data.clinicID;
  				console.log('success : doctot login without cookies: ' + doctorID);
  				// console.log(res.req);
  				// console.log('doctor : ' + doctorID);
  				res.send({status : 'success', cookie : res.req.sessionID, uuid : session.uuid});
			  } else {
			  	var newDoctor = new Doctor({
			  		uuid : data.uuid,
			  		doctorID : doctorID,
			  		name : '',
			  		photo : '',
			  	});
			  	var postForInfo = {
			  		doctorID : doctorID
			  	}
			  	request(dataHost, dataPort, 'POST', '/api/doctor/info', postForInfo, function (doctorInfo){
			  		if(doctorInfo.result == true) {
			  			newDoctor.name = doctorInfo.doctor.name;
			  			newDoctor.photo = doctorInfo.doctor.photo;
			  			console.log(newDoctor);
			  			newDoctor.save(function (err, doctor){
					  		if(err){
					  			console.log('error : when save doctor to database');
					  			res.send({status : 'failure', message : 'doctor not found'});
					  			return handleError(err);
					  		} else {
					  			session.doctorID = doctorID;
		  						session.uuid = doctorInfo.doctor.uuid;
		  						session.clinicID = doctorInfo.doctor.clinicID;
					  			// console.log(session);
					  			console.log('success : login && save to database: ' + doctorID);
					  			res.send({status : 'success', uuid:doctorInfo.doctor.uuid});
					  		}
					  	});
			  		} else {
			  			res.send({status:'failure', message:'reqeust doctor info fail'});
			  		}
			  	});
			  }
			});
  		}else{
  			console.log('error : ' + data);
  			res.send({status : 'failure', message : data.message});
  		}
  	});
  }
});

//===================
//医生登出模块
//===================
router.get('/logout', function (req, res) {
	res = cors(res);
	//退出清除用户的session
	var doctorID = req.session.doctorID;
	if(doctorID){
		console.log("sucess : doctor logout : " + doctorID);
		req.session.destroy(function (err){
			if(err){
				console.log('error : destory session error' + err);
				res.send({status : 'failure'});
			}else {
				res.send({status : 'success'});
			}
		});
	} else {
		console.log("error : doctor logout fail");
		res.send({status : 'failure'});
	}
})


//===================
//获取医生资料
//===================
router.get('/profile', function (req, res) {
	res = cors(res);
	var session = req.session;
	console.log(req.session);
	if(session.doctorID){
		//发送请求数据
		var postData = {
			doctorID : session.doctorID
		}
		//发送请求
		request(dataHost, dataPort, 'POST', '/api/doctor/info', postData, function (data){
			if(data.result == true){
				var result = {
					name : data.doctor.name,
					gender : data.doctor.gender,
					phone : data.doctor.phone,
					email : data.doctor.email,
					note : data.doctor.note,
					photo : data.doctor.photo
				}
				console.log(result);
				res.send({status:'success', info:result});
			} else {
				res.send({status:'failure', message:'request fail'});
			}
		});
	}else {
		res.send({status:'failure', message:'please login first'});
	}
});

//===================
//修改医生资料
//===================
router.post('/profile/update', function (req, res){
	res = cors(res);
	var session = req.session;
	//接受数据
	var updateName = req.body.doctorInfo.name;
	var updateGender = req.body.doctorInfo.gender;
	var updatePhone = req.body.doctorInfo.phone;
	var updateEmail = req.body.doctorInfo.email;
	var updateNote = req.body.doctorInfo.note;
	//数据验证
	// console.log(req.body.doctorInfo);
	//发送修改用户信息请求
	if(session.doctorID){
		//发送数据
		var postData = {
			doctorID : session.doctorID,
			name : updateName,
			gender : updateGender,
			phone : updatePhone,
			email : updateEmail,
			note : updateNote,
			level: 4
		}
		console.log(postData);
		//发送请求
		request(dataHost, dataPort, 'POST', '/api/doctor/update', postData, function (data){
			if(data.result == true){
				Doctor.findOne({ uuid : session.uuid}, function (err, doctor){
					if(err) {
						res.send({status:'failure', message:'find doctor error'})
					}
					if(doctor){
						console.log('doctor before update ' + doctor);
						doctor.name = updateName;
						doctor.save(function (err){
							if(err){
								res.send({status : 'failure', message : 'update local database fail'});
							} else {
								res.send({status : 'success'});
							}
						});
					} else {
						res.send({status:'failure', message:'doctor not found'});
					}
				});
			} else {
				res.send({status : 'failure', message : 'update fail'});
			}
		})
	} else {
		res.send({status:'failure', message:'please login first'});
	}
});

//===================
//修改密码
//===================
router.post('/profile/password', function (req, res){
	res = cors(res);
	var session = req.session;
	//接受数据
	var oldPassword = encryp(req.body.oldPassword);
	var newPassword = encryp(req.body.newPassword);
	//是否登陆
	if(session.doctorID){
		//请求旧密码
		var postForOld = {
			doctorID : session.doctorID,
		}
		request(dataHost, dataPort, 'POST', '/api/doctor/info', postForOld, function (data){
			if(data.result == true){
				if(data.doctor.password == oldPassword){
					//旧密码匹配，更新密码
					var postForUpdate = {
						doctorID : session.doctorID,
						password : newPassword
					}
					request(dataHost, dataPort, 'POST', '/api/doctor/update', postForUpdate, function (data){
						if(data.result == true) {
							req.session.destroy(function (err){
								if(err){
									console.log('error : destory session error' + err);
									res.send({status : 'failure', message:'destory session error'});
								}else {
									res.send({status : 'success'});
								}
							});
						} else {
							res.send({status:'failure', message:'update password fail'})
						}
					});
				} else {
					res.send({status:'failure', message:'old password not match'});
				}
			} else {
				res.send({status:'failure', message:'request fail'});
			}
		});
	} else {
		res.send({status:'failure', message:'please login first'});
	}
});

//===================
//修改头像
//===================
router.post('/profile/photo', function (req, res){
	res = cors(res);
	var session = req.session;
	console.log(session);
	if(session.doctorID){
        photo = {
            image : [req.body.image]
        }
        //发送到图片服务器
        request('localhost', 5555, 'POST', '/picture/upload/', photo, function (data){
            if (data.success == true) {
                //保存本地数据库
	            Doctor.findOne({uuid: session.uuid}, function (err, doctor) {
	              if (err) return handleError(err);
	              if(doctor){
	                doctor.photo = data.paths[0];
	                doctor.save(function (err, doctor) {
	                  if (err) return handleError(err);
	                  var dataToCloud = {
	                    photo : doctor.photo,
	                    doctorID : doctor.doctorID,
	                  };
	                  //更新云服务器信息
	                  request(dataHost, dataPort, 'POST', '/api/doctor/update', dataToCloud, function (re) {
	                    if (re.result) {
	                      res.send({status : 'success', url : doctor.photo});
	                    } else {
	                      console.log("updato to cloud fail");
	                      res.send({status : "failure", message:'updato to cloud fail'});
	                    }
	                  });
	                });
	              } else {
	                res.send({status : 'failure', message : 'find doctor error'});
	              }
	            });
            } else {
                res.send({status : 'failure', message : 'image server error'});
            }
        });
	} else {
		//没有登录
		deleteFile(req.files.image.path);
		res.send({status:'failure', message:'please login first'});
	}
});

//====================
//医生端获取诊所信息
//====================
router.get('/clinic/info', function (req, res) {
	res = cors(res);
	var session = req.session;
	if (session.uuid && session.clinicID) {
		console.log('session clinicid : ' + session.clinicID);
		console.log('session uuid : ' + session.uuid);
		//查找医生所在诊所信息
		//请求诊所信息
		var postDataForClinic = {
			clinicID: session.clinicID
		}
		request(dataHost, dataPort, 'POST', '/api/clinic/cliinfo', postDataForClinic, function(clinicData) {
			if (clinicData.result == true) {
				//result为返回给前端的数据
				var result = {};
				//获取到的诊所信息
				var clinicInfo = clinicData.clinic;
				//科室信息
				var result = {
					name: clinicInfo.name,
					photo: clinicInfo.photo,
					introduction: clinicInfo.introduction,
					address: clinicInfo.address,
					phone: clinicInfo.phone,
					mark : clinicInfo.mark,
					department: [],
				}
				var depInfo = [];
				var counter = 0;
				if(clinicInfo.departments.length == 0){
					res.send({status: 'success', clinic: result});
				} else {
					for(var i = 0; i < clinicInfo.departments.length; i++){
						depInfo.push(clinicInfo.departments[i].name);
						counter++;
						if(counter == clinicInfo.departments.length) {
							result.department = depInfo;
							res.send({status: 'success', clinic: result});
						}
					}
				}
			} else {
				res.send({status: 'failure', message: 'request fail'});
			}
		});
	} else {
		res.send({status: 'failure', message: 'please login first'});
	}
});

//====================
//医生端获取科室信息
//====================
router.post('/clinic/department', function (req, res) {
	res = cors(res);
	var session = req.session;
	var dep = req.body.dep;
	if(dep){
		if (session.uuid && session.clinicID) {
			//查找医生所在诊所信息
			//请求诊所信息
			var postDataForDep = {
				clinicID: session.clinicID,
				departmentName : dep
			}
			request(dataHost, dataPort, 'POST', '/api/clinic/depinfo', postDataForDep, function(depData) {
				var doctorsInfo = [];
				var counter = 0;
				if (depData.result == true) {
					 for (var i = 0; i < depData.department.doctors.length; i++) {
			            Doctor.findOne({uuid : depData.department.doctors[i]}, function (err, doc) {
			              if (doc != null)
			                doctorsInfo.push({uuid : doc.uuid, name : doc.name});
			              counter++;
			              if (counter == depData.department.doctors.length)
			                res.send({status : "success",  dep: depData.department, doctors : doctorsInfo});
			            });
			          }
				} else {
					res.send({status: 'failure',message: 'request fail'});
				}
			});
		} else {
			res.send({status: 'failure',message: 'please login first'});
		}
	} else {
		res.send({status:'failure', message:'no deparment name'});
	}

});

//===================
//读取医生信息(医生移动端，用户移动端公用)
//===================
router.post('/info', function (req, res){
	res = cors(res);
	var doctorID = req.body.doctorID;
	if (doctorID) {
			Doctor.findOne({uuid : doctorID}, function (err, doctor){
			if(err){
				res.send({status:'fail', message:'error in finding a doctor'});
			}
			if(doctor) {
				//发送请求数据
				var postData = {
					doctorID : doctor.doctorID
				}
				//发送请求
				request(dataHost, dataPort, 'POST', '/api/doctor/info', postData, function (data){
					console.log('get doctor info : ' + data);
					if(data.result == true){
						var Monday = doctor.get('Monday');
						var Tuesday = doctor.get('Tuesday');
						var Wednesday = doctor.get('Wednesday');
						var Thursday = doctor.get('Thursday');
						var Friday = doctor.get('Friday');
						var Saturday = doctor.get('Saturday');
						var Sunday = doctor.get('Sunday');
						var result = {
							name : data.doctor.name,
							note : data.doctor.note,
							photo : data.doctor.photo,
							level: data.doctor.level,
							//从医患互动数据库拿freeTime数据
							Monday : Monday,
							Tuesday : Tuesday,
							Wednesday : Wednesday,
							Thursday : Thursday,
							Friday : Friday,
							Saturday : Saturday,
							Sunday : Sunday
						}
						Evaluate.aggregate(
							{$match:{doctorID:doctorID}},
							{$group:
								{_id:"$doctorID",
								averServe:{$avg:"$serve"},
								averResult:{$avg:"$result"},
								averPrice:{$avg:"$price"},
								count:{$sum:1}
						        }
						    },
					    function (err, item) {
					    	if (err) {
					    		console.log(err);
					    	}
					    	else {
					    		console.log(item);
					    		if (item.length > 0) {
					    		  var aver = (item[0].averPrice + item[0].averResult + item[0].averServe) / 3;
					    		  var count = item[0].count;
					    		}
					    		else {
					    		  var aver = 0;
					    		  var count = 0;
					    		}
					    		res.send({status : 'success', doctor : result, aver : aver, count : count});
					    	}
					    });
					} else {
						res.send({status : 'failure', message : data.message});
					}
				});
			} else {
				res.send({status : 'failure', message : 'no doctor found'});
			}
		});
	} else {
		res.send({status:'failure', message : 'not enough parameters'});
	}
});

//===================
//读取医生评分信息
//===================
router.post('/info/evaluate', function (req, res){
	res = cors(res);
	var doctoruuid = req.body.doctorID;
	if(doctoruuid) {
		Evaluate.find({doctorID : doctoruuid}, function (err, data){
			if(err) res.send({status:'failure', message:'find evaluate error'});
			if(data) {
				if(data.length == 0) {
					var evaluate = [];
					res.send({status:'success', evaluate : evaluate, message:'no evaluate found'})
				}
				else {
					var evaluateLen = data.length;
					var users = [];
					var counter = 0;
					for (var i = 0; i < data.length;i++){
						Patient.findOne({uuid:data[i].userID}, function (err, patient){
							if(err) {
								res.send({status:'failure', message:'find user name error'});
							}
							else if(patient) {
								//查重去重
								var usersLength = users.length;
								var flag = false;
								for(var i = 0; i < users.length; i++) {
									if(users[i].uuid == patient.uuid) {
										flag = true;
										break;
									}
								}
								if(!flag) {
									users.push({uuid:patient.uuid, name:patient.name, userID:patient.userID});
								}
								counter++;
								if(counter == evaluateLen) {
									res.send({status:'success', evaluate: data, patients: users});
								}
							} else {
								counter++;
								if(counter == evaluateLen) {
									res.send({status:'failure', message:'find user name error'});
								}
							}
						})
					}

				}
			} else {
				var evaluate = [];
				res.send({status:'success', evaluate : evaluate, message:'no evaluate found'})
			}
		});
	} else {
		res.send({status:'failure', message:'please post doctorID'});
	}
});


//===================
//诊所公告栏-标题
//===================
router.get('/announcement/latest', function (req, res) {
	res = cors(res);
	var session = req.session;
	if (session.uuid && session.clinicID) {
		//寻找医患互动数据库的公告信息
		Announcement.find({clinicID: session.clinicID}, function (err, data) {
			if (err) {
				res.send({status: 'failure',message: 'find announcement fail'});
			}
			if (data) {
				if(data.length == 0) {
					res.send({status:'success', message:'no announcement'});
				} else {
					var result = data;
					res.send({status: 'success',announcement: result[result.length - 1]});
				}
			}
		});
	} else {
		res.send({status: 'failure',message: 'please login first'});
	}
});

//===================
//诊所公告栏列表
//===================
router.get('/announcements', function (req, res) {
	res = cors(res);
	var session = req.session;
	if (session.uuid && session.clinicID) {
		//寻找医患互动数据库的公告信息
		Announcement.find({clinicID: session.clinicID}, function (err, data) {
			if (err) {
				res.send({status: 'failure',message: 'find announcement fail'});
			}
			if (data) {
				if(data.length == 0) {
					res.send({status:'success', message:'no announcement found'});
				} else {
					var postDataForClinic = {
						clinicID: session.clinicID
					}
					request(dataHost, dataPort, 'POST', '/api/clinic/cliinfo', postDataForClinic, function(clinicData) {
						if(clinicData.result == true){
							res.send({status: 'success',announcement: data, name:clinicData.clinic.name});
						} else {
							res.send({status:'failure', message:'request clinic data fail'});
						}
					});
				}
			} else {
				res.send({status: 'failure',message: 'no announcement found'});
			}
		});
	} else {
		res.send({status: 'failure',message: 'please login first'});
	}
});


//===================
//获取诊所留言板
//===================
router.get('/clinic/msgboard', function (req, res){
	res = cors(res);
	var session = req.session;
	if(session.uuid && session.clinicID){
		//查找医患互动数据库的留言板信息
		MessageBoard.find({clinicID : session.clinicID}, function (err, data){
			if(err) {
				res.send({status:'failure',message: 'find msgboard fail'});
			}
			if(data){
				var msginfo = [];
				var doctorinfo = [];
				var patientinfo = [];
				var counter = 0;
				// console.log(data.length);
				if(data.length == 0) {
					res.send({status:'success', message:'no msg found'});
				} else {
					for(var i = 0; i < data.length; i++) {
						if(data[i].isComplaint == false){
							if(data[i].doctorID){
								//拿到留言板数据
								msginfo.push({msg : data[i], reply : false});

								//获取医生的信息
								Doctor.findOne({uuid : data[i].doctorID}, function (err, doctor){
									if (err) res.send({status:'failure', message:'find doctor error'});
									else if (doctor) {
										doctorinfo.push({
											uuid : doctor.uuid,
											name : doctor.name,
											photo : doctor.photo
										});
										counter++;
										if(counter == data.length) {
											res.send({status:'success', msginfo:msginfo.reverse(), doctor:doctorinfo, patient:patientinfo});
										}
									}
									else {
										counter++;
										if(counter == data.length) {
											res.send({status:'success', msginfo:msginfo.reverse(), doctor:doctorinfo, patient:patientinfo});
										}
									}
								});
							} else if (data[i].userID) {
								//拿到留言板数据
								msginfo.push({msg : data[i], reply : true});

								//获取用户的信息
								Patient.findOne({uuid : data[i].userID}, function (err, patient){

									if (err) {
										res.send({status:'failure', message:'find patient error'});
									} else if (patient) {
										patientinfo.push({
											uuid: patient.uuid,
											name : patient.name,
											photo : patient.photo
										});
										counter++;
										if(counter == data.length) {
											res.send({status:'success', msginfo:msginfo.reverse(), doctor:doctorinfo, patient:patientinfo});
										}
									} else {
										counter++;
										if(counter == data.length) {
											res.send({status:'success', msginfo:msginfo.reverse(), doctor:doctorinfo, patient:patientinfo});
										}
									}
								});
							}
						} else if(data[i].isComplaint == true){
							counter++;
							if(counter == data.length) res.send({status:'success', msginfo:msginfo.reverse(), doctor:doctorinfo, patient:patientinfo});
						}
					}
				}
			} else {
				res.send({status:'failure',message:'no msg found'});
			}
		});
	} else {
		res.send({status:'failure', message:'please login first'});
	}
});


//===================
//回复诊所留言板
//===================
router.post('/clinic/msgboard', function (req, res){
	res = cors(res);
	var session = req.session;
	if(session.uuid && session.clinicID){
		if(req.body.msg) {
			var msg = new MessageBoard({
				messageBoardID : uuID.v1(),
				messageNote : req.body.msg,
				isComplaint : false,
				date : new Date(),
				userID : req.body.useruid,
				doctorID : req.session.uuid,
				clinicID : req.session.clinicID
			});
			msg.save(function (err, data){
				if (err) {
					console.log('error : in saving msg' + err);
					res.send({status:'failure', message:'fail to save msg'});
				}
				else if (data) {
					res.send({status:'success', msgBoradID : data.messageBoardID});
				} else {
					res.send({status:'failure', message:'fail to save msg'});
				}
			});
		} else {
			res.send({status:'failure', message:'no msg submit'});
		}
	} else {
		res.send({status:'failure',message:'please login first'});
	}
});

//===================
//获取诊所投诉栏
//===================
router.get('/clinic/complaint', function (req, res){
	res = cors(res);
	var session = req.session;
	if(session.doctorID && session.clinicID){
		//查找医患互动数据库的留言板信息
		MessageBoard.find({clinicID : session.clinicID}, function (err, data){
			if(err) {
				res.send({status:'failure',message: 'find complaint fail'});
			}
			if(data){
				var msginfo = [];
				var doctorinfo = [];
				var patientinfo = [];
				var counter = 0;
				if(data.length == 0) {
					res.send({status:'success', message:'no complaint found'});
				} else {
					for(var i = 0; i < data.length; i++) {
						if(data[i].isComplaint == true){
							if(data[i].doctorID){
								//拿到留言板数据
								msginfo.push({msg : data[i], reply : false});

								//获取医生的信息
								Doctor.findOne({uuid : data[i].doctorID}, function (err, doctor){
									if (err) res.send({status:'failure', message:'find doctor error'});
									else if (doctor) {
										doctorinfo.push({
											uuid : doctor.uuid,
											name : doctor.name,
											photo : doctor.photo
										});
										//计数器
										counter++;
										if(counter == data.length) res.send({status:'success', msginfo:msginfo.reverse(), doctor:doctorinfo, patient:patientinfo});
									} else {
										//计数器
										counter++;
										if(counter == data.length) res.send({status:'success', msginfo:msginfo.reverse(), doctor:doctorinfo, patient:patientinfo});
									}
								});
							} else if(data[i].userID){
								//拿到留言板数据
								msginfo.push({msg : data[i], reply : true});

								//获取用户的信息
								Patient.findOne({uuid : data[i].userID}, function (err, patient){
									if (err) res.send({status:'failure', message:'find patient error'});
									if (patient) {
										patientinfo.push({
											uuid: patient.uuid,
											name : patient.name,
											photo : patient.photo
										});
										//计数器
										counter++;
										if(counter == data.length) res.send({status:'success', msginfo:msginfo.reverse(), doctor:doctorinfo, patient:patientinfo});
									} else {
										counter++;
										if(counter == data.length) {
											res.send({status:'success', msginfo:msginfo.reverse(), doctor:doctorinfo, patient:patientinfo});
										}
									}
								});
							}
						} else if(data[i].isComplaint == false){
							counter++;
							if(counter == data.length) res.send({status:'success', msginfo:msginfo.reverse(), doctor:doctorinfo, patient:patientinfo});
						}
					}
				}
			} else {
				res.send({status:'failer',message:'no complaint found'});
			}
		});
	} else {
		res.send({status:'failure', message:'please login first'});
	}
});

//===================
//回复诊所投诉栏
//===================
router.post('/clinic/complaint', function (req, res){
	res = cors(res);
	var session = req.session;
	if(session.uuid && session.clinicID){
		if(req.body.msg) {
			var msg = new MessageBoard({
				messageBoardID : uuID.v1(),
				messageNote : req.body.msg,
				isComplaint : true,
				date : new Date(),
				userID : req.body.useruid,
				doctorID : req.session.uuid,
				clinicID : req.session.clinicID
			});
			msg.save(function (err, data){
				if (err) {
					console.log('error : in saving msg' + err);
					res.send({status:'failure', message:'fail to save msg'});
				}
				else if (data) {
					res.send({status:'success', msgBoradID : data.messageBoardID});
				} else {
					res.send({status:'failure', message:'fail to save msg'});
				}
			});
		} else {
			res.send({status:'failure', message:'no msg submit'});
		}
	} else {
		res.send({status:'failure',message:'please login first'});
	}
});

//===================
//查看预约
//===================
router.get('/bookings', function (req, res){
	res = cors(res);
	var session = req.session;
	if(session.uuid && session.clinicID){
		Booking.find({doctorID : session.uuid}, function (err, data){
			if(err){
				res.send({status:'failure', message:'find booking fail'});
			}
			if(data){
				if(data.length == 0) {
					res.send({status:'success', bookings:data});
				} else {
					var counter = 0;
					var userList = [];
					for(var i = 0; i < data.length; i++) {
						Patient.findOne({uuid : data[i].userID}, function (err, patient){
							// console.log(patient);
							if(err) return res.send({status:'failure', message:'fail to find a patient'});
							else if(patient) {
								var userInfo = {
									uuid : patient.uuid,
									photo : patient.photo,
									name : patient.name
								}
								userList.push(userInfo);
								// console.log(userList);
								counter++;
								if(counter == data.length) res.send({status:'success', bookings:data, userList : userList});
							} else {
								counter++;
								if(counter == data.length) res.send({status:'success', bookings:data, userList : userList});
							}
						});
					}
				}
			} else {
				res.send({status:'failure', message:'no booking found'});
			}
		});
	} else {
		res.send({status:'failure', message:'please login first'});
	}
});


//===================
//查看可预约时间表
//===================
router.get('/bookings/free', function (req, res){
	res = cors(res);
	var session = req.session;
	if(session.uuid && session.clinicID){
		Doctor.findOne({uuid : session.uuid}, function (err, doctor){
			if(err){
				res.send({status:'failure', message:'find doctor fail'});
			}
			if(doctor){
				var result = [];
				result.push({Monday : doctor.get('Monday'), date : GetDateStr(0)});
				result.push({Tuesday : doctor.get('Tuesday'), date : GetDateStr(1)});
				result.push({Wednesday : doctor.get('Wednesday'), date : GetDateStr(2)});
				result.push({Thursday : doctor.get('Thursday'), date : GetDateStr(3)});
				result.push({Friday : doctor.get('Friday'), date : GetDateStr(4)});
				result.push({Saturday : doctor.get('Saturday'),date :GetDateStr(5)});
				result.push({Sunday : doctor.get('Sunday'), date : GetDateStr(6)});
				res.send({status:'success', free:result});
			} else {
				res.send({status:'failure', message:'no doctor found'});
			}
		});
	} else {
		res.send({status:'failure', message:'please login first'});
	}
});
//===================
//查看可预约时间段
//===================
router.get('/bookings/freeList', function (req, res){
	res = cors(res);
	var session = req.session;
	if(session.uuid && session.clinicID){
		Doctor.findOne({uuid : session.uuid}, function (err, doctor){
			if(err){
				res.send({status:'failure', message:'find doctor fail'});
			}
			if(doctor){
				var result = [];
				//按日期星期几来push 进去
				var todayWeek = new Date().getDay();
				var todayDate = new Date();
				switch (todayWeek) {
					case 1:
						result.push({Monday : doctor.get('Monday'), date : GetDateStr(0)});
						result.push({Tuesday : doctor.get('Tuesday'), date : GetDateStr(1)});
						result.push({Wednesday : doctor.get('Wednesday'), date : GetDateStr(2)});
						result.push({Thursday : doctor.get('Thursday'), date : GetDateStr(3)});
						result.push({Friday : doctor.get('Friday'), date : GetDateStr(4)});
						result.push({Saturday : doctor.get('Saturday'),date :GetDateStr(5)});
						result.push({Sunday : doctor.get('Sunday'), date : GetDateStr(6)});
						res.send({status:'success', free:result, weekDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']});
						break;
					case 2:
						result.push({Tuesday : doctor.get('Tuesday'), date : GetDateStr(0)});
						result.push({Wednesday : doctor.get('Wednesday'), date : GetDateStr(1)});
						result.push({Thursday : doctor.get('Thursday'), date : GetDateStr(2)});
						result.push({Friday : doctor.get('Friday'), date : GetDateStr(3)});
						result.push({Saturday : doctor.get('Saturday'),date : GetDateStr(4)});
						result.push({Sunday : doctor.get('Sunday'), date : GetDateStr(5)});
						result.push({Monday : doctor.get('Monday'), date : GetDateStr(6)});
						res.send({status:'success', free:result, weekDay: [ 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday']});
						break;
					case 3:
						result.push({Wednesday : doctor.get('Wednesday'), date : GetDateStr(0)});
						result.push({Thursday : doctor.get('Thursday'), date : GetDateStr(1)});
						result.push({Friday : doctor.get('Friday'), date : GetDateStr(2)});
						result.push({Saturday : doctor.get('Saturday'),date : GetDateStr(3)});
						result.push({Sunday : doctor.get('Sunday'), date : GetDateStr(4)});
						result.push({Monday : doctor.get('Monday'), date : GetDateStr(5)});
						result.push({Tuesday : doctor.get('Tuesday'), date : GetDateStr(6)});
						res.send({status:'success', free:result, weekDay: [ 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday','Monday', 'Tuesday']});
						break;
					case 4:
						result.push({Thursday : doctor.get('Thursday'), date : GetDateStr(0)});
						result.push({Friday : doctor.get('Friday'), date : GetDateStr(1)});
						result.push({Saturday : doctor.get('Saturday'),date : GetDateStr(2)});
						result.push({Sunday : doctor.get('Sunday'), date : GetDateStr(3)});
						result.push({Monday : doctor.get('Monday'), date : GetDateStr(4)});
						result.push({Tuesday : doctor.get('Tuesday'), date : GetDateStr(5)});
						result.push({Wednesday : doctor.get('Wednesday'), date : GetDateStr(6)});
						res.send({status:'success', free:result, weekDay: [ 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday']});
						break;
					case 5:
						result.push({Friday : doctor.get('Friday'), date : GetDateStr(0)});
						result.push({Saturday : doctor.get('Saturday'),date : GetDateStr(1)});
						result.push({Sunday : doctor.get('Sunday'), date : GetDateStr(2)});
						result.push({Monday : doctor.get('Monday'), date : GetDateStr(3)});
						result.push({Tuesday : doctor.get('Tuesday'), date : GetDateStr(4)});
						result.push({Wednesday : doctor.get('Wednesday'), date : GetDateStr(5)});
						result.push({Thursday : doctor.get('Thursday'), date : GetDateStr(6)});
						res.send({status:'success', free:result, weekDay: [ 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']});
						break;
					case 6:
						result.push({Saturday : doctor.get('Saturday'),date : GetDateStr(0)});
						result.push({Sunday : doctor.get('Sunday'), date : GetDateStr(1)});
						result.push({Monday : doctor.get('Monday'), date : GetDateStr(2)});
						result.push({Tuesday : doctor.get('Tuesday'), date : GetDateStr(3)});
						result.push({Wednesday : doctor.get('Wednesday'), date : GetDateStr(4)});
						result.push({Thursday : doctor.get('Thursday'), date : GetDateStr(5)});
						result.push({Friday : doctor.get('Friday'), date : GetDateStr(6)});
						res.send({status:'success', free:result, weekDay: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']});
						break;
					case 0:
						result.push({Sunday : doctor.get('Sunday'), date : GetDateStr(0)});
						result.push({Monday : doctor.get('Monday'), date : GetDateStr(1)});
						result.push({Tuesday : doctor.get('Tuesday'), date : GetDateStr(2)});
						result.push({Wednesday : doctor.get('Wednesday'), date : GetDateStr(3)});
						result.push({Thursday : doctor.get('Thursday'), date : GetDateStr(4)});
						result.push({Friday : doctor.get('Friday'), date : GetDateStr(5)});
						result.push({Saturday : doctor.get('Saturday'),date : GetDateStr(6)});
						res.send({status:'success', free:result, weekDay: ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']});
						break;
					default:
						return 'error : not found';
				}
			} else {
				res.send({status:'failure', message:'no doctor found'});
			}
		});
	} else {
		res.send({status:'failure', message:'please login first'});
	}
});

//===================
//修改预约
//===================
router.post('/bookings/update', function (req, res){
	res = cors(res);
	var session = req.session;
	var bookingDay = req.body.bookingDay;//周几
	var bookingTime = req.body.bookingTime;//预约时间段
	var userID = req.body.userID;//用户登陆id
	var useruuid = '';//uuid要在数据库中找
	var bookingPeroid = '';
	var isFree = false;//是否空闲
	var isFindPeriod = false;//是否找到时间段
	//处理bookingID 有保持原来的，否则就新建一个bookingID
	var bookingID =  uuID.v1();
	if(req.body.bookingID) bookingID = req.body.bookingID;
	//处理bookingTime
	var bookingTimeString = '';
	if(bookingTime.split(' ').length == 2) {
		bookingTimeString = req.body.bookingTime.split(' ')[0] +' '+ weekToChinese(bookingDay) +' '+ req.body.bookingTime.split(' ')[1];
		bookingPeroid = req.body.bookingTime.split(' ')[1];
		if(session.uuid && session.doctorID){
			//发送请求数据
			var postData = {
				doctorID : session.doctorID
			}
			//发送请求
			request(dataHost, dataPort, 'POST', '/api/doctor/info', postData, function (data){
				if(data.result == true){
					if(req.body.bookingID){
						//修改预约
						isFree = true;
					} else {
						//新增预约
						//更新医生预约信息
						Doctor.findOne({uuid : session.uuid},function (err, doctor){
							if(doctor){
								if(doctor.get(bookingDay)){
									//遍历数组是否存在时间段
									for(var i = 0; i < doctor.get(bookingDay).length; i++){
										console.log('bookingPeriod : \n' + doctor.get(bookingDay)[i].time);
										console.log('req Period : \n' + bookingPeroid);

										if(doctor.get(bookingDay)[i].time == bookingPeroid){
											isFindPeriod = true;
											//是否空闲
											if(doctor.get(bookingDay)[i].count < doctor.get(bookingDay)[i].max){
												//更新空闲时间
												isFree = true;
												doctor.get(bookingDay)[i].count++;
												doctor.save(function (err){
													if(err) {
														console.log('error : saving doctor');
														res.send({status:'failure', message:'update doctor document error'});
													} else {
														//找到对应用户的uuid
														Patient.findOne({userID : userID}, function (err, patient){
															if(err){
																res.send({status:'failure', message:'find user error'});
															}
															if(patient){
																useruuid = patient.uuid;
																//判断医生的权限
																if((data.doctor.power == 1) && isFree){
																	var booking = new Booking({
																		bookingID : bookingID,
												                        bookingDay : new Date(),
												                        bookingTime : bookingTimeString,
												                        userID : useruuid,
												                        doctorID : session.uuid
																	});
																	booking.save(function (err, data){
																		if(err){
																			res.send({status:'failure', message:'error in saving booking'});
																		} else {
																			if(data){
																				res.send({status:'success', message:'update doctor && save booking ok'});
																			} else {
																				res.send({status:'failure', message:'error in saving booking'});
																			}
																		}
																	});
																} else {
																	res.send({status:'failure', message:'no right to update or no free time'});
																}
															} else {
																res.send({status:'failure', message:'find user fail'});
															}
														});
													}
												});
											} else {
												res.send({status:'failure', message:'no free time'})
											}
										}
										if((i == doctor.get(bookingDay).length - 1) && (isFindPeriod == false)){
											res.send({status:'failure', message:'no time period found'});
										}
									}
								} else {
									res.send({status:'failure', message:'find booking day fail'})
								}
							} else {
								res.send({status:'failure', message:'find doctor fail'})
							}
						});
					}
				} else {
					res.send({status:'failure', message:'request fail'});
				}
			});
		} else {
			res.send({status:'failure', message:'please login first'});
		}
	} else {
		res.send({status:'failure', message:'not enough parameters'});
	}

});

//===================
//删除预约
//===================
router.post('/bookings/delete', function (req, res){
	res = cors(res);
	var bookingID = req.body.bookingID;
	if(bookingID) {
		Booking.findOne({ bookingID : bookingID}, function (err, booking){
			if(err){
				res.send({status:'failure', mesage:'finding booking fail'});
			}
			if(booking){
				var doctoruuid = booking.doctorID;
				var bookingDay = weekToChinese(booking.bookingTime.split(' ')[1]);
				var timePeriod = booking.bookingTime.split(' ')[2];
				var isFound = false;
				//删除这个预约
				Booking.remove(booking, function (err){
					if(err) {
						res.send({status:'failure', message:'remove booking error'});
					} else {
						Doctor.findOne({ uuid : doctoruuid}, function (err, doctor){
							if(err) {
								res.send({status:'failure', message:'find doctor error'});
							}
							if(doctor){
								for(var i = 0; i < doctor.get(bookingDay).length; i++){
									if(doctor.get(bookingDay)[i].time == timePeriod){
										if(doctor.get(bookingDay)[i].count > 0){
											doctor.get(bookingDay)[i].count--;
										} else {
											res.send({status:'failure', message:'no booking found in doctor'});
										}
										doctor.save(function (err, data){
											if(err) {
												res.send({status:'failure', message:'update doctor fail'});
											}
											if(data) {
												res.send({status:'success', message:'remove success'});
											}
										})
									}
								}
							} else {
								res.send({status:'failure', message:'no doctor found'});
							}
						});
					}
				});

			} else {
				res.send({sattus:'failure', message:'no booking found'});
			}
		});
	} else {
		res.send({status:'failure', message:'not enough parameter'})
	}
});

//===================
//修改空闲时间
//===================
router.post('/bookings/time', function(req, res){
	res = cors(res);
	var session = req.session;
	var isExist = false;//时间段是否存在
	if(session.uuid){
		var bookingDay = req.body.bookingDay;     //星期几
		var timePeriod = req.body.timePeriod;     //修改时间段
		var max = req.body.max;                   //最大人数
		// console.log(req.body);
		//判断三个参数是否存在
		if(bookingDay && timePeriod && max){
			Doctor.findOne({uuid: session.uuid}, function (err, doctor){
				if(err) {
					console.log('error : finding doctor error');
					res.send({status:'failure', message:'fail to find the doctor'});
				}
				if(doctor) {
					var update = {
						time : timePeriod,
						max : max,
						count : 0,
					};
					//修改的星期几
					if(doctor.get(bookingDay)){
						//寻找时间段是否存在
						for(var i = 0; i < doctor.get(bookingDay).length; i++){
							// console.log('time : ' + doctor.get(bookingDay)[i]);
							if(doctor.get(bookingDay)[i].time == timePeriod){
								isExist = true;
								//是否有人预约
								if(doctor.get(bookingDay)[i].count == 0){
									//无人预约更新时间段
									//若为0则删除
									// console.log('max: ' + doctor.get(bookingDay)[i].max);
									if(update.max == 0) {
										doctor.get(bookingDay).splice(i,1);
										doctor.save(function (err){
											if(err){
												console.log('error : ' + err);
												res.send({status:'failure', message:'删除时间段失败'});
											} else {
												res.send({status:'success', message:'删除时间段成功'});
											}
										});
									} else {
										doctor.get(bookingDay)[i].count = update.count;
										doctor.get(bookingDay)[i].time = update.time;
										doctor.get(bookingDay)[i].max = update.max;
										doctor.save(function (err){
											if(err){
												console.log('error : ' + err);
												res.send({status:'failure', message:'更新时间段失败'});
											} else {
												res.send({status:'success', message:'更新时间段成功'});
											}
										});
									}
								} else {
									res.send({status:'failure', message:'修改失败 请先删除时间段内的预约再删除时间段'});
								}
							}
						}
						//不存在则需要新建
						if(isExist == false){
							if (update.max == 0) {
								res.send({status:'success', message:'添加预约时间段成功'});
							} else {
								//新建一个时间段
								doctor.get(bookingDay).push(update);
							    doctor.save(function (err){
									if(err){
										console.log('error : ' + err);
										res.send({status:'failure', message:'添加预约时间段失败'});
									} else {
										res.send({status:'success', message:'添加预约时间段成功'});
									}
								});
							}
						}
					} else {
						res.send({status:'failure', message:'寻找预约日期出错'});
					}
				} else {
					res.send({status:'failure', message:'找不到医生'});
				}
			});
		} else {
			res.send({status:'failure', message:'not enough parameter'});
		}
	} else {
		res.send({status:'failure', message:'请先登录'});
	}
});

//===================
//获取用户的loginID 预约用
//===================
router.post('/bookings/userID', function(req, res){
	res = cors(res);
	var session = req.session;
	if(session.uuid && session.clinicID){
		var useruuid = req.body.useruuid;
		Patient.findOne({ uuid : useruuid}, function (err, patient){
			console.log(patient);
			if(err) {
				res.send({status:'failure', message:'find patient error'})
			}
			else if(patient){
				res.send({status : 'success', phone : patient.userID , name:patient.name});
			} else {
				res.send({status:'failure', message:'patient not found'});
			}
		});
	} else {
		res.send({status:'failure', message:'请先登录'});
	}
});
//===================
//使用抵扣券
//===================



router.post('/coupon/time', function(req, res){
});

// router.get('/test', function(req, res){
// 	res = cors(res);
	// var myDate = new Date();
	// console.log(testCount);
	// console.log('old ' + oldTime);
	// console.log('new ' + myDate.toLocaleString());
	// if(testCount == 0){
	// 	console.log('begin / end');
	// 	oldTime = myDate.toLocaleString();
	// 	res.send();
	// }
	// if (myDate.toLocaleString() == oldTime) {
	// 	testCount++;
	// 	console.log('after:' + testCount);
	// 	res.send();
	// } else {
	// 	console.log('end : ' + testCount);
	// 	testCount = 0;
	// 	oldTime = myDate.toLocaleString();
	// 	res.send();
	// }
	// for(var i =0 ;i < 100000; i++) {
	// 	// console.log('ok');
	// 	request('192.168.0.199', '9000', 'GET', '/doctor/test', {}, function (){
	//   		var myDate = new Date();
	// 		// console.log(testCount);
	// 		// console.log('old ' + oldTime);
	// 		// console.log('new ' + myDate.toLocaleString());
	// 		if(testCount == 0){
	// 			console.log('begin / end');
	// 			oldTime = myDate.toLocaleString();
	// 			// res.send();
	// 		}
	// 		if (myDate.toLocaleString() == oldTime) {
	// 			testCount++;
	// 			console.log('after:' + testCount);a
	// 			// res.send();
	// 		} else {
	// 			console.log('end : ' + testCount);
	// 			testCount = 0;
	// 			oldTime = myDate.toLocaleString();
	// 			// res.send();
	// 		}
	//   	});
	// }
	// res.send();

// });

//========
//日期
//========
// function GetDateStr(AddDayCount) {
//     var dd = new Date();
//     dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期
//     var y = dd.getFullYear();
//     var m = dd.getMonth()+1;//获取当前月份的日期
//     var d = dd.getDate();
//     return y+"-"+m+"-"+d;
// }
