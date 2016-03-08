//=====================================
//function:   controllers for homepage
//=====================================

var chenjiajian = {
}
var homepageChatPolling;

var homepageControllers = angular.module('homepageControllers', ['ionic']);

homepageControllers
    .controller('homepageControllers.homepageListCtrl', ['$scope', '$state', function($scope, $state)  {
        //localStorage.username = "";
        if (localStorage.username == undefined || localStorage.username == "")
            $state.go('login');


        else {
            $scope.showRed = false;

            var url = baseUrl + "/login";
            $.ajax(url, {
                        type: "POST",
                        crossDomain: true,
                        xhrFields: {withCredentials: true},
                        data: {doctorID: "username", password: "password"},
                        success: function (msg) {
                            if (msg.status == "failure") {
                                console.log("simulate login failure");
                            } else {
                                console.log("simulate login success");
                            }
                        },
                        error: function () {
                            console.log("simulate login error");
                        }
                    });


            //get doctor information
            url = baseUrl + '/profile';
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

                        chenjiajian.userLogo = res.info.photo;
                        
                        //get new chats
                        url = pollingUrl + "/check";
                        polling();
                        homepageChatPolling = setInterval(function() {polling()}, 4000);

                    } else {
                        localStorage.username = "";
                        $state.go('login');
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

            //--------------轮询-----------------------------------------------------
            function polling() {
                $.ajax(url, {
                    type: "POST",
                    crossDomain: true,
                    xhrFields: {withCredentials: true},
                    success: function (msg) {
                        if (msg.status == "success") {
                            $scope.$apply(function () {
                                $scope.count = msg.count;
                                if ($scope.count != 0)
                                    $scope.showRed = true;
                                else
                                    $scope.showRed = false;
                            });
                        } else {
                            console.log("polling check failure");
                        }
                    },
                    error: function () {
                         console.log("polling check error");
                    }
                });
            }
        }
    }]);