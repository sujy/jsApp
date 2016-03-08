//=====================================
//function:   to search the clinics
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
    FavoriteClinic = mongoose.model('FavoriteClinic'),
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

//收藏诊所
router.post('/addFavoriteClinic', function(req, res){
    res = cors(res);
    if (req.session.uuid) {
        var clinicID = req.body.clinic_id,
            userID = req.session.uuid;
        FavoriteClinic.findOne({userID : userID}, function(err, user){
            if (err) {
                res.send({status : "failure", msg : "add FavoriteClinic failure"});
            } else {
                if (user) {
                    var addable = true;
                    for (var i = 0; (user.clinicID != null) && addable &&  i < user.clinicID.length ; i++)
                        if (user.clinicID[i] == clinicID) addable = false;
                    if (addable) {
                        user.clinicID.push(clinicID);
                        user.save(function(err) {
                            if (err) {
                                res.send({status : "failure", msg : "add FavoriteClinic failure"});
                            } else {
                                res.send({status : "success", msg : "add FavoriteClinic success"});
                            }
                        });
                    } else {
                        res.send({status : "failure", msg : "don't add again"});
                    }
                } else {
                    console.log("add user in DB");
                    favoriteClinic = new FavoriteClinic({
                        userID:userID,
                        clinicID:[clinicID]
                    });
                    favoriteClinic.save(function(err){
                        if (err) {
                            res.send({status : "failure", msg : "add FavoriteClinic failure"});
                        } else {
                            res.send({status : "success", msg : "add FavoriteClinic success"});
                        }
                    });
                }
            }
        });
    }

});
//删除收藏诊所
router.post('/delFavoriteClinic', function (req, res) {
    res = cors(res);
    if (req.session.uuid) {
        var clinicID = req.body.clinic_id,
            userID = req.session.uuid;
        FavoriteClinic.findOne({userID : userID}, function (err, user) {
            if (err) {
                res.send({status : "failure", msg : "del FavoriteClinic failure"});
            } else {
                if (user) {
                    var delable = true;
                    for (var i = 0; (user.clinicID != null) && delable && i < user.clinicID.length; i++)
                        if (user.clinicID[i] == clinicID) {
                            user.clinicID.splice(i,1);
                            user.save(function(err) {
                                if (err) {
                                    res.send({status : "failure", msg : "del FavoriteClinic failure"});
                                } else {
                                    res.send({status : "success", msg : "del FavoriteClinic success"});
                                }
                            });
                            delable = false;
                        }
                } else {
                    res.send({status : "failure", msg : "no FavoriteClinic"});
                }
            }
        });
    } else {
        res.send({status : "failure", msg : "not login"});
    }
});
//按需搜索诊所
router.post('/searchClinics', function (req, res) {
    res = cors(res);
    var flag = req.body.flag,
        province = req.body.province ? req.body.province : '',
        city = req.body.city ? req.body.city : '',
        district = req.body.district ? req.body.district : '',
        address = req.body.address,
        longitude = req.body.longitude,
        latitude = req.body.latitude,
        name = req.body.name,
        pageNo = req.body.pageNo ? parseInt(req.body.pageNo) : 1,
        pageCount = req.body.pageNo ? parseInt(req.body.pageCount) : 10;
    if (flag == 0) {
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
          res.send({status : "success", clinics : re.clinics});
        } else {
          res.send({status : "failure"});
        }
        });
    } else if (flag == 1) {
        var data = JSON.stringify({
            longitude : longitude,
            latitude : latitude,
            pageNo: pageNo,
            pageCount: pageCount,
        });
        var path = '/api/clinic/searchByLL';
        var method = 'POST';

        requestData(host, port, path, method, data, function (re) {
            if (re.result) {
              res.send({status : "success", clinics : re.clinics});
            } else {
              res.send({status : "failure"});
            }
        });
    } else if (flag == 2) {
        var userID = req.session.uuid;
        if (userID) {
            var clinics = [];
            FavoriteClinic.findOne({userID : userID}, function(err, user) {
                if (err) {
                } else {
                    if (user) {
                        var i = 0;
                        var counter = 0;
                        if (i == user.clinicID.length)
                            res.send({status : "success", clinics:[]});
                        else while (i < user.clinicID.length) {
                            console.log(i);
                            var data = JSON.stringify({clinicID:user.clinicID[i]}),
                                method = 'POST',
                                path = '/api/clinic/cliinfo';
                            requestData(host, port, path, method, data, function (re) {
                                if (re.result == true) {
                                    clinics.push(re.clinic);
                                    counter++;
                                    if(counter == user.clinicID.length) res.send({status:"success", clinics:clinics});
                                } else {
                                    counter++;
                                    console.log("clinic not exit:" + user.clinicID[i]);
                                    if(counter == user.clinicID.length) res.send({status:"success", clinics:clinics});
                                }
                            });
                            i++;
                        }

                    } else {
                        res.send({status : "success", clinics:[]});
                    }
                }
            });
        } else {
            res.send({status : "failure", msg : "not login"});
        }
    } else if (flag == 3) {
        var data = JSON.stringify({
            name:name,
            pageNo: pageNo,
            pageCount: pageCount
        });
        var path = '/api/clinic/searchByName';
        var method = 'POST';

        requestData(host, port, path, method, data, function (re) {
            if (re.result) {
              res.send({status : "success", clinics : re.clinics});
            } else {
              res.send({status : "failure"});
            }
        });
    }
});
