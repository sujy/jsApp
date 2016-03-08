//========================================

//========================================
var userModule = angular.module('userServices',['ngCookies']);

userModule.factory('hasLogin', ['$cookieStore', '$location', function($cookieStore, $location){
    return function() {
        if (!$cookieStore.get('username')) {
            $location.path('/');
        }
    };
}]);