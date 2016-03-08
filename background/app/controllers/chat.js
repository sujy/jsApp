//=====================================
//function:   轮询实现的聊天功能
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
    Dialog = mongoose.model('Dialog'),
    newDialog = mongoose.model('NewDialog'),
    uuID = require('node-uuid'),
    async = require('async'),
    requestData = require('../publicfunc/accessData'),
    deleteFile = require('../publicfunc/deleteFile'),
    request = require('../publicfunc/doctorRequest'),
    fileToBase64 = require('../publicfunc/fileToBase64');

var host = 'localhost';
var httpUrl = '';
var port = 8081;
var photoHost = 'localhost';
var photoPort = 5555;

module.exports = function (app) {
  app.use('/chat', router);
};

//轮询查找是否有新的信息
router.post('/check', function (req, res) {
    res = cors(res);
    var userID = req.session.uuid;
    if (userID) {
        newDialog.find({toUserID : userID}, function (err, ng) {
            if (err) {
                console.log('find new dialog err: ' + err);
                res.send({status : 'failure', message : 'find new dig err'})
            } else if (ng.length > 0) {
                console.log(ng);
                res.send({status : 'success', result : true, count : ng.length});
            } else {
                console.log("not new message:" + ng);
                res.send({status : 'success', result : false, count : ng.length});
            }
        });
    } else {
        res.send({status : 'failure', message : 'user has not login'});
    }
});

