//=====================================
//function:   patient
//=====================================

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    http = require('http'),
    querystring = require('querystring'),
    authorize = require('../publicfunc/authorize'),
    cors = require('../publicfunc/cors'),
    crypto = require('../publicfunc/crypto'),
    Patient = mongoose.model('Patient'),
    Doctor = mongoose.model('Doctor'),
    Booking = mongoose.model('Booking'),
    Announcement = mongoose.model('Announcement'),
    MessageBoard = mongoose.model('MessageBoard'),
    Evaluate = mongoose.model('Evaluate'),
    Feedback = mongoose.model('Feedback'),
    Member = mongoose.model('Member'),
    async = require('async'),
    uuID = require('node-uuid'),
    GetDateStr = require('../publicfunc/getDateStr'),
    requestData = require('../publicfunc/accessData'),
    deleteFile = require('../publicfunc/deleteFile'),
    request = require('../publicfunc/doctorRequest'),
    getDateCount = require('../publicfunc/getDateCount'),
    getDateStr = require('../publicfunc/getDateStr'),
    weekToChinese = require('../publicfunc/weekToChinese'),
    fileToBase64 = require('../publicfunc/fileToBase64');

var host = 'localhost';
var httpUrl = '';
var port = 8081;
var photoHost = 'localhost';
var photoPort = 5555;

module.exports = function (app) {
  app.use('/patient', router);
};

//病人注册模块
router.post('/register', function (req, res) {
  res = cors(res);
  var login_id = req.body.login_id;
  var login_pw = req.body.login_pw;
  if (login_id && login_pw) {
    //sha1 加密密码
    var sh1_PW = crypto(login_pw);
    var data = JSON.stringify({
      userID : login_id,
      password : sh1_PW
    });
    var path = '/api/user/register';
    var method = 'POST';

    requestData(host, port, path, method, data, function (re) {
      if (re.result) {
        var patient = new Patient({
          uuid : re.uuid,
          userID : login_id,
          name : login_id
        });
        patient.save(function (err) {
          if (!err) {
            res.send({status : "success", uuid : re.uuid});
          }
        });
      } else
        res.send({status : "failure", message : re.message});
    });
  } else {
    res.send({status : "failure"});
  }
});


//病人登录模块
router.post('/login', function (req, res) {
  res = cors(res);
  var login_id = req.body.login_id;
  var login_pw = req.body.login_pw;
  if (login_id && login_pw) {
    //sha1 加密密码
    var sh1_PW = crypto(login_pw);
    var data = JSON.stringify({
      userID : login_id,
      password : sh1_PW
    });
    var path = '/api/user/login';
    var method = 'POST';

    requestData(host, port, path, method, data, function (re) {
      if (re.result) {
        req.session.uuid = re.uuid;
        req.session.loginID = login_id;


        var data = JSON.stringify({
              userID : login_id
            });
            var path = '/api/user/info';
            var method = 'POST';

        requestData(host, port, path, method, data, function (rec) {
          if (rec.result) {
            var name;
            if (rec.user.name == '') name = rec.user.userID;
            else name = rec.user.name;
            Patient.findOneAndUpdate({userID : rec.user.userID},
                                     {$set : {name : name, photo : rec.user.photo}}, function (err, item) {
                                      if (err) {
                                        res.send({status : "failure", message : "update user fail"});
                                      } else {
                                        res.send({status : "success", uuid : rec.uuid, login_id : login_id});
                                      }
                                     });
          } else {
            console.log(rec.message);
            res.send({status : "failure", message:re.message});
          }
        });
      } else {
        res.send({status : "failure"});
      }
    });
  } else {
    res.send({status : "failure"});
  }
});


//病人登出模块
router.post('/logout', function (req, res) {
  res = cors(res);
  // var loginID = req.body.login_id;
  var loginID = req.session.loginID;
  if (loginID) {
    req.session.uuid = null;
    req.session.loginID = null;
    res.send({status: "success"});
  } else {
    res.send({status : "failure"});
  }
});


//用户中心
router.post('/userCenter', function (req, res) {
  res = cors(res);
  // var loginID = req.body.login_id;
  var loginID = req.session.loginID;
  if (loginID) {
    res.send({status : "success"});
  } else {
    res.send({stutas : "failure"});
  }
});


