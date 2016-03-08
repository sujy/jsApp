//=====================================
//function:   controllers for clinic
//Author:     dr.chan
//contact:    798095202@qq.com
//date:       2015.1.23
//=====================================

var clinicControllers = angular.module('clinicControllers', ['ionic']);


clinicControllers
    .controller('clinicControllers.clinicInfoCtrl', ['$scope', '$state',
        function($scope, $state)  {
            /**************************/
            $scope.currentPage = "clinic";
            /**************************/


            /*
             * get latest news
             **/
            var url = baseUrl + '/announcement/latest';
            $.ajax(url, {
                type: "GET",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                success: function (res) {
                    if (res.status == 'success') {
                        $scope.$apply(function() {
                            $scope.announcement = res.announcement;
                        });
                    } else {
                        if(isAndroid){
                            window.plugins.toast.showShortCenter(
                                "获取诊所公告失败",function(a){},function(b){}
                            );
                        } else {
                            alert("获取诊所公告失败");
                        }
                    }
                },
                error: function () {
                    if(isAndroid){
                        window.plugins.toast.showShortCenter(
                            "服务器开小差了",function(a){},function(b){}
                        );
                    } else {
                        alert("error");
                    }
                }
            });

            /*
             * get clinic Info
             **/
            url = baseUrl + '/clinic/info';
            $.ajax(url, {
                type: "GET",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                success: function (res) {
                    if (res.status == 'success') {
                        $scope.$apply(function() {
                            $scope.clinicInfo = res.clinic;
                        });
                    } else {
                        if(isAndroid){
                            window.plugins.toast.showShortCenter(
                                "获取诊所信息失败",function(a){},function(b){}
                            );
                        } else {
                            alert("获取诊所信息失败");
                        }
                    }
                },
                error: function () {
                    if(isAndroid){
                        window.plugins.toast.showShortCenter(
                            "服务器开小差了",function(a){},function(b){}
                        );
                    } else {
                        alert("error");
                    }
                }
            });

            /*
             * get message board
             **/
            function getMessageBoard() {

                url = baseUrl + '/clinic/msgboard';
                $.ajax(url, {
                    type: "GET",
                    crossDomain: true,
                    xhrFields: {withCredentials: true},
                    success: function (res) {
                        if (res.status == 'success') {
                            $scope.$apply(function() {
                                $scope.msgboard = res.msginfo;
                                $scope.doctorTunple = res.doctor;
                                $scope.patientTunple = res.patient;
                                initMsgBoard();
                            });
                        } else {
                            if(isAndroid){
                                window.plugins.toast.showShortCenter(
                                    "获取留言板信息失败",function(a){},function(b){}
                                );
                            } else {
                                alert("获取留言板信息失败");
                            }
                        }
                    },
                    error: function () {
                        if(isAndroid){
                            window.plugins.toast.showShortCenter(
                                "服务器开小差了",function(a){},function(b){}
                            );
                        } else {
                            alert("error");
                        }
                    }
                });

            }
            getMessageBoard();

            //init message board
            function initMsgBoard() {
                var msgboard = $scope.msgboard;
                for (var i in msgboard) {
                    //init date
                    msgboard[i].msg.date = initDate(msgboard[i].msg.date);

                    //find doctor name
                    if (msgboard[i].msg.doctorID) {
                        var doctorID =  msgboard[i].msg.doctorID;

                        for (var j in $scope.doctorTunple) {
                            if ($scope.doctorTunple[j].uuid == doctorID) {
                                if ($scope.doctorTunple[j].name!="")
                                    msgboard[i].msg.doctorName = $scope.doctorTunple[j].name;
                                else
                                    msgboard[i].msg.doctorName = "医生";
                                msgboard[i].msg.doctorPhoto = $scope.doctorTunple[j].photo;
                                break;
                            }
                        }
                    }

                    //find user name
                    if (msgboard[i].msg.userID) {
                        var userID = msgboard[i].msg.userID;

                        for (var j in $scope.patientTunple) {
                            if ($scope.patientTunple[j].uuid == userID) {
                                if ($scope.patientTunple[j].name!="")
                                    msgboard[i].msg.patientName = $scope.patientTunple[j].name;
                                else
                                    msgboard[i].msg.patientName = "匿名用户";
                                msgboard[i].msg.patientPhoto = $scope.patientTunple[j].photo;
                                break;
                            }
                        }
                    }

                    if (msgboard[i].msg.doctorID && msgboard[i].msg.userID)
                        msgboard[i].msg.isReply = true;
                    else
                        msgboard[i].msg.isReply = false;
                }
            }

            /*
             * get complaint board
             **/
            function getComplaintBoard() {

                url = baseUrl + '/clinic/complaint';
                $.ajax(url, {
                    type: "GET",
                    crossDomain: true,
                    xhrFields: {withCredentials: true},
                    success: function (res) {
                        if (res.status == 'success') {
                            $scope.$apply(function() {
                                $scope.complaint = res.msginfo;
                                $scope.complaint_doctorTunple = res.doctor;
                                $scope.complaint_patientTunple = res.patient;
                                initComplaintBoard();
                            });
                        } else {
                            if(isAndroid){
                                window.plugins.toast.showShortCenter(
                                    "获取投诉信息失败",function(a){},function(b){}
                                );
                            } else {
                                alert("获取投诉信息失败");
                            }
                        }
                    },
                    error: function () {
                        if(isAndroid){
                            window.plugins.toast.showShortCenter(
                                "服务器开小差了",function(a){},function(b){}
                            );
                        } else {
                            alert("error");
                        }
                    }
                });

            }
            getComplaintBoard();

            //init complaint board
            function initComplaintBoard() {
                var complaint = $scope.complaint;
                for (var i in complaint) {
                    //init date
                    complaint[i].msg.date = initDate(complaint[i].msg.date);

                    //find doctor name
                    if (complaint[i].msg.doctorID) {
                        var doctorID =  complaint[i].msg.doctorID;

                        for (var j in $scope.complaint_doctorTunple) {
                            if ($scope.complaint_doctorTunple[j].uuid == doctorID) {
                                complaint[i].msg.doctorName = $scope.complaint_doctorTunple[j].name;
                                complaint[i].msg.doctorPhoto = $scope.complaint_doctorTunple[j].photo;
                                break;
                            }
                        }
                    }

                    //find user name
                    if (complaint[i].msg.userID) {
                        var userID = complaint[i].msg.userID;

                        for (var j in $scope.complaint_patientTunple) {
                            if ($scope.complaint_patientTunple[j].uuid == userID) {
                                complaint[i].msg.patientName = $scope.complaint_patientTunple[j].name;
                                complaint[i].msg.patientPhoto = $scope.complaint_patientTunple[j].photo;
                                break;
                            }
                        }
                    }

                    if (complaint[i].msg.doctorID && complaint[i].msg.userID)
                        complaint[i].msg.isReply = true;
                    else
                        complaint[i].msg.isReply = false;

                }
            }

            /*
             * submit comment to message board
             **/
            $scope.submitMsg = function(valid, uuid, val) {
                if (!valid)
                    return;
                url = baseUrl + '/clinic/msgboard';

                var content = uuid ? val : $scope.comment;

                $.ajax(url, {
                    type: "POST",
                    crossDomain: true,
                    xhrFields: {withCredentials: true},
                    data: {
                        msg: content,
                        useruid: uuid
                    },
                    success: function (res) {
                        if (res.status == 'success') {
                            getMessageBoard();
                            $scope.comment = "";
                        } else {
                            if(isAndroid){
                                window.plugins.toast.showShortCenter(
                                    "提交评论失败",function(a){},function(b){}
                                );
                            } else {
                                alert("提交评论失败");
                            }
                        }
                    },
                    error: function () {
                        if(isAndroid){
                            window.plugins.toast.showShortCenter(
                                "服务器开小差了",function(a){},function(b){}
                            );
                        } else {
                            alert("error");
                        }
                    }
                });
            }

            /*
             * submit complaint to complaint board
             **/
            $scope.submitComplaint = function(valid, uuid, val) {
                if (!valid)
                    return;
                url = baseUrl + '/clinic/complaint';

                $.ajax(url, {
                    type: "POST",
                    crossDomain: true,
                    xhrFields: {withCredentials: true},
                    data: {
                        msg: val,
                        useruid: uuid
                    },
                    success: function (res) {
                        if (res.status == 'success') {
                            getComplaintBoard();
                        } else {
                            if(isAndroid){
                                window.plugins.toast.showShortCenter(
                                    "提交评论失败",function(a){},function(b){}
                                );
                            } else {
                                alert("提交评论失败");
                            }
                        }
                    },
                    error: function () {
                        if(isAndroid){
                            window.plugins.toast.showShortCenter(
                                "服务器开小差了",function(a){},function(b){}
                            );
                        } else {
                            alert("error");
                        }
                    }
                });
            }

            /*
             * find office
             **/
            $scope.findOffice = function(officeName) {
                var url = baseUrl + '/clinic/department';
                $.ajax(url, {
                    type: "POST",
                    crossDomain: true,
                    xhrFields: {withCredentials: true},
                    data: {dep: officeName},
                    success: function (res) {
                        if (res.status == 'success') {
                            $scope.$apply(function() {
                                $scope.dep =   res.dep;
                                $scope.doctors = res.doctors;
                                $scope.currentPage = "room";
                            });
                        } else {
                            if(isAndroid){
                                window.plugins.toast.showShortCenter(
                                    "获取科室信息失败",function(a){},function(b){}
                                );
                            } else {
                                alert("获取科室信息失败");
                            }
                        }
                    },
                    error: function () {
                        if(isAndroid){
                            window.plugins.toast.showShortCenter(
                                "服务器开小差了",function(a){},function(b){}
                            );
                        } else {
                            alert("error");
                        }
                    }
                });
            }

            //init date
            function initDate(date) {
                var day  = date.substr(0, 10);
                var time = date.substr(11, 5);
                return day + " " + time;
            }

            //stop bubble
            $scope.stop = function() {
                //如果提供了事件对象，则这是一个非IE浏览器
                if ( event && event.stopPropagation )
                //因此它支持W3C的stopPropagation()方法
                    event.stopPropagation();
                else
                //否则，我们需要使用IE的方式来取消事件冒泡
                    window.event.cancelBubble = true;
                return false;
            }
        }
    ]);

