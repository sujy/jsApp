//========================================
//Author:     Wyp
//contact:    1140664142@qq.com
//date:       2015.2.3
//========================================
var userModule = angular.module('userServices',['ngCookies']);

userModule.factory('hasLogin', ['$cookieStore', '$location', function($cookieStore, $location){
    return function() {
        if (!$cookieStore.get('username')) {
            $location.path('/');
        }
    };
}]);