//用户个人信息
router.post('/userInfo', function (req, res) {
  res = cors(res);
  // var loginID = req.body.login_id;
  var loginID = req.session.loginID;
  console.log(loginID);
  if (loginID) {
    var data = JSON.stringify({
      userID : loginID
    });
    var path = '/api/user/info';
    var method = 'POST';

    requestData(host, port, path, method, data, function (re) {
      if (re.result) {
        var name;
        if (re.user.name == '') name = re.user.userID;
        else name = re.user.name;
        Patient.findOneAndUpdate({userID : re.user.userID},
                                 {$set : {name : name, photo : re.user.photo}}, function (err, item) {
                                  if (err) {
                                    res.send({status : "failure", message : "update user fail"});
                                  } else {
                                    res.send({status : "success", message : re.user});
                                  }
                                 });
      } else {
        console.log(re.message);
        res.send({status : "failure"});
      }
    });
  } else {
    res.send({status : "failure", message : loginID});
  }
});

//更新用户信息
router.post('/userUpdate', function (req, res) {
  res = cors(res);
  // var loginID = req.body.login_id;
  var loginID = req.session.loginID;
  if (loginID) {
    var name = req.body.name;
    var gender = req.body.gender;
    var mobilePhone = req.body.mobilePhone;
    var mail = req.body.mail;
    var nickname = req.body.nickname;

    var data = JSON.stringify({
      userID : loginID,
      name : name,
      gender : gender,
      mobilePhone : mobilePhone,
      mail : mail,
      nickname : nickname
    });
    var path = '/api/user/update';
    var method = 'POST';

    requestData(host, port, path, method, data, function (re) {
      if (re.result) {
        res.send({status : "success"});
      } else {
        console.log("update failure");
        res.send({status : "failure"});
      }
    });
  } else {
    console.log("has not login");
    res.send({status : "failure"});
  }
});

//诊所信息
router.get('/clinicInfo', function (req, res) {
    res = cors(res);
    var clinic_id = req.query.clinic_id;
    console.log(clinic_id);
    if (clinic_id) {
      var data = JSON.stringify({
        clinicID : clinic_id
      });
      var path = '/api/clinic/cliinfo';
      var method = 'POST';

      requestData(host, port, path, method, data, function (re) {
        if (re.result) {
            MessageBoard.find({clinicID : re.clinic.clinicID}, function (err, data) {
                var patientinfo = [],
                    doctorinfo = [],
                    msginfo = [],
                    funcs = new Array();
                if (err) {
                    res.send({status : "success", message : re.clinic, messageBoard : ""});
                } else {
                    var addMsg = function (arg) {
                        return function (cb) {
                            if (arg.doctorID) {
                                msginfo.push(arg);
                                Doctor.findOne({uuid : arg.doctorID}, function (err, doctor){
                                    if (err) console.log('find doctor error');
                                    else if (doctor) {
                                        var pd = true;
                                        for (var i = 0; pd && i < doctorinfo.length; i++)
                                            if (doctor.uuid == doctorinfo[i].uuid)
                                                pd = false;
                                        if (pd) doctorinfo.push({
                                            uuid : doctor.uuid,
                                            name : doctor.name,
                                            photo : doctor.photo
                                        });
                                    }
                                    cb(null, 1);
                                });
                            } else {
                                msginfo.push(arg);
                                Patient.findOne({uuid : arg.userID}, function (err, patient){
                                    if (err) console.log('find patient error');
                                    else if (patient) {
                                        var pd = true;
                                        for (var i = 0; pd && i < patientinfo.length; i++)
                                            if (patient.uuid == patientinfo[i].uuid)
                                                pd = false;
                                        if (pd) patientinfo.push({
                                            uuid: patient.uuid,
                                            name : patient.name,
                                            photo : patient.photo
                                        });
                                    }
                                    cb(null, 1);
                                });
                            }
                        }
                    }
                    for(var i = 0; i < data.length; i++)
                        funcs.push(addMsg(data[i]));
                    async.series(
                        funcs,
                        function (err, result) {
                            console.log('add end');
                            console.log(re);
                            res.send({status:'success', message:re.clinic, messageBoard:msginfo.reverse(), doctor:doctorinfo, patient:patientinfo});
                        }
                    );
                    console.log("query clinic info success");
                }
            });
        } else {
          res.send({status : "failure"});
        }
      });
    } else {
      res.send({status : "failure"});
    }
});

