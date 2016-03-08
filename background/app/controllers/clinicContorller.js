//=====================================
//function:   clinic manager controller
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
    Announcement = mongoose.model('Announcement'),
    MessageBoard = mongoose.model('MessageBoard'),
    Booking = mongoose.model('Booking'),
    Doctor = mongoose.model('Doctor');

module.exports = function (app) {
  app.use('/clinic', router);
};

//全局设置请求服务器地址和端口
var dataHost = 'localhost';
var dataPort = 8081;
var photoHost = 'localhost';
var photoPort = 5555;

//===================
// 添加诊所（不含图片）
//===================
router.post('/register', function (req, res){
    res = cors(res);
    if(req.body.name) {
         var postData = {
            name : req.body.name,
            province : req.body.province,
            city : req.body.city,
            district : req.body.district,
            address : req.body.address,
            longitude : req.body.longitude,
            latitude : req.body.latitude,
            zipCode : req.body.zipCode,
            phone : req.body.phone,
            //插入三张上传的图片
            photo : '',
            introduction : req.body.introduction
        };
        // res.send(req.body);
         // 发送请求
        request(dataHost, dataPort, 'POST', '/api/clinic/clireg', postData, function (data){
            if(data.result == true){
                res.send({status:'success', clinicID : data.clinicID});
            }else{
                console.log('error: ' + data);
                res.send({status:'failure', message : data});
            }
        });
    } else {
        res.send({status:'failure', message:'no parameter name'});
    }
});

//===================
// 查看诊所信息
//===================
router.post('/info', function (req, res){
    res = cors(res);
    if(req.body.clinicID) {
        var postData = {
            clinicID : req.body.clinicID,
        }
        //发送请求
        request(dataHost, dataPort, 'POST', '/api/clinic/cliinfo', postData, function (data){
            if(data.result == true){
                res.send({status:'success', clinic:data.clinic});
            }else{
                console.log('error: ' + data);
                res.send({status:'failure', message:data});
            }
        });
    } else {
        res.send({status:'failure', message:'no parameter clinic id'});
    }
});

//===================
// 修改诊所信息（不含图片）
//===================
router.post('/update', function (req, res){
    res = cors(res);
    if(req.body.clinicID) {
        var postData = {
            clinicID : req.body.clinicID,
            name : req.body.name,
            province : req.body.province,
            city : req.body.city,
            district : req.body.district,
            address : req.body.address,
            longitude : req.body.longitude,
            latitude : req.body.latitude,
            zipCode : req.body.zipCode,
            phone : req.body.phone,
            introduction: req.body.introduction,
        }
        //发送请求
        request(dataHost, dataPort, 'POST', '/api/clinic/cliupdate', postData, function (data){
            if(data.result == true){
                res.send({status:'success', clinic:data.clinic});
            } else {
                console.log('error: ' + data);
                res.send({status:'failure', message:'request fail'});
            }
        });
    } else {
        res.send({status:'failure', message:'no parameter clinic id'});
    }

});

//===================
// 添加科室（不含图片）
//===================
router.post('/department/register', function (req, res){
    res = cors(res);
    if(req.body.name && req.body.clinicID) {
        var postData = {
            clinicID : req.body.clinicID,
            name : req.body.name,
            introduction : req.body.introduction,
            phone : req.body.phone
        };
          //发送请求
        request(dataHost, dataPort, 'POST', '/api/clinic/depreg', postData, function (data){
            if(data.result == true){
                res.send({status:'success'});
            }else{
                console.log('error: ' + data);
                res.send({status:'failure', message:'request fail'});
            }
        });
    } else {
        re.send({status:'failure', message:'no parameter name and clinic'})
    }
});

