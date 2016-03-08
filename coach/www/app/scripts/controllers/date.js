//=====================================
//function:   controllers for date
//=====================================

var dateControllers = angular.module('dateControllers', ['ionic']);

dateControllers
    .controller('dateControllers.dateListCtrl', ['$scope', function($scope) {

        //get date List
        var url = baseUrl + '/bookings';
        $.ajax(url, {
            type: "GET",
            crossDomain: true,
            xhrFields: {withCredentials: true},
            success: function (res) {
                if (res.status == "success") {
                    var weekday = {
                        "Monday"    : "周一",
                        "Tuesday"   : "周二",
                        "Wednesday" : "周三",
                        "Thursday"  : "周四",
                        "Friday"     : "周五",
                        "Saturday"  : "周六",
                        "Sunday"    : "周日"
                    }
                    $scope.$apply(function () {
                        $scope.bookings = res.bookings;
                        $scope.userList = res.userList;
                        for (var i in $scope.bookings) {
                            for (var j in $scope.userList) {
                                //find user name
                                if ($scope.userList[j].uuid == $scope.bookings[i].userID) {
                                    $scope.bookings[i].userName = $scope.userList[j].name;
                                    $scope.bookings[i].userPhoto = $scope.userList[j].photo;
                                }
                            }

                            //dispose date
                            $scope.bookings[i].bookingIW = weekday[$scope.bookings[i].bookingIW];
                            var tempdate = $scope.bookings[i].bookingTime.substr(0, 10).split("-");
                            $scope.bookings[i].bookingDay = tempdate[0] + "年" + tempdate[1] + "月" +tempdate[2] + "日";
                            $scope.bookings[i].bookingIW = $scope.bookings[i].bookingTime.split(" ")[1];
                            $scope.bookings[i].bookingTime = $scope.bookings[i].bookingTime.split(" ")[2];
                        }
                    });
                } else {
                    if(isAndroid){
                        window.plugins.toast.showShortCenter(
                            "获取预约信息失败",function(a){},function(b){}
                        );
                    } else {
                        alert(res.message);
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

        //remove booking
        $scope.removeDate = function(index) {
            url = baseUrl + '/bookings/delete';
            $.ajax(url, {
                type: "POST",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                data: {bookingID: $scope.bookings[index].bookingID},
                success: function (res) {
                    if (res.status == "success") {
                        $scope.$apply(function () {
                            $scope.bookings.splice(index, 1);
                        });
                    } else {
                        if(isAndroid){
                            window.plugins.toast.showShortCenter(
                                "删除预约失败",function(a){},function(b){}
                            );
                        } else {
                            alert(res.message);
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

    }]);

dateControllers
    .controller('dateControllers.dateTimeAbleCtrl', ['$scope', function($scope) {
        $scope.week = [
            "周一", "周二", "周三", "周四", "周五", "周六", "周日"
        ];

        var weekEN = [
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
        ];

        $scope.numList = [
            {num: 0},
            {num: 1},
            {num: 2},
            {num: 3},
            {num: 4},
            {num: 5},
            {num: 6},
            {num: 7},
            {num: 8},
            {num: 9}
        ];

        $scope.selected = {
            number  :  0,
            time    :  '',
            weekday :  ''
        };

        var selectedElement;

        $scope.dateChoose = function(event) {
            $(event.target).toggleClass('active');
        };

        $scope.setting = function(j) {
            selectedElement = event.target;

            var tempday = $scope.free[j][weekEN[j]];
            if (tempday.length == 0) {
                $scope.selected.number = 0;
            }
            else {
                $scope.selected.number = 0;
                for (var k in tempday) {
                    if (tempday[k].time == $scope.selected.time) {
                        $scope.selected.number = tempday[k].max;
                        break;
                    }
                }
            }
            $('.dateTimeSetting.modal').modal('show');
        };

        //get dateTimeAble
        (function getDateTimeAble() {
            var url = baseUrl + '/bookings/free';
            $.ajax(url, {
                type: "GET",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                success: function (res) {
                    if (res.status == "success") {
                        $scope.$apply(function () {
                            $scope.free = res.free;
                            setTimeAbleForm($scope.free);
                        });
                    } else {
                        if(isAndroid){
                            window.plugins.toast.showShortCenter(
                                "获取可预约时间失败",function(a){},function(b){}
                            );
                        } else {
                            alert("获取可预约时间失败");
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
        })();

        //set dateTimeAble Form
        function setTimeAbleForm(free) {
            var weekdayList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            var timeInterval = {
                "9:00-10:00"  : 1,
                "10:00-11:00" : 2,
                "11:00-12:00" : 3,
                "12:00-13:00" : 4,
                "13:00-14:00" : 5,
                "14:00-15:00" : 6,
                "15:00-16:00" : 7,
                "16:00-17:00" : 8
            }
            var day;
            for (var weekday in free) {
                day = weekdayList[weekday];
                for (var date in free[weekday][day]) {
                    if (free[weekday][day][date].max == 0)
                        continue;

                    var time = free[weekday][day][date].time;
                    var index = timeInterval[time];
                    var temp = parseInt(weekday) + 1;
                    var item = $(".dateCol").eq(index).find("li").eq(temp);
                    
                    item.addClass("active");
                    var p1    = "<p>" + free[weekday][day][date].max + " 人" + "</p>";
                    item.append(p1);
                }
            }
        };

        //set dateTimeAble
        $scope.submitNewBookingTime = function() {
            var tempWeekdayEN;
            for (var i in $scope.week) {
                if ($scope.week[i] == $scope.selected.weekday) {
                    tempWeekdayEN = weekEN[i];
                }
            }

            var url = baseUrl + '/bookings/time';
            $.ajax(url, {
                type: "POST",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                data: {
                    bookingDay : tempWeekdayEN,
                    timePeriod : $scope.selected.time,
                    max        : $scope.selected.number
                },
                success: function (res) {
                    if (res.status == "success") {
                        //update $scope.free
                        var temp;
                        for (var j in $scope.week) {
                            if ($scope.week[j] == $scope.selected.weekday) {
                                temp = j;
                                break;
                            }
                        }
                        var obj = {
                            time: $scope.selected.time,
                            max: $scope.selected.number
                        }
                        $scope.free[temp][tempWeekdayEN].unshift(obj);

                        //change element background color and inner html 
                        if ($scope.selected.number == 0) {
                            if (selectedElement.tagName == "P")
                                $(selectedElement).parent().removeClass('active');
                            else
                                $(selectedElement).removeClass('active');
                            selectedElement.innerHTML = "";
                        } else {
                            $(selectedElement).addClass('active');
                            selectedElement.innerHTML = "<p>" + $scope.selected.number + " 人" + "</p>";
                        }

                        //turn off modal
                        $('.dateTimeSetting.modal').modal('hide');
                    } else {
                        if(isAndroid){
                            window.plugins.toast.showShortCenter(
                                "更新的可预约时间失败",function(a){},function(b){}
                            );
                        } else {
                            alert(res.message);
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
    }]);

dateControllers
    .controller('dateControllers.dateTimeChooseCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
        /** initialize **/
        var marginTop_ = document.documentElement.clientHeight - 265;
        marginTop_ += 'px';
        $('#dateTimeChooseSubmit').css('margin-top', marginTop_);

        $scope.detailVisible = false;
        $scope.userID = "";
        $scope.userID = $stateParams.username;
        /****************/

        //get dateTimeAble
        var url = baseUrl + '/bookings/freeList';
        $.ajax(url, {
            type: "GET",
            crossDomain: true,
            xhrFields: {withCredentials: true},
            success: function (res) {
                if (res.status == "success") {
                    $scope.$apply(function () {
                        $scope.free = res.free;
                        $scope.myweekday = res.weekDay;
                        dispose();
                    });
                } else {
                    if(isAndroid){
                        window.plugins.toast.showShortCenter(
                            "获取可预约时间表失败",function(a){},function(b){}
                        );
                    } else {
                        alert("获取可预约时间表失败");
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

        //dispose $scope.free
        function dispose() {
            var free = $scope.free;
            $scope.myFree = [];
            var weekdayListCH = {
                Monday    : "周一",
                Tuesday   :"周二",
                Wednesday : "周三",
                Thursday  : "周四",
                Friday    : "周五",
                Saturday  : "周六",
                Sunday    : "周日"
            };
            for (var weekday in free) {
                var list = free[weekday][$scope.myweekday[weekday]];
                if (list.length == 0)
                    continue;
                for (var item in list) {
                    var temp = {};
                    temp.weekday = weekdayListCH[$scope.myweekday[weekday]];
                    temp.time = list[item].time;
                    temp.max = list[item].max;
                    temp.count = list[item].count;
                    temp.date = free[weekday].date;
                    $scope.myFree.push(temp);
                }
            }
        }

        //show date detail
        $scope.showDateDetail = function(date, weekday, time) {
            $scope.dateDetail = {
                date: date,
                weekday: weekday,
                time: time
            }
            $scope.detailVisible = true;
        }

        //submitBooking
        $scope.submitBooking = function() {
            if (!$("[name='detailForm']").valid())
                return;

            var weekday = {
                "周一"  : "Monday",
                "周二"  : "Tuesday",
                "周三"  : "Wednesday",
                "周四"  : "Thursday",
                "周五"  : "Friday",
                "周六"  : "Saturday",
                "周日"  : "Sunday"
            }
            var weekdayEN = weekday[$scope.dateDetail.weekday];

            //submit booking detail
            var url = baseUrl + '/bookings/update';
            $.ajax(url, {
                type: "POST",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                data: {
                    bookingDay  : weekdayEN,
                    bookingTime : "2015-02-31 " + $scope.dateDetail.time,
                    userID       : $scope.userID
                },
                success: function (res) {
                    if (isAndroid) {
                        window.plugins.toast.showShortCenter(
                            "预约成功",function(a){},function(b){}
                        );
                    }
                    $state.go('dateList');
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


        $scope.historyBack = function() {
            //if ()
            $state.go($state.previous.name, {fromUserID: $stateParams.fromUserId});
            //$state.go($state.previous.name);
        }

        //------------------登陆表单验证------------------------------------
        $("[name='detailForm']").validate({
            rules: {
                userphone: {
                    required: true,
                    rangelength: [11,11],
                    digits: true
                }
            },
            messages: {
                userphone: {
                    required:    "请输入手机号码",
                    rangelength: "请输入正确的手机号",
                    digits:      "请输入正确的手机号"
                }
            },
            errorLabelContainer: $("section[class='form-alert']"),
            wrapper: 'p',
        });

    }]);
/*
dateControllers
    .controller('dateControllers.dateTimeChangeCtrl', ['$scope', '$location', function($scope, $location) {
        $('.ui.dropdown').dropdown();
        $scope.weekday = "Monday";
        $scope.date = "9:00-10:00";
        $scope.people = 1;

        //manutally bind data with dropdown item
        $scope.bindAfterClick = function(type) {
            var data = $(event.target).attr('data-value');
            if (type == 1)
                $scope.weekday = data;
            else if (type == 2)
                $scope.date = data;
            else if (type == 3)
                $scope.people = data;
        }

        $scope.submitNewBookingTime = function() {
            //set dateTimeAble
            var url = baseUrl + '/bookings/time';
            $.ajax(url, {
                type: "POST",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                data: {
                    bookingDay : $scope.weekday,
                    timePeriod : $scope.date,
                    max         : $scope.people
                },
                success: function (res) {
                    if (res.status == "success") {
                        $scope.$apply(function () {
                            $location.path('/dateTimeAble');
                        });
                    } else {
                        alert('set dateTimeAble wrong');
                    }
                },
                error: function () {
                    alert("error");
                }
            });
        }
    }]);*/

/*dateControllers
    .controller('dateControllers.dateDetailCtrl', ['$scope', function($scope) {
        //var bookingTime = $routeParams.bookingTime;
        //$scope.userID = $routeParams.userID;
        $scope.userName = "kkk";

        //dispose bookingTime
        var str = bookingTime.split(" ");
        $scope.bookingDay = str[1];
        $scope.bookingTime = str[0] + " " + str[2];

        var weekday = {
            "星期一"  : "Monday",
            "星期二"  : "Tuesday",
            "星期三"  : "Wednesday",
            "星期四"  : "Thursday",
            "星期五"  : "Friday",
            "星期六"  : "Saturday",
            "星期日"  : "Sunday"
        }
        var weekdayEN = weekday[$scope.bookingDay];

        //submit booking detail
        $scope.submitDetail = function() {

            var url = baseUrl + '/bookings/update';
            $.ajax(url, {
                type: "POST",
                crossDomain: true,
                xhrFields: {withCredentials: true},
                data: {
                    bookingDay  : weekdayEN,
                    bookingTime : $scope.bookingTime,
                    userID       : $scope.userName
                },
                success: function (res) {

                },
                error: function () {
                    alert("error");
                }
            });
        }

    }]);*/