clinicControllers
    .controller('clinicControllers.clinicDoctorCtrl', ['$scope', '$stateParams',
        function($scope, $stateParams)  {
            $scope.doctorID = $stateParams.doctorId;
            $scope.officeName = $stateParams.officeName;

            /*
             * get doctor information
             **/
            var url = baseUrl + '/info';
            $.ajax(url, {
                type: "POST",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                data: {doctorID: $scope.doctorID},
                success: function (res) {
                    if (res.status == 'success') {
                        $scope.$apply(function() {
                            $scope.doctor = res.doctor;
                            ratingInit();
                        });
                    } else {
                        if(isAndroid){
                            window.plugins.toast.showShortCenter(
                                "获取医生信息失败",function(a){},function(b){}
                            );
                        } else {
                            alert("获取医生信息失败");
                        }
                    }
                },
                error: function () {
                    if(isAndroid){
                        window.plugins.toast.showShortCenter(
                            "服务器开小差了",function(a){},function(b){}
                        );
                    } else {
                        alert("error");
                    }
                }
            });

            //set doctor rating
            function ratingInit() {
                $('.ui.rating').rating('set rating', $scope.doctor.level);
                $('.ui.rating').rating('disable');
            }

        }]);

clinicControllers
    .controller('clinicControllers.clinicNewsCtrl', ['$scope', '$state',
        function($scope, $state) {
            /********       date init      ******/
            $scope.new = {
                title:    '',
                date:     '',
                content:  ''
            }
            $scope.showNewsList = true;
            /***********************************/

            /*
             * get clinic all news
             **/
            var url = baseUrl + '/announcements';
            $.ajax(url, {
                type: "GET",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                success: function (res) {
                    if (res.status == 'success') {
                        $scope.$apply(function() {
                            $scope.news = res.announcement;
                            $scope.clinicName = res.name;
                            //split date
                            for (i in $scope.news)
                                $scope.news[i].date = $scope.news[i].date.substr(0, 10);
                        });
                    } else {
                        if(isAndroid){
                            window.plugins.toast.showShortCenter(
                                "获取诊所公告失败",function(a){},function(b){}
                            );
                        } else {
                            alert("获取诊所公告失败");
                        }
                    }
                },
                error: function () {
                    if(isAndroid){
                        window.plugins.toast.showShortCenter(
                            "服务器开小差了",function(a){},function(b){}
                        );
                    } else {
                        alert("error");
                    }
                }
            });

            /*
             * show new's detail
             **/
            $scope.checkNewDetail = function(index) {
                $scope.new.title = $scope.news[index].title;
                $scope.new.date = $scope.news[index].date;
                $scope.new.content = $scope.news[index].content;

                $scope.showNewsList = false;
            }

            $scope.historyBack = function() {
                $state.go($state.previous.name);
            }
        }
    ]);