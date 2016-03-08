//=====================================
//function:   controllers for chat
//=====================================

var userControllers = angular.module('userControllers', ['directives']);

userControllers
    .controller('userControllers.userInfoCtrl', ['$scope', '$state', function($scope, $state)  {
        /***********  init  **********/
        $scope.editable         = false;
        $scope.showNameInput   = false;
        $scope.showTelInput    = false;
        $scope.showEmailInput  = false;
        $scope.showNote         = false;
        $scope.prePhone = "";
        $scope.preEmail = "";

        var marginTop_ = document.documentElement.clientHeight - 457;
        marginTop_ += 'px';
        $('#submitNote').css('margin-top', marginTop_);
        /****************************/

        //get doctor information
        var url = baseUrl + '/profile';
        $.ajax(url, {
            type: "GET",
            crossDomain: true,
            xhrFields: {withCredentials: true},
            headers: {
              Cookie: document.cookie
            },
            success: function (res) {
                if (res.status == "success") {
                    $scope.$apply(function () {
                        $scope.info = res.info;
                    });
                } else {
                    if(isAndroid){
                        // window.plugins.toast.showShortCenter(
                        //     "获取医生信息失败",function(a){},function(b){}
                        // );
                    } else {
                        alert(res.message);
                    }
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

        //save edited information
        $scope.save = function(flag) {
            $('.userInfo_sex.modal').modal('hide');

            if (flag == 1) {
                if ($("[name='userInfoBaseForm']").valid()) {
                    $scope.info.phone = $scope.prePhone;
                    $scope.info.email = $scope.preEmail;
                } else {
                    return;
                }
            }

            var url = baseUrl + '/profile/update';
            $.ajax(url, {
                type:         "POST",
                crossDomain: true,
                xhrFields:   {withCredentials: true},
                data:         {doctorInfo: $scope.info},
                success:       function (res) {
                                   if (res.status == "success") {
                                        $scope.endEdit();
                                        $scope.$apply(function() {
                                            $scope.showNote = false;
                                        });
                                    } else {
                                        if(isAndroid){
                                            // window.plugins.toast.showShortCenter(
                                            //     "保存修改失败",function(a){},function(b){}
                                            // );
                                        } else {
                                            alert("保存修改失败");
                                        }
                                    }
                               },
                error:         function () {
                                    if(isAndroid){
                                        // window.plugins.toast.showShortCenter(
                                        //     "服务器开小差了",function(a){},function(b){}
                                        // );
                                    } else {
                                        alert("error");
                                    }
                               }
            }, JSON);
        };

        //logout
        $scope.logout = function() {
            clearInterval(homepageChatPolling);
            var url = baseUrl + '/logout';
            $.ajax(url, {
                type: "GET",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                success: function (res) {
                    if (res.status == "success") {
                        localStorage.username = "";
                        if(isAndroid){
                            window.plugins.jPushPlugin.setAlias('');
                            console.log('set alias to none ok ');
                        }
                        $state.go('login')
                    } else {
                        if(isAndroid){
                            // window.plugins.toast.showShortCenter(
                            //     "退出失败",function(a){},function(b){}
                            // );
                        } else {
                            alert("退出失败");
                        }
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
        };

        //upload logo
        $scope.uploadLogo = function() {

            lrz($("#tempinput")[0].files[0], {
                    width: 100
                }, function(photoCompressed) {
                // 你需要的数据都在这里:photoCompressed，可以以字符串的形式传送base64给服务端转存为图片。

                $.ajax({
                    url: baseUrl + '/profile/photo',  //Server script to process data
                    type: 'POST',
                    crossDomain: true,
                    xhrFields: {withCredentials: true},
                    data: {
                        image: photoCompressed.base64.split(',')[1]
                    },
                    success: function(res) {
                        if (res.status) {
                            $scope.$apply(function () {
                                $scope.info.photo = res.url;
                            });
                        } else {
                            if(isAndroid){
                                // window.plugins.toast.showShortCenter(
                                //     "上传头像失败",function(a){},function(b){}
                                // );
                            } else {
                                alert(res.message);
                            }
                        }
                    },
                    error: function() {
                        if(isAndroid){
                            // window.plugins.toast.showShortCenter(
                            //     "服务器开小差了",function(a){},function(b){}
                            // );
                        } else {
                            alert("error");
                        }
                    }
                });
            });

            $('.userInfo_sex.modal').modal('hide');
        }

        //show sex choosing model
        $scope.showSexChoose = function() {
            $('.userInfo_sex.modal').modal('show');
        }

        //show logo choosing model
        $scope.showLogoChoose = function() {
            $('.userInfo_logo.modal').modal('show');
        }

        $scope.edit = function() {
            $("#userInfoEditField").addClass("editFieldSlideUp");

            $scope.prePhone = $scope.info.phone;
            $scope.preEmail = $scope.info.email;

            $(".form-alert")[0].innerHTML = "";
            switch($scope.editingTitle) {
                case "修改手机":
                    setTimeout(function() {$('[name="userphone"]')[0].focus();}, 500);
                    break;
                case "修改邮箱":
                    setTimeout(function() {$('[name="useremail"]')[0].focus();}, 500);
                    break;
            }
        };

        $scope.endEdit = function() {
            $("#userInfoEditField").removeClass("editFieldSlideUp");
        };

        //------------------表单验证------------------------------------
        $("[name='userInfoBaseForm']").validate({
            rules: {
                userphone: {
                    required: true,
                    rangelength: [11,11],
                    digits: true
                },
                useremail: {
                    required: true,
                    email: true,
                    maxlength: 30
                }
            },
            messages: {
                userphone: {
                    required:    "请输入手机号码",
                    rangelength: "请输入正确的手机号",
                    digits:      "请输入正确的手机号"
                },
                useremail: {
                    required:    "请输入邮箱",
                    email:       "请输入正确的邮箱地址",
                    maxlength:   "您输入的邮箱地址过长！"
                }
            },
            errorLabelContainer: $("section[class='form-alert']"),
            wrapper: 'p',
        });
    }]);