//===================
// 更新科室资料（不含图片）
//===================
router.post('/department/update', function (req, res){
    res = cors(res);
    if(req.body.name && req.body.clinicID) {
        var postData = {
            clinicID : req.body.clinicID,
            departmentName : req.body.name,
            introduction : req.body.introduction,
            phone : req.body.phone
        };
          //发送请求
        request(dataHost, dataPort, 'POST', '/api/clinic/depupdate', postData, function (data){
            if(data.result == true){
                res.send({status:'success'});
            }else{
                console.log('error: ' + data);
                res.send({status:'failure', message:'request fail'});
            }
        });
    } else {
        res.send({status:'failure', message:'no parameter name and clinic'})
    }
});


//===================
// 查看科室
//===================
router.post('/department/info', function (req, res) {
    res = cors(res);
    if(req.body.clinicID && req.body.name) {
        var postData = {
            clinicID : req.body.clinicID,
            departmentName : req.body.name
        }
          //发送请求
        request(dataHost, dataPort, 'POST', '/api/clinic/depinfo', postData, function (data){
            if(data.result == true){
                res.send({status:'success', dep:data.department});
            }else{
                console.log('error: ' + data);
                res.send({status:'failure', message:'request fail'});
            }
        });
    } else {
        res.send({status:'failure', message:'no paramter clinic id and name'});
    }
});

//===================
// 注册医生（只有账号密码，没有资料）
//===================
router.post('/doctor/register', function (req, res) {
    res = cors(res);
    if(req.body.doctorID && req.body.password) {
        //发送前先加密用户密码
        var doctorID = req.body.doctorID;
        var password = encryp(req.body.password);
        if(req.body.clinicID && req.body.department) {
            //请求数据
            var postData = {
                doctorID : doctorID,
                password : password,
                clinicID : req.body.clinicID,
                department : req.body.department,
            }
             //发送请求
            request(dataHost, dataPort, 'POST', '/api/doctor/register', postData, function (data){
                if(data.result == true) {
                    console.log('doctot register ok :' + doctorID);
                    var updateData = {
                        doctorID : doctorID,
                        name : doctorID,
                    }
                    request(dataHost, dataPort, 'POST', '/api/doctor/update', updateData, function (update){
                        if(update.result == true) {
                            var newDoctor = new Doctor({
                                uuid : data.uuid,
                                doctorID : doctorID,
                            });
                            newDoctor.save(function (err, doctor){
                                if(err){
                                    console.log('error : when save doctor to database');
                                    res.send({status : 'failure', message : 'doctor not found'});
                                    return handleError(err);
                                } else {
                                    res.send({status:'success', message:'register ok', doctorID : doctorID});
                                }
                            });
                        } else {
                            console.log('error: ' + data);
                        }
                    });
                } else {
                    console.log('error: ' + data);
                    res.send({status : 'failure', message : data.message});
                }
            });
        }
    }
});


//===================
//修改医生资料
//===================
router.post('/doctor/update', function (req, res){
    res = cors(res);
    //接受数据
    var updateName = req.body.name;
    var updateGender = req.body.gender;
    var updatePhone = req.body.phone;
    var updateEmail = req.body.email;
    var updateNote = req.body.note;
    var doctorID = req.body.doctorID;
    var level = req.body.level;
    //数据验证
    // console.log(req.body.doctorInfo);
    //发送修改用户信息请求
    if(doctorID){
        //发送数据
        var postData = {
            doctorID : doctorID,
            name : updateName,
            gender : updateGender,
            phone : updatePhone,
            email : updateEmail,
            note : updateNote,
            level: level,
        }
        //发送请求
        request(dataHost, dataPort, 'POST', '/api/doctor/update', postData, function (data){
            if(data.result == true){
                res.send({status : 'success'});
            } else {
                res.send({status : 'failure', message : 'request update fail'});
            }
        })
    } else {
        res.send({status:'failure', message:'no parameter doctor id'});
    }
});

//===================
// 查看医生
//===================
router.post('/doctor/info', function (req, res) {
    res = cors(res);
    if(req.body.doctorID) {
        var postData = {
            doctorID : req.body.doctorID
        }
        //发送请求
        request(dataHost, dataPort, 'POST', '/api/doctor/info', postData, function (data){
            if(data.result == true){
                res.send({status:'success', doctor:data.doctor});
            }else{
                console.log('error: ' + data);
                res.send({status:'failure', message:data.message});
            }
        });
    } else {
        res.send({status:'failure', message:'no paramter doctor id'});
    }
});