//返回消息列表
router.post('/chatList', function (req, res) {
    res = cors(res);
    var userID = req.session.uuid;
    var sendAble = true;
    var isDoctor = (req.body.isDoctor == 'true');
    if (userID) {
        console.log(userID);
        var list = [];
        var funcs = new Array();
        var reList = [];
        var finalList = [];
        //查找发送的消息的联系人
        var makeTo = function() {
            return function (cb) {
                Dialog.find(
                    {userID : userID},
                    function (err, mes) {
                        console.log(mes.length);
                        if (err) {
                            console.log(err);
                            cb(null, 1);
                        } else {
                            if (mes && mes.length > 0)
                            for (var i = 0; i < mes.length; i++) {
                                var bool = true;
                                for (var j = 0; bool && j < list.length; j++)
                                    if (mes[i].doctorID == list[j].uuid)
                                        bool = false;
                                if (bool) {
                                    console.log('add ' + mes[i].doctorID)
                                    list.push({uuid:mes[i].doctorID});
                                }
                                if (i == mes.length - 1)
                                    cb(null, 1);
                            } else {
                                cb(null, 1);
                            }
                        }
                    }
                );
            }
        }
        //查找接手的消息的联系人
        var makeFrom = function() {
            return function (cb) {
                Dialog.find(
                    {doctorID : userID},
                    function (err, mes) {
                        console.log(mes.length);
                        if (err) {
                            console.log(err);
                            cb(null, 1);
                        } else {
                            if (mes && mes.length > 0)
                            for (var i = 0; i < mes.length; i++) {
                                var bool = true;
                                for (var j = 0; bool && j < list.length; j++)
                                    if (mes[i].userID == list[j].uuid)
                                        bool = false;
                                if (bool) {
                                    console.log('add ' + mes[i].userID)
                                    list.push({uuid:mes[i].userID});
                                }
                                if (i == mes.length - 1)
                                    cb(null, 1);
                            } else {
                                cb(null, 1);
                            }
                        }
                    }
                );
            }
        }
        //生产联系人列表
        var func = function (uuid) {
            return function (cb) {
                Patient.findOne({uuid : uuid}, function (err, pat){
                    if (err) {cb(null, 1);}
                    else if (pat) {
                        reList.push({info:pat, lastMsg:'', hasNewMsg:'false'});
                        cb(null, 1);
                    } else {
                        Doctor.findOne({uuid : uuid}, function (err, doc){
                            if (err) {cb(null, 1);}
                            else if (doc) {
                                reList.push({info:doc, lastMsg:'', hasNewMsg:'false'});
                                cb(null, 1);
                            } else {
                                cb(null, 1);
                            }
                        });
                    }
                });
            }
        }
        var makeList = function() {
            return function (cb) {
                console.log(list);
                for (var i = 0; i < list.length; i++)
                    funcs.push(func(list[i].uuid));
                cb(null, 1);
            }
        }
        var init = new Array();
        init.push(makeTo());
        init.push(makeFrom());
        init.push(makeList());
        var makeLastMsg = function(index, info) {
            return function (cb) {
                Dialog.find({userID:userID, doctorID:info.uuid}, function (err, log){
                    if (err) {}
                    else if (log.length > 0) {
                        console.log('add ' + index.toString() + ' lsm');
                        reList[index].lastMsg = log[log.length - 1];
                        cb(null, 1);
                    }
                });
                Dialog.find({userID:info.uuid, doctorID:userID}, function (err, log) {
                    if (err) {}
                    else if (log.length > 0) {
                        console.log('add ' + index.toString() + ' lsm');
                        reList[index].lastMsg = log[log.length - 1];
                        cb(null, 1);
                    }
                });
            }
        }
        var checkNewMsg = function(index, info) {
            return function (cb) {
                newDialog.find({toUserID:userID, fromUserID:info.uuid}, function (err, mes){
                    if (err) {}
                    else {
                        if (mes.length > 0) {
                            reList[index].hasNewMsg = 'true';
                        } else {
                            reList[index].hasNewMsg = 'false';
                        }
                        cb(null, 1);
                    }
                });
            }
        }
        async.series(
            init,
            function (err, result) {
                async.series(
                    funcs,
                    function (err, result) {
                        var after = new Array();
                        for (var i = 0; i < reList.length; i++)
                            after.push(makeLastMsg(i, reList[i].info));
                        for (var i = 0; i < reList.length; i++)
                            after.push(checkNewMsg(i, reList[i].info));
                        async.series(
                            after,
                            function (err, result) {
                                if(sendAble) {
                                    res.send({status : 'success', list : reList});
                                    sendAble = false;
                                }
                            }
                        );
                    }
                );
            }
        );
        // newDialog.aggregate(
        //     {$match: {toUserID : userID}},

        //     {$group: {_id : {fromUserID : "$fromUserID", fromUserName : "$fromUserName", fromUserPhoto : "$fromUserPhoto"}, count : {$sum : 1}}},

        //     {$project : {fromUserName:1,fromUserID:1,count:1}},
        //     function (err, mes) {
        //         if (err) {
        //             console.log(err);
        //             res.send({status : 'failure', message : 'something wrong'});
        //         } else {
        //             var newestMsg = [];
        //             var p = 0;
        //             if (mes.length > 0) {
        //                for (var i = 0; i < mes.length; i++) {
        //                 newDialog.find({fromUserID : mes[i]._id.fromUserID},
        //                     function (err, msg) {
        //                         if (!err) {
        //                             newestMsg.push(msg[msg.length - 1]);
        //                         }
        //                         p++;
        //                         if (p == mes.length) {
        //                             res.send({status : 'success', message : mes, newestMsg : newestMsg});
        //                         }
        //                     });
        //                }
        //             } else {
        //                 console.log(mes);
        //                 res.send({status : 'success', message : mes});
        //             }
        //         }
        //     });
    } else {
        console.log('user has not login');
        if (sendAble) {
            sendAble = false;
            res.send({status : 'failure', message : 'user has not login'});
        }
    }
});
router.post('/sendPhoto', function (req, res) {
    res = cors(res);
    var userID = req.session.uuid;
    if(req.body.image) {
        photo = {
            image : [req.body.image]
        }
        //发送到图片服务器
        request('localhost', 5555, 'POST', '/picture/upload/', photo, function (data){
            if (data.success == true) {
                res.send({status : 'success', url : data.paths[0]});
            } else {
                console.log(data);
                res.send({status : 'failure', message : 'image server error'});
            }
        });
    } else {
        res.send({status:'failure', message:'no image upload'})
    }
});
//发送信息
router.post('/send', function (req, res) {
    res = cors(res);
    var userID = req.session.uuid;
    if (userID) {
        var toUserID = req.body.toUserID;
        var message = req.body.message;
        var isDoctor = req.body.isDoctor;
        if (toUserID !== null && message !== null) {
            if (isDoctor == 'true') {
                Doctor.findOne({uuid : userID}, function (err, dot) {
                    if (err) {
                        console.log('find doctor err:' + err);
                        res.send({status : 'failure', message : 'find doctor err'});
                    } else {
                        Patient.findOne({uuid : toUserID}, function (err, pat) {
                            var pushToPatient = pat.userID;
                            if (err) {
                                console.log('find patient err:' + err);
                                res.send({status : 'failure', message : 'find patient err'});
                            } else {
                                var fromUserName, toUserName, fromUserPhoto;
                                if (dot !== null && dot.hasOwnProperty('name')) fromUserName = dot.name;
                                else fromUserName = '';
                                if (pat !== null && pat.hasOwnProperty('name')) toUserName = pat.name;
                                else toUserName = '';
                                if (dot !== null && dot.hasOwnProperty('photo')) fromUserPhoto = dot.photo;
                                else fromUserPhoto = '';
                                var ng = newDialog({
                                    dialogTime : new Date,
                                    dialogMessage : message,
                                    fromUserID : userID,
                                    toUserID : toUserID,
                                    fromUserName : fromUserName,
                                    toUserName : toUserName,
                                    fromUserPhoto : fromUserPhoto
                                });
                                ng.save(function (err) {
                                    if (err) {
                                        console.log({status : 'failure', message : 'save message err'});
                                        res.send({status : 'failure', message : 'save message err'});
                                    } else {
                                        var dialog = new Dialog({
                                            dialogID : uuID.v1(),
                                            dialogTime : new Date(),
                                            dialogMessage : message,
                                            flag : true,
                                            doctorID : userID,
                                            userID : toUserID
                                        });
                                        dialog.save(function (err) {
                                            if (err) {
                                                console.log('save dialog err:' + err);
                                                newDialog.remove({dialogMessage : message,
                                                                 fromUserID : userID,
                                                                 toUserID : toUserID},
                                                                 function (err) {
                                                                    if (!err) {
                                                                        console.log({status : 'failure', message : 'save dialog err'});
                                                                        res.send({status : 'failure', message : 'save dialog err'});
                                                                    }
                                                                 });
                                            } else {
                                                console.log(pushToPatient);
                                                pjpush(pushToPatient,'您收到一条新消息，请到个人中心我的消息查看！', function(err, sre) {
                                                    console.log(sre);
                                                });
                                                console.log(ng);
                                                res.send({status : 'success', message : 'message has been send'});
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                Patient.findOne({uuid : userID}, function (err, pat) {
                    if (err) {
                        console.log('find patient err:' + err);
                        res.send({status : 'failure', message : 'find patient err'});
                    } else if (pat) {
                        Doctor.findOne({uuid : toUserID}, function (err, dot) {
                            if (err) {
                                console.log('find patient err:' + err);
                                res.send({status : 'failure', message : 'find doctor err'});
                            } else {
                                var ng = newDialog({
                                    dialogTime : new Date,
                                    dialogMessage : message,
                                    fromUserID : userID,
                                    toUserID : toUserID,
                                    fromUserName : pat.name,
                                    toUserName : dot.name,
                                    fromUserPhoto : pat.photo
                                });
                                ng.save(function (err) {
                                    if (err) {
                                        console.log({status : 'failure', message : 'save message err'});
                                        res.send({status : 'failure', message : 'save message err'});
                                    } else {
                                        var dialog = new Dialog({
                                            dialogID : uuID.v1(),
                                            dialogTime : new Date(),
                                            dialogMessage : message,
                                            flag : false,
                                            doctorID : toUserID,
                                            userID : userID
                                        });
                                        dialog.save(function (err) {
                                            if (err) {
                                                console.log('save dialog err:' + err);
                                                newDialog.remove({dialogMessage : message,
                                                                 fromUserID : userID,
                                                                 toUserID : toUserID},
                                                                 function (err) {
                                                                    if (!err) {
                                                                        console.log({status : 'failure', message : 'save dialog err'});
                                                                        res.send({status : 'failure', message : 'save dialog err'});
                                                                    }
                                                                 });
                                            } else {
                                                console.log(ng);
                                                djpush(dot.doctorID,'您收到一条新消息，进入我的消息查看！', function(err, sre) {
                                                    console.log(sre);
                                                });
                                                res.send({status : 'success', message : 'message has been send'});
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        res.send({status:'success', message:'patient not find'});
                    }
                });
            }
        } else {
            res.send({status : 'failure', message : 'touserID or message empty'})
        }
    } else {
        res.send({status : 'failure', message : 'user has not login'})
    }
});
//历史消息api
router.post('/history', function (req, res) {
    res = cors(res);
    var isDoctor = (req.body.isDoctor == 'true'),
        userID = '',
        doctorID = '';
    if (isDoctor) {
        doctorID = req.session.uuid;
        userID = req.body.fromUserID;
    } else {
        doctorID = req.body.fromUserID;
        userID　= req.session.uuid;
    }
    console.log('user ' + userID);
    console.log('doctor ' + doctorID);
    if (userID && doctorID) {
        Dialog.find({userID : userID, doctorID : doctorID}, function (err, logs) {
            if (err) {
            } else {
                var re = [],
                    funcs = new Array(),
                    patient = {},
                    doctor = {};
                var func = function (aLog) {
                    return function (cb) {

                        var newre = {};
                        if (!aLog.flag) {
                            newre.fromUserID = aLog.userID;
                            newre.toUserID = aLog.doctorID;
                        } else {
                            newre.fromUserID = aLog.doctorID;
                            newre.toUserID = aLog.userID;
                        }
                        newDialog.findOne({toUserID : newre.toUserID, fromUserID : newre.fromUserID, dialogMessage : aLog.dialogMessage}, function (err, findDoc){
                            if (err) {
                                cb(null, 1);
                                return;
                            }
                            if(findDoc == null) {
                                newre.dialogTime = aLog.dialogTime;
                                newre.dialogMessage = aLog.dialogMessage;
                                re.push(newre);
                                cb(null, 1);
                            } else {
                                cb(null, 1);
                                return;
                            }
                        });

                    }
                }
                // var
                for (var i = 0; i < logs.length; i++)
                    funcs.push(func(logs[i]));
                var makeUser = function (uid) {
                    return function(cb) {
                        Patient.findOne({uuid : uid}, function (err, pat){
                            if (err) patient = 'find patient error';
                            else if (pat) {
                                patient = pat;
                            }
                            cb(null, 1);
                        });
                    }
                }
                var makeDoctor = function (did) {
                    return function(cb) {
                        Doctor.findOne({uuid : did}, function (err, doc){
                            if (err) doctor = 'find doctor error';
                            else if (doc) {
                                doctor = doc;
                            }
                            cb(null, 1);
                        });
                    }
                }
                funcs.push(makeUser(userID));
                funcs.push(makeDoctor(doctorID));
                async.series(
                    funcs,
                    function (err,result) {
                        if (err) {
                        } else {
                            res.send({status : 'success', message : re, patient : patient, doctor : doctor});
                        }
                    }
                );
            }
        });
    } else {
        res.send({status : 'failure', message : 'not login'});
    }
});
//轮询接收信息
router.post('/receive', function (req, res) {
    res = cors(res);
    var userID = req.session.uuid;
    var fromUserID = req.body.fromUserID;
    if(userID && fromUserID) {
        newDialog.find({toUserID : userID, fromUserID : fromUserID}, function (err, mes) {
            if (err) {
                console.log('find new message err:' + err);
                res.sned({status : 'failure', message : 'find new message err'});
            } else {
                newDialog.remove({toUserID : userID, fromUserID : fromUserID}, function (err) {
                    if (err) {
                        console.log('remove new message err');
                        res.sned({status : 'failure', message : 'remove the message err'});
                    } else {
                        console.log(mes);
                        res.send({status : 'success', message : mes});
                    }
                });
                // res.send({status : 'success', message : mes});
            }
        });
    } else {
        console.log('user has not login');
        res.send({status : 'failure', message : 'user has not login'});
    }
});
