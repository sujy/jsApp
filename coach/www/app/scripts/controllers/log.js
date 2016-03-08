//========================================
//function:   controllers for log in&out
//========================================

// jiayang:
//      var baseUrl = "http://192.168.0.115:9000/doctor";
// server:
        var baseUrl = "http://192.168.1.219:9000/doctor";
// weipeng:
//    var baseUrl = "http://192.168.0.117:9000/doctor";

var pollingUrl = "http://192.168.1.219:9000/chat";

var logControllers = angular.module('logControllers', []);

logControllers
    .controller('logControllers.loginCtrl', ['$scope', '$state',
        function($scope, $state)  {
            $scope.user = {
                name      : '',
                password : ''
            }

            var url = baseUrl + "/login";

            $scope.submit = function(valid) {

                if (valid) {
                    $.ajax(url, {
                        type: "POST",
                        crossDomain: true,
                        xhrFields: {withCredentials: true},
                        data: {doctorID: $scope.user.name, password: $scope.user.password},
                        success: function (msg) {
                            if (msg.status == "failure") {
                                alert(msg.message);
                            } else {

                                localStorage.username = $scope.user.name;
                                if(isAndroid){
                                    window.plugins.jPushPlugin.setAlias(localStorage.username);
                                    console.log('set alias ok ' + localStorage.username);
                                }

                                $state.go('homepage');
                            }
                        },
                        error: function () {
                            if(isAndroid){
                                // window.plugins.toast.showShortCenter(
                                //     "服务器开小差了",function(a){},function(b){}
                                // );
                            } else {
                                alert("error");
                            }
                        }
                    });
                }

            };
        }
    ]);

logControllers
    .controller('logControllers.changePwdCtrl', ['$scope', '$state',
        function($scope, $state)  {

            //------------------初始化--------------------------------------
            var marginTop_ = document.documentElement.clientHeight - 290;
            marginTop_ += 'px';
            $('#changePwdSubmit').css('marginTop', marginTop_);

            $scope.confirm = {
                src_pwd:        '',
                new_pwd:        '',
                new_pwd_again: ''
            }


            //------------------表单验证------------------------------------
            $("[name='changePwdForm']").validate({
                rules: {
                    srcpwd: {
                        required: true,
                        minlength: 6,
                        maxlength: 15,
                        hasValidSymbol: ""
                    },
                    newpwd: {
                        required: true,
                        minlength: 6,
                        maxlength: 15,
                        hasValidSymbol: ""
                    },
                    newpwdagain: {
                        required: true,
                        minlength: 6,
                        maxlength: 15,
                        hasValidSymbol: "",
                        equalTo: "#newpwd"
                    }
                },
                messages: {
                    srcpwd: {
                        required:    "请输入密码",
                        minlength:   "请输入最少6位的密码",
                        maxlength:   "请输入不多于15位的密码",
                        hasValidSymbol: "您的密码输入含有非法字符"
                    },
                    newpwd: {
                        required:    "请输入新密码",
                        minlength:   "请输入最少6位的新密码",
                        maxlength:   "请输入不多于15位的新密码",
                        hasValidSymbol: "您的新密码输入含有非法字符"
                    },
                    newpwdagain: {
                        required:    "您的两次密码不相等",
                        minlength:   "您的两次密码不相等",
                        maxlength:   "您的两次密码不相等",
                        hasValidSymbol: "您的两次密码不相等",
                        equalTo:     "您的两次密码不相等"
                    }
                },
                errorLabelContainer: $("section[class='form-alert']"),
                wrapper: 'p',
            });

            //-----------------提交表单-------------------------------------
            $scope.submit = function() {
                var url = baseUrl + "/profile/password";
                if ($("[name='changePwdForm']").valid()) {
                    $.ajax(url, {
                        type: "POST",
                        crossDomain: true,
                        xhrFields: {withCredentials: true},
                        data: {oldPassword: $scope.confirm.src_pwd, newPassword: $scope.confirm.new_pwd},
                        success: function (res) {
                            if (res.status == "success") {
                                localStorage.username = "";
                                if(isAndroid){
                                    // window.plugins.toast.showShortCenter(
                                    //     "修改成功！请重新登录！",function(a){},function(b){}
                                    // );
                                }
                                $state.go('login');
                            } else {
                                alert(res.message);
                            }
                        },
                        error: function () {
                            if(isAndroid){
                                // window.plugins.toast.showShortCenter(
                                //     "服务器开小差了",function(a){},function(b){}
                                // );
                            } else {
                                alert("error");
                            }
                        }
                    });
                }
            };
        }
    ]);