//具体科室的信息
router.get('/department', function (req, res) {
    res = cors(res);
    var clinicID = req.query.clinic_id;
    var departmentName = req.query.department_name;
    if (clinicID && departmentName) {
      var data = JSON.stringify({
        clinicID : clinicID,
        departmentName : departmentName
      });
      var path = '/api/clinic/depinfo';
      var method = 'POST';

      requestData(host, port, path, method, data, function (re) {
        if (re.result) {
          console.log("query department info success");
          var val = [];
          var p = 0;
          console.log(re.department.doctors.length);
          if (re.department.doctors.length !== 0) {
            for (var i = 0; i < re.department.doctors.length; i++) {
              Doctor.findOne({uuid : re.department.doctors[i]}, function (err, doc) {
                console.log(doc);
                if (doc != null)
                  val.push({uuid : doc.uuid, name : doc.name});
                p++;
                if (p == re.department.doctors.length){
                  
                  res.send({status : "success", message : re.department, val : val});
                }
              });
            }
          } else {
            res.send({status : 'success', message : re.department, val : val});
          }
        } else {
          res.send({status : "failure"});
        }
      });
    } else {
      res.send({status : "failure"});
    }
});

//添加医生
router.post('/adddoctor', function (req, res) {
  var uuid = req.body.uuid;
  var doctorID = req.body.doctorID;
  Doctor.create({
    uuid : uuid,
    doctorID : doctorID
  }, function (err, item) {
    if (!err)
      res.send({status : "success"});
  });
});

//=========================上面需要与数据中心对接数据===========================================

//病人与医生预约
router.post('/patientBooking', function (req, res) {
  res = cors(res);
  var userID = req.session.loginID;
  var uuid = req.session.uuid;
  var doctoruuid = req.body.doctor_uuid;
  if (userID && uuid && doctoruuid) {
    Doctor.findOne({uuid : doctoruuid}, function (err, doc) {
      if (err) {
        console.log("find doctor error: " + err);
        res.send({status : "failure", message : "find doctor failure"});
      } else if (doc) {
        var bookingDay = req.body.booking_day,
            bookingTime = req.body.booking_time;
        var num = getDateCount(bookingDay); //与当前日期比，相差的天数
        var date = getDateStr(num); //获取num天之后的日期
        var bookingDT = date + " " + weekToChinese(bookingDay) + " " + bookingTime;
        Booking.find({userID : uuid, bookingIW : bookingDay, bookingTime : bookingDT}, function (err, item) {
          if (err || item.length > 0) {
            console.log(item);
            res.send({status : "failure", message : 'booking is exist or err'});
          } else {
            console.log(item);
            booking = new Booking({
              bookingID : uuID.v1(),
              bookingDay : new Date(),
              bookingIW : bookingDay,
              bookingTime : bookingDT,
              userID : uuid,
              doctorID : doctoruuid
            });
          // var doc = JSON.stringify(doc);
          // var doc = JSON.parse(doc);
          // console.log(typeof(doc));
          // console.log(bookingDay + "===" + doc + "===" + doc[bookingDay]+ " " + doc.name);
          booking.save(function (err) {
            if (err) {
              console.log("save doctor error: " + err);
            } else {
              for (var i = 0; i < doc[bookingDay].length; i++) {
                if (doc[bookingDay][i].time == bookingTime &&
                   doc[bookingDay][i].count < doc[bookingDay][i].max) {
                  doc[bookingDay][i].count++;
                  doc.save(function (err) {
                    if (err) {
                      console.log("save doctor failure error: " + err);
                      booking.remove(function (err) {
                        if (!err) {
                          doc[bookingDay][i].count--;
                          doc.save(function (err) {
                            if (!err)
                              res.send({status : "failure", message : "save doctor failure"});
                          });
                        }
                      });
                    } else {
                      // pjpush(userID,'新的预约，预约的医生：'+doc.name+',预约的时间：'+bookingTime, function(err, sre) {
                      //   console.log(sre);
                      // });
                      // djpush(doc.doctorID,'新的预约提醒，预约的时间：'+bookingTime, function(err, sre) {
                      //   console.log(sre);
                      // });
                      res.send({status : "success", bookingID : booking.bookingID});
                    }
                  });
                }
              }
            }
          });
          }
        });
      }
    });
  } else {
    res.send({status : "failure", message : 'user has not login!'});
  }
});

//病人查看自己的预约
router.post('/bookingInfo', function (req, res) {
  res = cors(res);
  if (req.session.loginID) {
    Booking.find({userID : req.session.uuid}, function (err, b) {
      if (err) {
        console.log("get booking message err: " + err);
        res.send({status : "failure"});
      } else {
        res.send({status : "success", bookings : b});
      }
    });
  } else {
    //if not login
    res.send({status : "failure"});
  }
});

