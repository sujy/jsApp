//=====================================
//function:   to search the doctors
//=====================================

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    http = require('http');
    querystring = require('querystring'),
    authorize = require('../publicfunc/authorize'),
    cors = require('../publicfunc/cors'),
    crypto = require('../publicfunc/crypto'),
    Patient = mongoose.model('Patient'),
    Doctor = mongoose.model('Doctor'),
    Booking = mongoose.model('Booking'),
    Announcement = mongoose.model('Announcement'),
    messageBoard = mongoose.model('MessageBoard'),
    Evaluate = mongoose.model('Evaluate'),
    FavoriteDoctor = mongoose.model('FavoriteDoctor'),
    async = require('async'),
    step = require('step')
    uuID = require('node-uuid'),
    requestData = require('../publicfunc/accessData');

var host = 'localhost';
var httpUrl = '';
var port = 8081;

module.exports = function (app) {
  app.use('/patient', router);
};

//收藏医生api
router.post('/addFavoriteDoctor', function(req, res){
    res = cors(res);
    if (req.session.uuid) {
        var doctorID = req.body.doctor_id,
            userID = req.session.uuid;
        FavoriteDoctor.findOne({userID : userID}, function(err, user){
            if (err) {
                res.send({status : "failure", msg : "add Favoritedoctor failure"});
            } else {
                if (user) {
                    var addable = true;
                    for (var i = 0; (user.doctorID != null) && addable &&  i < user.doctorID.length ; i++)
                        if (user.doctorID[i] == doctorID) addable = false;
                    if (addable) {
                        user.doctorID.push(doctorID);
                        user.save(function(err) {
                            if (err) {
                                res.send({status : "failure", msg : "add Favoritedoctor failure"});
                            } else {
                                res.send({status : "success", msg : "add Favoritedoctor success"});
                            }
                        });
                    } else {
                        res.send({status : "failure", msg : "don't add again"});
                    }
                } else {
                    console.log("add user in DB");
                    favoritedoctor = new FavoriteDoctor({
                        userID:userID,
                        doctorID:[doctorID]
                    });
                    favoritedoctor.save(function(err){
                        if (err) {
                            res.send({status : "failure", msg : "add Favoritedoctor failure"});
                        } else {
                            res.send({status : "success", msg : "add Favoritedoctor success"});
                        }
                    });
                }
            }
        });
    }

});
//删除收藏医生api
router.post('/delFavoriteDoctor', function (req, res) {
    res = cors(res);
    if (req.session.uuid) {
        var doctorID = req.body.doctor_id,
            userID = req.session.uuid;
        FavoriteDoctor.findOne({userID : userID}, function (err, user) {
            if (err) {
                res.send({status : "failure", msg : "del FavoriteDoctor failure"});
            } else {
                if (user) {
                    var delable = true;
                    for (var i = 0; (user.doctorID != null) && delable && i < user.doctorID.length; i++)
                        if (user.doctorID[i] == doctorID) {
                            user.doctorID.splice(i,1);
                            user.save(function(err) {
                                if (err) {
                                    res.send({status : "failure", msg : "del FavoriteDoctor failure"});
                                } else {
                                    res.send({status : "success", msg : "del FavoriteDoctor success"});
                                }
                            });
                            delable = false;
                        }
                } else {
                    res.send({status : "failure", msg : "no Favoritedoctor"});
                }
            }
        });
    } else {
        res.send({status : "failure", msg : "not login"});
    }
});
//按需搜索医生api
router.post('/searchDoctors', function (req, res) {
    res = cors(res);
    var flag = req.body.flag,
        province = req.body.province ? req.body.province : '',
        city = req.body.city ? req.body.city : '',
        district = req.body.district ? req.body.district : '',
        department = req.body.department ? req.body.department : '',
        name = req.body.name ? req.body.name : '';
        address = req.body.address,
        longitude = req.body.longitude,
        latitude = req.body.latitude,
        pageNo = req.body.pageNo ? parseInt(req.body.pageNo) : 1,
        pageCount = req.body.pageNo ? parseInt(req.body.pageCount) : 100;
    if (flag == 0) {
        //范围查找api,即找寻一定范围内的医生
        //关键字包括省、市、区、科室
        var data = JSON.stringify({
            province : province,
            city : city,
            district : district,
            pageNo: pageNo,
            pageCount: pageCount,
        });
        console.log(data);
        var path = '/api/clinic/searchByAddr';
        var method = 'POST';
        requestData(host, port, path, method, data, function (re) {
            if (re.result) {
                //数据初始化
                var doctors = [],
                    clinics = re.clinics;
                //创造回调函数的函数
                var func = function(arg) {
                    return function(callback) {
                        Doctor.findOne({uuid : arg}, function(err, doctor) {
                            if (err) {
                                callback(null, 1);
                            }
                            if (doctor) {
                                var dpath = 'api/doctor/info';
                                var ddata = JSON.stringify({doctorID : doctor.doctorID});
                                requestData(host, port, dpath, method, ddata, function (doct) {
                                    if (doct.result) {
                                        var doc  = doct.doctor,
                                            cpath = 'api/clinic/cliinfo',
                                            cdata = JSON.stringify({clinicID : doc.clinicID});
                                        delete doc.password;
                                        requestData(host, port, cpath, method, cdata, function (clin) {
                                            doc.clinic = clin.clinic.name;
                                            doctors.push(doc);
                                            callback(null, 1);
                                        });

                                    }
                                });
                            } else {
                                callback(null, 1);
                            }
                        });
                    }
                }
                //把需要按顺序执行的函数做成回调函数加入到funcs中
                var funcs = new Array();
                for (var i = 0; i < clinics.length; i++) {
                    if (clinics[i].departments)
                        for (var j = 0; j < clinics[i].departments.length; j++)
                            for (var k = 0; k < clinics[i].departments[j].doctors.length; k++) {
                                if (department == '') {
                                    funcs.push(func(clinics[i].departments[j].doctors[k]));
                                    continue;
                                }
                                if (clinics[i].departments[j].name = department)
                                    funcs.push(func(clinics[i].departments[j].doctors[k]));
                            }
                }
                //同步的调用回调函数
                async.series(
                    funcs,
                    function(err, result) {
                        res.send({status : "success", doctors : doctors});
                    }
                );
            } else {
                //没有收藏医生的返回
                res.send({status : "failure", doctors : []});
            }
        });
    } else if (flag == 1) {
        //精确查找api，即通过名字查找的api
        var data = JSON.stringify({
            name:name
        });
        var path = '/api/doctor/search';
        var method = 'POST';

        var doctors = [],
        funcs = new Array();
        //创造回调函数的函数
        var func = function(arg) {
            return function(callback) {
                var doc = arg;
                cpath = 'api/clinic/cliinfo',
                cdata = JSON.stringify({clinicID : doc.clinicID});
                delete doc.password;
                requestData(host, port, cpath, 'POST', cdata, function (clin) {
                    doc.clinic = clin.clinic.name;
                    doctors.push(doc);
                    callback(null, 1);
                });
            }
        }
        requestData(host, port, path, method, data, function (re) {
            if (re.result) {
                // res.send({status : "success", doctors : re.doctors});
                // doctors = re.doctors;
                for (var i = 0; i < re.doctors.length; i++)
                    // console.log("--------------------------------" + i)
                    funcs.push(func(re.doctors[i]));
                async.series(
                    funcs,
                    function(err, result) {
                        res.send({status : "success", doctors : doctors});
                    }
                );
            } else {
              res.send({status : "failure"});
            }
        });
    } else if (flag == 2) {
        console.log("flag == 2");
        var method = 'POST';
        //查找已经收藏的医生，并返回
        var userID = req.session.uuid;
        if (userID) {
            var doctors = [],
                funcs = new Array();
            //创造回调函数的函数
            var func = function(arg) {
                return function(callback) {
                    Doctor.findOne({uuid : arg}, function(err, doctor) {
                        if (err) {
                            callback(null, 1);
                        }
                        if (doctor) {
                            var dpath = 'api/doctor/info';
                            var ddata = JSON.stringify({doctorID : doctor.doctorID});
                            requestData(host, port, dpath, 'POST', ddata, function (doct) {
                                if (doct.result) {
                                    var doc  = doct.doctor,
                                        cpath = 'api/clinic/cliinfo',
                                        cdata = JSON.stringify({clinicID : doc.clinicID});
                                    delete doc.password;
                                    requestData(host, port, cpath, 'POST', cdata, function (clin) {
                                        doc.clinic = clin.clinic.name;
                                        doctors.push(doc);
                                        callback(null, 1);
                                    });

                                }
                            });
                        } else {
                            callback(null, 1);
                        }
                    });
                }
            }
            console.log('test');
            //数据库查询收藏的医生
            FavoriteDoctor.findOne({userID : userID}, function(err, user) {
                if (err) {
                    res.send({status : "success", doctors : []});
                } else {
                    if (user) {
                        for (var i = 0; i < user.doctorID.length; i++)
                            funcs.push(func(user.doctorID[i]));
                        async.series(
                            funcs,
                            function(err, result) {
                                res.send({status : "success", doctors : doctors});
                            }
                        );
                    } else {
                        res.send({status : "success", doctors : doctors});
                    }
                }
            });
        } else {
            res.send({status : "failure", msg : "not login"});
        }
    }
});
