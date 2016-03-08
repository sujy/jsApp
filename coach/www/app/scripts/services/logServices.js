//========================================
//function:   $resoure for login, register

//========================================

angular.module('logServices', ['ngResource'])

    .factory('loginService', ['$resource', function($resource) {
        return $resource('http://192.168.0.117:3000/patient/register', {}, {
            register: {
                method : 'POST',
                url : 'http://192.168.0.117:3000/patient/register'
            },
            login: {
                method: 'POST',
                url: 'http://192.168.0.117:3000/patient/login'
            }
        });
    }]);