//查看预约详情
router.post('/bookingInDe', function (req, res) {
  res = cors(res);
  var userID = req.session.uuid;
  var bookingID = req.body.booking_id;
  if (userID) {
    Booking.findOne({bookingID : bookingID}, function (err, booking) {
      if (err) {
        res.send({status : "failure", message : "find booking fail"});
      } else {
        if (booking != null) {
          Doctor.findOne({uuid : booking.doctorID}, function (err, doc) {
            if (err) {
              res.send({status : "failure", message : "find doctor fail"});
            } else {
              if (doc != null) {
                var data = JSON.stringify({
                 doctorID : doc.doctorID
                });
                var path = '/api/doctor/info';
                var method = 'POST';

                requestData(host, port, path, method, data, function (red) {
                  if (red.result){
                    var data = JSON.stringify({
                      clinicID : red.doctor.clinicID
                    });
                    var path = '/api/clinic/cliinfo';
                    var method = 'POST';

                    requestData(host, port, path, method, data, function (rec) {
                      if (rec.result) {
                        console.log("query clinic info success");
                        res.send({status : "success", booking : booking, doctor : rec.doctor, clinic : rec.clinic});
                      } else {
                        res.send({status : "failure"});
                      }
                    });
                  }
                });
              }
            }
          });
        }
      }
    });
  }
});

//病人取消预约
router.post('/delBooking', function (req, res) {
  res = cors(res);
  var userID = req.session.uuid;
  var bookingID = req.body.booking_id;
  if (userID) {
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
    res.send({status : "failure", message : "user has not login"});
  }
});

//诊所公告
router.get('/clinicAnnouncement', function (req, res) {
  res = cors(res)
  var clinicID = req.query.clinic_id;
  if (clinicID) {
    Announcement.find({clinicID : clinicID}, function (err, a) {
      if (err) {
        concole.log("get announcement err: " + err);
        res.send({status : "failure"});
      } else {
        res.send({status : "success",
                 annuoncements : a
               });
      }
    });
  } else {
    res.send({status : "failure"});
  }
});

//病人留言
router.post('/leaveMessage', function (req, res) {
  res = cors(res);
  if (req.session.loginID) {
    var clinicID = req.body.clinic_id;
    var message = req.body.message;
    if (message && clinicID) {
      var message = new MessageBoard({
                          messageBordID : uuID.v1(),
                          messageNote : message,
                          isComplaint : req.body.isComplaint,
                          date : new Date(),
                          userID : req.session.uuid,
                          clinicID : clinicID
                        });
      message.save(function (err, m) {
        if (err) {
          console.log("save message err: " + message);
          res.send({status : "failure"});
        } else {
          res.send({status : "success", messageBoard : m});
        }
      });
    } else {
      console.log(clinicID + " " + message)
      res.send({status : "failure", message : "message or clinicID is empty"});
    }
  } else {
    res.send({status : "failure", message : "user has not login"});
  }
});

//留言列表
router.post('/messageList', function (req, res) {
  res = cors(res);
  var usrID = res.session.uuid;
  if (userID) {
    MessageBord.find({userID : userID}, function (err, item) {
      if (err) {
        res.send({status : "failure", message : "find message fail"});
      } else if (item) {
        res.send({status : "success", message : item});
      }
    });
  } else {
    res.send({status : "failure", message : "user has not login"});
  }
});

//病人的评价
router.post('/evaluate', function (req, res) {
  res = cors(res);
  if (req.session.loginID) {
    var evaluateNote = req.body.evaluateNote;
    var doctoruuid = req.body.doctorID;
    var isFree = req.body.isFree;
    var serve = req.body.serve;
    var result = req.body.result;
    var price = req.body.price;

    var evaluate = new Evaluate({
      evaluateID : uuID.v1(),
      evaluateNote : evaluateNote,
      date : new Date(),
      userID : req.session.uuid,
      doctorID : doctoruuid,
      isFree : isFree,
      serve : serve,
      result : result,
      price : price
    });

    evaluate.save(function (err, e) {
      if (err) {
        console.log('save evaluate err: ' + err);
        res.send({status : "failure"});
      } else {
        if(e) {
          Patient.findOne({uuid:e.userID}, function (err, patient){
              if(err) {
                res.send({status:'failure', message:'find user name error'});
              }
              else if(patient) {
                res.send({status : "success", message : e, name: patient.name, userID: patient.userID});
              } else {
                res.send({status : "failure", message : 'find patient fail'});
              }
            });
        } else {
          res.send({status : "failure"});
        }
      }
    });
  } else {
    res.send({status : "failure"});
  }
});