//===================
//修改医生头像
//===================
router.post('/doctor/photo', function (req, res){
    res = cors(res);
    if(req.body.doctorID){
        //如果没有文件上传
        if(typeof(isDone) == "undefined"){
            console.log('undefined');
            res.send({status:'failure', message:'please try again'});
        } else {
            //文件上传完成
            if(isDone == true){
                console.log(req.files.image);
                var photoData = [];
                photoData.push(fileToBase64(req.files.image.path));
                // console.log('photo data change to base64');
                //发送图片到图片服务器
                var postData = {
                    image : photoData
                }
                //发送到图片服务器
                request(photoHost, photoPort, 'POST', '/picture/upload/', postData, function (data){
                    // console.log('path from photo server :' + data.path);
                    //图片发送成功
                    if(data.success == true){
                        //更新到后台更新个人信息
                        var postDataToCloud = {
                            doctorID : req.body.doctorID,
                            photo : data.paths
                        }
                        //发送请求
                        request(dataHost, dataPort, 'POST', '/api/doctor/update', postDataToCloud, function (dataFromCloud){
                            if(dataFromCloud.result == true){
                                //成功删除临时文件
                                deleteFile(req.files.image.path);
                                res.send({status:'success', message:'file upload success', path:data.paths});
                            } else {
                                //失败也要删除临时文件
                                deleteFile(req.files.image.path);
                                res.send({status:'failure', message:'request fail'});
                            }
                        });
                    } else {
                        //失败也要删除临时文件
                        deleteFile(req.files.image.path);
                        res.send({status : 'failure', message : 'upload fail'});
                    }
                });
            } else {
                //失败删除临时文件
                deleteFile(req.files.image.path);
                res.send({status:'failure', message:'please try again'});
            }
        }
    } else {
        //没有登录
        deleteFile(req.files.image.path);
        res.send({status:'failure', message:'no parameter doctorID'});
    }
});


//===================
//添加诊所图片
//===================
router.post('/photo', function (req, res){
    res = cors(res);
    if(req.body.clinicID){
        var clinicPhoto = [];
        // var photoPath = [];
        //如果没有文件上传
        if(typeof(isDone) == "undefined"){
            console.log('undefined');
            res.send({status:'failure', message:'please try again'});
        } else {
            //文件上传完成
            if(isDone == true){
                console.log(req.files.image1);
                console.log(req.files.image2);
                console.log(req.files.image3);
                var photo1Data = fileToBase64(req.files.image1.path);
                var photo2Data = fileToBase64(req.files.image2.path);
                var photo3Data = fileToBase64(req.files.image3.path);

                clinicPhoto.push(photo1Data);
                clinicPhoto.push(photo2Data);
                clinicPhoto.push(photo3Data);
                // console.log('photo data change to base64');
                //发送图片到图片服务器
                //发送到图片服务器
                request(photoHost, photoPort, 'POST', '/picture/upload/', {image : clinicPhoto}, function (data){
                    //图片发送成功
                    if(data.success == true){
                        var postDataToCloud = {
                            clinicID : req.body.clinicID,
                            photo : data.paths
                        }
                        //发送请求
                        request(dataHost, dataPort, 'POST', '/api/clinic/cliupdate', postDataToCloud, function (dataFromCloud){
                            if(dataFromCloud.result == true){
                                //成功删除临时文件
                                deleteFile(req.files.image1.path);
                                deleteFile(req.files.image2.path);
                                deleteFile(req.files.image3.path);
                                res.send({status:'success', message:'file upload success', path:data.paths});
                            } else {
                                //失败也要删除临时文件
                                deleteFile(req.files.image1.path);
                                deleteFile(req.files.image2.path);
                                deleteFile(req.files.image3.path);
                                res.send({status:'failure', message:'request fail'});
                            }
                        });
                    } else {
                        //失败也要删除临时文件
                        deleteFile(req.files.image1.path);
                        deleteFile(req.files.image2.path);
                        deleteFile(req.files.image3.path);
                        res.send({status : 'failure', message : 'upload photo1 fail'});
                    }
                });
            } else {
                //失败删除临时文件
                deleteFile(req.files.image1.path);
                deleteFile(req.files.image2.path);
                deleteFile(req.files.image3.path);
                res.send({status:'failure', message:'please try again'});
            }
        }
    } else {
        //没有登录
        deleteFile(req.files.image1.path);
        deleteFile(req.files.image2.path);
        deleteFile(req.files.image3.path);
        res.send({status:'failure', message:'no parameter clinicID'});
    }
});



