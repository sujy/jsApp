// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'controllers', 'userServices'])

.run(function($ionicPlatform, $rootScope, $state) {
  // build version
  isAndroid = ionic.Platform.isAndroid();
  // dev version
  //isAndroid = false;
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    // if (window.cordova && window.cordova.plugins.Keyboard) {
    //   cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    // }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    isAndroid = ionic.Platform.isAndroid();
    // if(isAndroid){
    //   //启动极光推送服务
    //   window.plugins.jPushPlugin.init();
    //   //调试模式
    //   window.plugins.jPushPlugin.setDebugMode(false);
    //
    //   if(localStorage.username) {
    //     window.plugins.jPushPlugin.setAlias(localStorage.username);
    //     console.log('set alias ok ' + localStorage.username);
    //   }
    // }
  });



  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
    $state.previous = fromState;
  });
})

.run(function($rootScope, $ionicPlatform, $state){

  $rootScope.views = false;

  $ionicPlatform.registerBackButtonAction(function(e){
    if ($rootScope.backButtonPressedOnceToExit) {
      ionic.Platform.exitApp();
    }
    else if (!$state.is('homepage')) {
      //返回键
      if($state.is('clinicInfo')){
        $state.go('homepage');
      } else if($state.is('chatList')){
        $state.go('homepage');
      } else if($state.is('clinicInfo')){
        $state.go('homepage');
      } else if($state.is('userInfo')){
        $state.go('homepage');
      } else if($state.is('changePassword')){
        $state.go('userInfo');
      } else if($state.is('dateList')){
        $state.go('homepage');
      } else if($state.is('clinicNews')){
        $state.go($state.previous.name);
      } else if($state.is('clinicDoctor')){
        $state.go('clinicInfo');
      } else if($state.is('dateTimeAble')){
        $state.go('dateList');
      } else if($state.is('dateTimeChoose')){
        $state.go('dateList');
      } else if($state.is('dateDetail')){
        $state.go('dateList');
      } else if($state.is('chatRoom')){
        $state.go('chatList');
      }
    }
    else {
      $rootScope.backButtonPressedOnceToExit = true;
      window.plugins.toast.showShortBottom(
        "再按一次退出安大夫",function(a){},function(b){}
      );
      setTimeout(function(){
        $rootScope.backButtonPressedOnceToExit = false;
      },2000);
    }
    e.preventDefault();
    return false;
  },101);

})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  //   .state('login', {
  //   url: "/",
  //   abstract: true,
  //   templateUrl: "app/views/partials/login.html"
  // })

  // Each tab has its own nav history stack:

  .state('login', {
    url: '/login',
    templateUrl: 'app/views/partials/login.html',
    controller: 'logControllers.loginCtrl'
  })

  .state('homepage', {
      url: '/',
      templateUrl: 'app/views/partials/homepage.html',
      controller: 'homepageControllers.homepageListCtrl'
  })

  .state('changePassword', {
      url: '/changePassword',
      templateUrl: 'app/views/partials/changePassword.html',
      controller: 'logControllers.changePwdCtrl'
  })

.state('clinicInfo', {
      url: '/clinicInfo',
      templateUrl: 'app/views/partials/clinicInfo.html',
      controller: 'clinicControllers.clinicInfoCtrl'
  })

.state('clinicNews', {
      url: '/clinicInfo/clinicNews',
      templateUrl: 'app/views/partials/clinicNews.html',
      controller: 'clinicControllers.clinicNewsCtrl'
  })

.state('clinicDoctor', {
      url: '/clinicInfo/clinicOffice/:officeName/clinicDoctor/:doctorId',
      templateUrl: 'app/views/partials/clinicDoctor.html',
      controller: 'clinicControllers.clinicDoctorCtrl'
  })

.state('dateList', {
      url: '/dateList',
      templateUrl: 'app/views/partials/dateList.html',
      controller: 'dateControllers.dateListCtrl'
  })

.state('dateTimeAble', {
      url: '/dateTimeAble',
      templateUrl: 'app/views/partials/dateTimeAble.html',
      controller: 'dateControllers.dateTimeAbleCtrl'
  })

.state('dateTimeChoose', {
      url: '/dateTimeChoose/:fromUserId/:username',
      templateUrl: 'app/views/partials/dateTimeChoose.html',
      controller: 'dateControllers.dateTimeChooseCtrl'
  })

.state('dateDetail', {
      url: '/dateDetail/:bookingTime/:userID',
      templateUrl: 'app/views/partials/dateDetail.html',
      controller: 'dateControllers.dateDetailCtrl'
  })

.state('userInfo', {
      url: '/userInfo',
      templateUrl: 'app/views/partials/userInfo.html',
      controller: 'userControllers.userInfoCtrl'
  })

.state('chatList', {
      url: '/chatList',
      templateUrl: 'app/views/partials/chatList.html',
      controller: 'chatControllers.chatListCtrl'
  })

.state('chatRoom', {
      url: '/chatRoom/:fromUserID/:fromUserName',
      templateUrl: 'app/views/partials/chatRoom.html',
      controller: 'chatControllers.chatRoomCtrl'
  })
.state('imagesShow', {
      url: '/imagesShow/:fromUserID/:fromUserName/:url',
      templateUrl: 'app/views/partials/imagesShow.html',
      controller: 'chatControllers.imagesShowCtrl'
  })

$urlRouterProvider.otherwise('/');

});

//-----------我的jquery.validate自定义表单验证项---------------
$.validator.methods.hasValidSymbol = function(value) {
    var regExp = /[^\+\-\*\/\!\@\#\$\?\w\d]/g;
    return !regExp.test(value);
};