//===================
//修改头像
//===================
router.post('/photo', function (req, res){
  res = cors(res);
  var session = req.session;
  if(session.loginID){
    if(req.body.image){
      photo = {
          image : [req.body.image]
      }
      //发送到图片服务器
      request('localhost', 5555, 'POST', '/picture/upload/', photo, function (data){
          if (data.success == true) {
            //保存本地数据库
            Patient.findOne({uuid:session.uuid}, function (err, patient) {
              if (err) return handleError(err);
              if(patient){
                patient.photo = data.paths[0];
                patient.save(function (err, patient) {
                  if (err) return handleError(err);
                  var data = JSON.stringify({
                    photo : patient.photo,
                    userID : patient.userID,
                  });
                  var path = '/api/user/update';
                  var method = 'POST';
                  //更新云服务器信息
                  requestData(host, port, path, method, data, function (re) {
                    if (re.result) {
                      res.send({status : 'success', url : patient.photo});
                    } else {
                      console.log("updato to cloud fail");
                      res.send({status : "failure", message:'updato to cloud fail'});
                    }
                  });
                });
              } else {
                res.send({status : 'failure', message : 'find patient error'});
              }
            });
          } else {
              res.send({status : 'failure', message : 'image server error'});
          }
      });
    } else {
      res.send({status:'failure', message:'no photo upload'});
    }

  } else {
    //没有登录
    deleteFile(req.files.image.path);
    res.send({status:'failure', message:'please login first'});
  }
});

//==============家庭健康模块======================

//添加家庭成员
router.post('/addMember', function (req, res) {
  res = cors(res);
  var userID = req.session.uuid;
  if (userID) {
    var name = req.body.name,
        relationship = req.body.relationship;
    member = new Member({
      memberID : uuID.v1(),
      userID : userID,
      name : name,
      relationship : relationship
    });

    member.save(function (err, item) {
      if (err) {
        console.log("save member error: " + err);
        res.send({status : "failure", message : "save the member fail"});
      } else {
        res.send({status : "success", message : "add member successful", member : item});
      }
    });
  } else {
    res.send({status : "failure", message : "user does not login"});
  }
});

//删除家庭成员
router.post('/delMember', function (req, res) {
  res = cors(res);
  var userID = req.session.uuid;
  if (userID) {
    var memberID = req.body.memberID;
    Member.findOneAndRemove({memberID : memberID}, function (err) {
      if (err) {
        console.log('find member err:' + err);
        res.send({status : 'failure', message : 'find member err'});
      } else {
        res.send({status : 'success', message : 'delete the member successful'});
      }
    });
  } else {
    console.log('user has not login');
    res.send({status : 'failure', message : 'user has not login'});
  }
});

//查看所有成员
router.post('/memberList', function (req, res) {
  res = cors(res);
  var userID = req.session.uuid;
  if (userID) {
    Member.find({userID : userID}, function (err, item) {
      if (err) {
        res.send({status : "failure", message : "not menber found"})
      } else{
        res.send({status : "success", members : item});
      }
    });
  } else {
    res.send({status : "failure", message : "has not login"});
  }
});

//查看成员数据
router.post('/memberhel', function (req, res) {
  res = cors(res);
  var userID = req.session.uuid;
  var memberID = req.body.memberID;
  if (userID && memberID) {
    Member.find({userID : userID, memberID : memberID}, function (err, mem) {
      if (err) {
        console.log("find member error:" + err);
        res.send({status : "failure", message : "find member error"});
      } else if (mem) {
        res.send({status : "success", member : mem});
      } else {
        res.send({status : "failure", message :'not found'});
      }
    });
  } else {
    res.send({status : "failure", message :' not enough params'});
  }
});

//更改基本成员基本资料
router.post('/updateMem', function (req, res) {
  res = cors(res);
  if (req.session.uuid) {
    var name = req.body.name,
        relationship = req.body.relationship,
        gender = req.body.gender,
        birthday = req.body.birthday,
        height = req.body.height,
        weight = req.body.weight;
    var memberID = req.body.memberID;

    Member.findOneAndUpdate({userID : req.session.uuid, memberID : memberID}, {$set : {
          name : name,
          relationship : relationship,
          gender : gender,
          birthday : birthday,
          height : height,
          weight : weight
        }}, function (err, mem) {
      if (err) {
        console.log("find menber error: " + err);
        res.send({status : "failure", message : "update member fail"});
      } else if(mem){
        console.log(mem);
        res.send({status : "success", member : mem});
      } else {
        res.send({status : "failure", message :'update fail'});
      }
    });
  } else {
    res.send({status : "failure", message : "user has not login"});
  }
});