//===================
//添加科室图片
//===================
router.post('/department/photo', function (req, res){
    res = cors(res);
    if(req.body.clinicID && req.body.department){
        var depPhoto = [];
        // var photoPath = [];
        //如果没有文件上传
        if(typeof(isDone) == "undefined"){
            console.log('undefined');
            res.send({status:'failure', message:'please try again'});
        } else {
            //文件上传完成
            if(isDone == true){
                console.log(req.files.image1);
                console.log(req.files.image2);
                console.log(req.files.image3);
                var photo1Data = fileToBase64(req.files.image1.path);
                var photo2Data = fileToBase64(req.files.image2.path);
                var photo3Data = fileToBase64(req.files.image3.path);

                depPhoto.push(photo1Data);
                depPhoto.push(photo2Data);
                depPhoto.push(photo3Data);
                // console.log('photo data change to base64');
                //发送图片到图片服务器
                //发送到图片服务器
                request(photoHost, photoPort, 'POST', '/picture/upload/', {image : depPhoto}, function (data){
                    //图片发送成功
                    if(data.success == true){
                        var postDataToCloud = {
                            clinicID : req.body.clinicID,
                            departmentName: req.body.department,
                            photo : data.paths
                        }
                        //发送请求
                        request(dataHost, dataPort, 'POST', '/api/clinic/depupdate', postDataToCloud, function (dataFromCloud){
                            if(dataFromCloud.result == true){
                                //成功删除临时文件
                                deleteFile(req.files.image1.path);
                                deleteFile(req.files.image2.path);
                                deleteFile(req.files.image3.path);
                                res.send({status:'success', message:'file upload success', path:data.paths});
                            } else {
                                //失败也要删除临时文件
                                deleteFile(req.files.image1.path);
                                deleteFile(req.files.image2.path);
                                deleteFile(req.files.image3.path);
                                res.send({status:'failure', message:'request fail'});
                            }
                        });
                    } else {
                        //失败也要删除临时文件
                        deleteFile(req.files.image1.path);
                        deleteFile(req.files.image2.path);
                        deleteFile(req.files.image3.path);
                        res.send({status : 'failure', message : 'upload photos fail'});
                    }
                });
            } else {
                //失败删除临时文件
                deleteFile(req.files.image1.path);
                deleteFile(req.files.image2.path);
                deleteFile(req.files.image3.path);
                res.send({status:'failure', message:'please try again'});
            }
        }
    } else {
        //没有登录
        deleteFile(req.files.image1.path);
        deleteFile(req.files.image2.path);
        deleteFile(req.files.image3.path);
        res.send({status:'failure', message:'no parameter clinicID'});
    }
});

