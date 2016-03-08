//=====================================
//function:   controllers for homepage
//=====================================

var homepageControllers = angular.module('homepageControllers', ['ionic']);

homepageControllers
    .controller('homepageControllers.homepageListCtrl', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state)  {
    	
    	$scope.home = true;
    	$scope.view = $rootScope.view;
    	$scope.title = "健身在线";

        // if (localStorage.endGuide != "true") 
        //     $scope.endGuide = false;
        // else
        //     $scope.endGuide = true;
        $scope.endGuide = true;


    	function endView() {
    		$scope.view = $rootScope.view = true;
    		viewStart = true;
    	}

        $scope.setEndView = function() {
            setTimeout(function() {endView()}, 1000);
        }

        $scope.goHealthManage = function() {
            if (localStorage.login_id == undefined || localStorage.login_id == "")
                alert("请先登陆");
            else
                $state.go("healthManage");
        }

        //----------------处理导航页手势事件---------------------------------
        var clientWidth = document.documentElement.clientWidth;
        var guidePics = document.getElementById("guidePics");
        var startX, startY, x, oldLeft;

        function myTouchStartHandler(event) {
            console.log("touch");

            var event = event || window.event;

            event.preventDefault();

            var touch = event.touches[0];
            startX = touch.pageX;
            startY = touch.pageY;

            oldLeft = parseInt($(guidePics).css("left").split("p")[0]);

            guidePics.style.transition = 'none';
        }

        function myTouchMoveHandler(event) {
            console.log("move");

            var event = event || window.event;

            event.preventDefault();

            var touch = event.touches[0];
            x = touch.pageX - startX;

            var left = oldLeft + x;
            if (left <= 0 && left >= -3 * clientWidth)
                guidePics.style.left = left + 'px';
        }

        function myTouchEndHandler(event) {
            console.log("end");

            var event = event || window.event;

            event.preventDefault();

            var tempL;

            guidePics.style.transition = '0.5s left'

            //手指向左滑动，图片向右
            if (x < 0) {console.log();
                tempL = oldLeft - clientWidth;
                if (tempL >= -3 * clientWidth) {
                    oldLeft = tempL;
                    guidePics.style.left = oldLeft + 'px';
                } else {
                    oldLeft = -3 * clientWidth;
                    guidePics.style.left = oldLeft + 'px';
                }
            }
            //手指向右滑动，图片向左
            else if (x > 0) {
                tempL = oldLeft + clientWidth;
                if (tempL <= 0) {
                    oldLeft = tempL;
                    guidePics.style.left = oldLeft + 'px';
                } else {
                    oldLeft = 0;
                    guidePics.style.left = oldLeft + 'px';
                }
            }

        }

        //事件绑定
        guidePics.addEventListener("touchstart", myTouchStartHandler);
        guidePics.addEventListener("touchmove", myTouchMoveHandler);
        guidePics.addEventListener("touchend", myTouchEndHandler);

        //---------------不再显示引导页-----------------------------------------
        $scope.setEndGuide = function() {
            localStorage.endGuide = "true";
            $scope.endGuide = true;
        }


        //---------------收藏---------------------------------------------------
        if(localStorage.login_id != ""){
            //收藏的诊所
            $.ajax(baseUrl+ "/patient" +"/searchClinics",{
                type:"POST",
                data:{'flag' : '2'},
                xhrFields: {withCredentials: true},
                crossDomain:true,
                error:function(){ console.log("服务器不能访问");},
                success:function(msg){
                    if (msg.status == "failure") {
                        console.log("查找失败");
                    } else if(msg) {
                        $rootScope.favoriteClinics = msg.clinics.reverse();
                        
                    }
                }
            });
            //收藏的医生
            $.ajax(baseUrl+ "/patient" +"/searchDoctors",{
                type:"POST",
                data:{'flag' : '2'},
                xhrFields: {withCredentials: true},
                crossDomain:true,
                error:function(){ console.log("服务器不能访问");},
                success:function(msg){
                    if (msg.status == "failure") {
                        console.log("查找失败");
                    } else if(msg) {
                        $rootScope.favoriteDoctors = msg.doctors.reverse();
                    }
                }
            });
        }
    }
]);