//添加血压数据
router.post('/addbp', function (req, res) {
  res = cors(res);
  if (req.session.uuid) {
    var userID = req.session.uuid,
        name = req.body.name,
        dbp = req.body.dbp,
        sbp = req.body.sbp,
        heartRate = req.body.heartRate;
    var memberID = req.body.memberID;
    Member.findOne({userID : userID, memberID : memberID}, function (err, mem) {
      if (err) {
        console.log("find member error: " + err);
        res.send({status : "failure", message : "find member fail"});
      } else if (mem) {
        mem.bloodPressure.push({dbp : dbp,
                                sbp : sbp,
                                heartRate : heartRate,
                                date : new Date()});
        mem.save(function (err) {
          if (err) {
            console.log("save member error: " + err);
            res.send({status : "failure", message : "save member fail"});
          } else {
            res.send({status : "success", member : mem});
          }
        });
      } else {
        res.send({status : "failure", messge : "add fail"});
      }
    });
  } else {
    res.send({status : "failure", messge : "user has not login"});
  }
});

//添加血糖数据
router.post('/addbg', function (req, res) {
  res = cors(res);
  if (req.session.uuid) {
    var userID = req.session.uuid,
        name = req.body.name,
        record = req.body.record;
     var memberID = req.body.memberID;
    Member.findOne({userID : userID, memberID : memberID}, function (err, mem) {
      if (err) {
        console.log("find member error: " + err);
        res.send({status : "failure", message : "find member fail"});
      } else if (mem){
        mem.bloodSugar.push({record : record,
                             date : new Date()});
        mem.save(function (err, mem) {
          if (err) {
            console.log("save member error: " + err);
            res.send({status : "failure", message : "save member fail"});
          } else {
            res.send({status : "success", member : mem});
          }
        });
      } else {
        res.send({status : "failure", message : 'add fail'});
     }
    });
  } else {
    res.send({status : "failure", messge : "user has not login"});
  }
});

//添加标签
router.post('/addLabel', function (req, res) {
  res = cors(res);
  if (req.session.uuid) {
    var userID = req.session.uuid,
        name = req.body.name,
        label = req.body.label;
    var memberID = req.body.memberID;
    Member.findOne({userID : userID, memberID : memberID}, function (err, mem) {
      if (err) {
        console.log("find member error: " + err);
        res.send({status : "failure", message : "find menmber failure"});
      } else if (mem) {
        mem.label.push(label);
        mem.save(function (err) {
          if (err) {
            console.log("save member error: " + err);
            res.send({status : "failure", message : "save member fail"});
          } else {
            res.send({status : "success", member : mem});
          }
        });
      } else {
        res.send({status : "failure", message : "add fail"});
      }
    });
  } else {
    res.send({status : "failure", message : "user has not login"});
  }
});

//清空标签
router.post('/clearLabel', function (req, res) {
  res = cors(res);
  if (req.session.uuid) {
    var userID = req.session.uuid;
    Member.findOne({userID : userID}, function (err, item) {
      if (err) {
        res.send({satus : "failure", message : "find member fail"});
      } else {
        item.label = [];
        item.save(function(err) {
          if (err) {
            res.send({satus : "failure", message : "save member fail"});
          } else {
            res.send({status : "success"});
          }
        })
      }
    });
  } else {
    res.send({status : "failure", message : "user has not login"});
  }
});

//反馈信息
router.post('/feedback', function(req, res){
  res = cors(res);
  if(req.body.message && req.body.contact){
    var newFeedback = new Feedback({
      message : req.body.message,
      contact : req.body.contact,
    });
    newFeedback.save(function (err, msg){
      if(err){
        res.send({status:'failure',message:'save error'});
      } else if(msg) {
        res.send({status:'success'});
      }
    });
  } else {
    res.send({status:'failure',message:'not enought params'});
  }

})

//查看可预约时间
router.post('/doctorFreeList', function (req, res){
  res = cors(res);
  var session = req.session;
  if(req.body.doctorID){
    Doctor.findOne({uuid : req.body.doctorID}, function (err, doctor){
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