//===================
//添加科室坐诊表
//===================
router.post('/department/timetable', function (req, res){
    res = cors(res);
    if(req.body.clinicID && req.body.department){
        //如果没有文件上传
        if(typeof(isDone) == "undefined"){
            console.log('undefined');
            res.send({status:'failure', message:'please try again'});
        } else {
            //文件上传完成
            if(isDone == true){
                console.log(req.files.image);
                var photoData = [];
                photoData.push(fileToBase64(req.files.image.path));
                // console.log('photo data change to base64');
                //发送图片到图片服务器
                var postData = {
                    image : photoData
                }
                //发送到图片服务器
                request(photoHost, photoPort, 'POST', '/picture/upload/', postData, function (data){
                    // console.log('path from photo server :' + data.path);
                    //图片发送成功
                    if(data.success == true){
                        //更新到后台更新信息
                        var postDataToCloud = {
                            clinicID : req.body.clinicID,
                            departmentName: req.body.department,
                            timeTable : data.paths
                        }
                        //发送请求
                        request(dataHost, dataPort, 'POST', '/api/clinic/depupdate', postDataToCloud, function (dataFromCloud){
                            if(dataFromCloud.result == true){
                                //成功删除临时文件
                                deleteFile(req.files.image.path);
                                res.send({status:'success', message:'file upload success', path:data.paths});
                            } else {
                                //失败也要删除临时文件
                                deleteFile(req.files.image.path);
                                res.send({status:'failure', message:'request fail'});
                            }
                        });
                    } else {
                        //失败也要删除临时文件
                        deleteFile(req.files.image.path);
                        res.send({status : 'failure', message : 'upload fail'});
                    }
                });
            } else {
                //失败删除临时文件
                deleteFile(req.files.image.path);
                res.send({status:'failure', message:'please try again'});
            }
        }
    } else {
        //没有
        deleteFile(req.files.image.path);
        res.send({status:'failure', message:'no parameter clinicID && department name'});
    }
});

//===================
//诊所发布公告
//===================
router.post('/announcement/new', function (req, res) {
    res = cors(res);
    if(req.body.clinicID) {
        var announcement = new Announcement({
            announcementID : uuID.v1(),
            clinicID : req.body.clinicID,
            title : req.body.title,
            date : new Date(req.body.year, req.body.month, req.body.day),
            content : req.body.content
        });
        announcement.save(function (err){
            if(err) {
                res.send({status:'failure', message:'error'});
            } else {
                res.send({status:'success', message:'save announcement ok'});
            }
        });
    } else {
        res.send({status:'failure', message:'no parameter clinicID'})
    }
});

//===================
//查看公告
//===================
router.post('/announcement/list', function (req, res) {
    res = cors(res);
    if(req.body.clinicID) {
        Announcement.find({clinicID : req.body.clinicID}, function (err, list) {
            if(err) {
                res.send({status:'failure', message:'find announcement error'});
            }
            if(list) {
                if(list.length == 0){
                    res.send({status:'success', announcement:[], message:'no announcement found'});
                } else {
                    var postDataForClinic = {
                        clinicID: req.body.clinicID
                    }
                    request(dataHost, dataPort, 'POST', '/api/clinic/cliinfo', postDataForClinic, function(clinicData) {
                        if(clinicData.result == true){
                            res.send({status: 'success',announcement: list, name:clinicData.clinic.name});
                        } else {
                            res.send({status:'failure', message:'request clinic data fail'});
                        }
                    });
                }
            } else {
                res.send({status:'failure', message:'no announcement found'});
            }
        });
    } else {
        res.send({status:'failure', message:'no parameter clinicID'})
    }
});

//===================
//删除公告
//===================
router.post('/announcement/delete', function (req, res) {

});

//===================
//更新公告
//===================
router.post('/announcement/update', function (req, res) {

});

//===================
//修改医生密码
//===================
router.post('/doctor/password', function (req, res){
    res = cors(res);
    if(req.body.clinicID && req.body.doctorID) {
        if (req.body.password) {
            var postDataToCloud = {
                doctorID : req.body.doctorID,
                password : encryp(req.body.password)
            }
            //发送请求
            request(dataHost, dataPort, 'POST', '/api/doctor/update', postDataToCloud, function (dataFromCloud){
                if(dataFromCloud.result == true){
                    res.send({status:'success', message:'change password success'});
                } else {
                    res.send({status:'failure', message:'request fail'});
                }
            });
        } else {
            res.send({status:'failure', message:'no parameter password'})
        }
    } else {
        res.send({status:'failure', message:'no parameter clinicID & doctorID'})
    }
});
