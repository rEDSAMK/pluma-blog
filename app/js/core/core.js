/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


myApp = angular.module('testApp', ['ui.router', 'ngSanitize', 'ui.tinymce', 'ngFileUpload','ui.bootstrap']);

myApp.run(function($window, SettingsService, AuthService, UtilityService, $state, MessageService){
  if ($window.localStorage.token) {
    SettingsService.authenticated(true);
    var usr = UtilityService.tokenData().user;
    AuthService.getUserProfile(usr).success(function(data){
      SettingsService.currentUser = data;
    }).error(function(data, status){
      console.log(status+': '+data);
      $state.go("login");
      MessageService.error("User not logged in! " +data);
    });
  }else {
    SettingsService.authenticated(false);
  }

  /*AuthService.getSettings().success(function(data){
    SettingsService.blogSettings = data.settings;
  });*/
  AuthService.refreshSettingsFromDB();
});

myApp.controller('ProfileController', ['$scope', 'SettingsService', 'userData', 'AuthService', '$state', 'MessageService', 'UtilityService', function($scope, SettingsService, userData, AuthService, $state, MessageService, UtilityService){
  SettingsService.currentUser = userData.data;
  $scope.user = angular.copy(SettingsService.currentUser);
  $scope.role = $scope.user.role.split("_")[1];

  $scope.saveUserEdit = function(){
    var userObj = {
      name: $scope.user.name,
      email: $scope.user.email,
      github: $scope.user.github,
      facebook: $scope.user.facebook,
      twitter: $scope.user.twitter,
      description: $scope.user.description
    };

    var checks = true;

    console.log(!UtilityService.isEmpty($scope.oldPassword) && !UtilityService.isEmpty($scope.newPasswordA) && !UtilityService.isEmpty($scope.newPasswordB));
    if(!UtilityService.isEmpty($scope.oldPassword) || !UtilityService.isEmpty($scope.newPasswordA) || !UtilityService.isEmpty($scope.newPasswordB)){
      if(!UtilityService.isEmpty($scope.oldPassword) && !UtilityService.isEmpty($scope.newPasswordA) && !UtilityService.isEmpty($scope.newPasswordB)){
          if($scope.newPasswordA === $scope.newPasswordB){
            userObj.oldpassword = $scope.oldPassword;
            userObj.newpassword = $scope.newPasswordA;
            checks = true;
          }else {
            MessageService.error("Password fields are not equal");
            checks = false;
          }
      }else{
        MessageService.error("Password fields empty");
        checks = false;
      }
    }

    if(checks)
      AuthService.updateUserProfile(userObj).success(function(data){
        $state.go($state.current, {}, {reload: true});
        MessageService.success("User data updated!");
      }).error(function(data, status){
        //$state.go("profile");
        MessageService.error("Error in update user data: "+data);
      });

  }
}]);

myApp.controller('ProfileUserController', ['MessageService', '$state', 'AuthService', '$stateParams', '$scope', 'SettingsService', function(MessageService, $state, AuthService, $stateParams, $scope, SettingsService){
  console.log($stateParams.username);

  AuthService.getUsernameProfile($stateParams.username).success(function(data){
    $scope.user = data;
    SettingsService.pageTItle = "Profile: "+$scope.user.name;
  }).error(function(data, status){
    $state.go("home");
    MessageService.error(data);
  });
}]);

myApp.controller('PostController', ['$timeout', 'postData', 'MessageService', '$state', 'AuthService', '$stateParams', '$scope', 'SettingsService', function($timeout, postData, MessageService, $state, AuthService, $stateParams, $scope, SettingsService){
    $scope.post = postData.data;
    SettingsService.pageTitle = $scope.post.title;
    SettingsService.banner = '../upload/'+$scope.post.banner;
    $timeout(function(){Prism.highlightAll(false);},0);
}]);

myApp.controller('SettingsController', ['$scope', 'SettingsService', 'MetaTagService', function($scope, SettingsService, MetaTagService) {
  $scope.settings = SettingsService;
  $scope.metatag = MetaTagService;
}]);

myApp.controller('TabTestController', ['$scope', function($scope){
  $scope.data = [
    {id: 0, val: getRandom(100), key: "test"},
    {id: 1, val: getRandom(100), key: "test"},
    {id: 2, val: getRandom(100), key: "test"},
    {id: 3, val: getRandom(100), key: "test"}
  ];
}]);

myApp.controller('indexController', ['$scope', 'AuthService', '$stateParams', 'MessageService', 'filterFilter',  function($scope, AuthService, $stateParams, MessageService, filterFilter){

  $scope.setPage = function (pageNo) {
    $scope.currentPage = pageNo;
  };

  $scope.posts = [];

  console.log($stateParams);

  $scope.$watch('tagSearch', function (newVal, oldVal) {
    $scope.filtered = filterFilter($scope.posts, newVal);
    $scope.totalItems = $scope.filtered.length;
    $scope.currentPage = 1;
    $scope.currentlySelected = -1;
  }, true);

  AuthService.getAllPublicPost().success(function(posts){
    $scope.posts = posts;
    $scope.tagSearch = {
      tag: {
        name: $stateParams.tag
      }
    };
    $scope.viewby = 6;
    $scope.totalItems = $scope.posts.length;
    $scope.currentPage = 1;
    $scope.itemsPerPage = $scope.viewby;
    $scope.maxSize = 5; //Number of pager buttons to show
  }).error(function(data, status){
    MessageService.error(data);
  });
}]);

myApp.controller('RegisterController', ['$scope', 'UtilityService', 'MessageService', 'AuthService', '$state', function($scope, UtilityService, MessageService, AuthService, $state){

  $scope.register = function(){
    if(UtilityService.isEmpty($scope.username) || UtilityService.isEmpty($scope.password) || UtilityService.isEmpty($scope.email) || UtilityService.isEmpty($scope.displayname))
      MessageService.error("Empty fields!");
    else{
      var registerObj = {
        name: $scope.displayname,
        username: $scope.username,
        password: $scope.password,
        email: $scope.email,
        github: $scope.github,
        facebook: $scope.facebook,
        twitter: $scope.twitter,
        description: $scope.description,
        file: $scope.avatarFile
      };

      AuthService.register(registerObj).success(function(data){
        $state.go('login');
        MessageService.success('User '+registerObj.username+' registrated! Please Log in');
      }).error(function(data, status){
        MessageService.error('Error '+status+': '+data);
      });
    }

  }

}]);

myApp.controller('LogoutController', ['$window', 'SettingsService', 'MessageService', '$state', function($window, SettingsService, MessageService, $state){
  if ($window.sessionStorage.token || SettingsService.isAuthenticated()) {
      delete $window.localStorage.token;
      SettingsService.authenticated(false);
      SettingsService.currentUser = null;
      $state.go("home");
      MessageService.success("Succesfully logged out");
  }
}]);

myApp.controller('AboutController', ['$scope', 'SettingsService', function($scope, SettingsService){
  $scope.about = SettingsService.blogSettings.about;

  $scope.tinymceOptions = {
    plugins: 'link image code visualblocks',
    br_in_pre: true,
    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code | visualblocks'
  };
}]);

myApp.factory('MetaTagService', MetaTagService);

function MetaTagService(){
  var settings = {
    description: 'Pluma Blog - Vincenzo "rEDSAMK" Greco - MEAN stack, developer, blog',
    keywords: 'MEAN stack developer code blog pluma Pluma Blog Project angularJS node.js express mongodb opensource open source Vincenzo Greco rEDSAMK',
  };

  return settings;
}


myApp.controller('LoginController', ['$scope', 'MessageService', 'AuthService', 'SettingsService', '$state', '$window', function($scope, MessageService, AuthService, SettingsService, $state, $window){

  $scope.signIn = function(){
    if($scope.username == null || $scope.username === "" || $scope.password == null || $scope.password  === "")
      MessageService.error("Empty");
    else {
      AuthService.signIn($scope.username, $scope.password).success(function(data){
        SettingsService.authenticated(true);
        $window.localStorage.token = data.token;
        AuthService.getUserProfile($scope.username).success(function(data){
          SettingsService.currentUser = data;
        }).error(function(data, status){
          console.log(status+': '+data);
        });
        $state.go('home');
        MessageService.success("Logged in!");
      }).error(function(data, status){
          MessageService.error("Error in login: "+data.status);

      });
    }
  }
}]);

myApp.controller('AdminController', ['$scope', 'UtilityService', '$state', 'SettingsService', 'MessageService', 'AuthService', function($scope, UtilityService, $state, SettingsService, MessageService, AuthService){
  $scope.$state = $state;
  $scope.blogSettings = angular.copy(SettingsService.blogSettings);


  $scope.saveSettings = function(){
    var setObj = {
      signupEnabled: $scope.blogSettings.signupEnabled,
      navBrand: $scope.blogSettings.navBrand,
      about: $scope.blogSettings.about
    };

    AuthService.updateSettings($scope.blogSettings).success(function(data){
      MessageService.success("Settings updated!");
      SettingsService.blogSettings = data.settings;
    }).error(function(data, status){
      MessageService.error("Error in updating the settings: "+data.data);
    });
  }
}]);
myApp.controller('AdminNewPostController', ['$scope', 'UtilityService', 'AuthService', 'MessageService', 'Upload', function($scope, UtilityService, AuthService, MessageService, Upload){
  $scope.tinymceModel = 'Write here your post!';

  AuthService.getAllPost().success(function(posts){
    $scope.posts = posts;
  }).error(function(data, status){
    MessageService.error(data);
  });

  $scope.status = "published";

  $scope.savePost = function(){
    console.log($scope.bannerFile);
    var postObj = {
      title: $scope.title,
      tags: $scope.tags,
      content: $scope.tinymceModel,
      status: $scope.status,
      file: $scope.bannerFile
    };

    AuthService.savePost(postObj, $scope.bannerFile).success(function(data){
      MessageService.success("Post: "+data.post.title+" succesfully added!");
    }).error(function(data, status){
      MessageService.error(data);
    });
  }

  $scope.tinymceOptions = {
    plugins: 'link image code visualblocks',
    br_in_pre: true,
    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code | visualblocks'
  };
}]);

myApp.controller('AdminEditPostController', ['filterFilter', '$scope', 'UtilityService', 'AuthService', 'MessageService', '$state', '$timeout', function(filterFilter, $scope, UtilityService, AuthService, MessageService, $state, $timeout){
  $scope.setPage = function (pageNo) {
    $scope.currentPage = pageNo;
  };

    $scope.posts = [];

  $scope.filterStatusFunction = function(){
    $scope.postSearch.status = $scope.filterStatus;
    console.log($scope.postSearch);
  }


  $scope.$watch('postSearch', function (newVal, oldVal) {
    $scope.filtered = filterFilter($scope.posts, newVal);
    $scope.totalItems = $scope.filtered.length;
    $scope.currentPage = 1;
    $scope.currentlySelected = -1;
}, true);

  AuthService.getAllPost().success(function(posts){
    $scope.posts = posts;
    $scope.postSearch = {
      status: ''
    }; //init postSearch for trigger the first $watch

    $scope.viewby = 6;
    $scope.totalItems = $scope.posts.length;
    $scope.currentPage = 1;
    $scope.itemsPerPage = $scope.viewby;
    $scope.maxSize = 5; //Number of pager buttons to show

  }).error(function(data, status){
    MessageService.error(data);
  });

  $scope.deletePost = function(){
    var currentId = $scope.postFiltered[$scope.currentlySelected]._id;
    AuthService.deletePost(currentId).success(function(post){
      $state.go($state.current, {}, {reload: true});
      MessageService.success(post.status);
    }).error(function(data, status){
      MessageService.error(data);
    });s
  }

  $scope.updatePost = function(){
    var updateObj = {
      title: $scope.title,
      tags: $scope.tags,
      content: $scope.content,
      status: $scope.status
    }
    var currentId = $scope.postFiltered[$scope.currentlySelected]._id;
    AuthService.updatePost(currentId, updateObj).success(function(updatedPost){
      $state.go($state.current, {}, {reload: true});
      MessageService.success(updatedPost.status);
    }).error(function(data, status){
      MessageService.error(data);
    });
  }

  $scope.currentlySelected = -1;
  $scope.select = function(i){
    if($scope.currentlySelected == i)
      $scope.currentlySelected = -1;
    else{
      $scope.currentlySelected = i;
      angular.forEach(_.omit($scope.postFiltered[i],['date','__v','_id','$$hashKey']), function(value, key) {
        console.log(key);
        if(key === "tag"){
          $scope.tags = '';
          var temp = Array();
          $scope.postFiltered[i].tag.forEach(function(tag){
            temp.push(tag.name);
          });
          $scope.tags = temp.join(',');
        }else
          $scope[key] = $scope.postFiltered[i][key];
      });
      $scope.updatePrism();
    }
  }

  $scope.updatePrism = function(){
    $timeout(function(){Prism.highlightAll(false);}, 0);
  }

  $scope.content = 'Write here your post!';

  $scope.tinymceOptions = {
    plugins: 'link image code visualblocks',
    br_in_pre: true,
    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code | visualblocks'
  };
}]);


myApp.controller('AdminUsersController', ['filterFilter', '$scope', 'UtilityService', 'AuthService', 'MessageService', '$state', '$timeout', function(filterFilter, $scope, UtilityService, AuthService, MessageService, $state, $timeout){

  $scope.users = [];
  AuthService.getAllUsers().success(function(users){
    $scope.users = users;
    $scope.userSearch = {
      username: '',
      role: ''
    }; //init postSearch for trigger the first $watch

    $scope.viewby = 6;
    $scope.totalItems = $scope.users.length;
    $scope.currentPage = 1;
    $scope.itemsPerPage = $scope.viewby;
    $scope.maxSize = 5; //Number of pager buttons to show
  });

  $scope.$watch('userSearch', function (newVal, oldVal) {
    $scope.filtered = filterFilter($scope.users, newVal);
    $scope.totalItems = $scope.filtered.length;
    $scope.currentPage = 1;
    $scope.currentlySelected = -1;
  }, true);

  $scope.currentlySelected = -1;
  $scope.select = function(i){
    if($scope.currentlySelected == i)
      $scope.currentlySelected = -1;
    else{
      $scope.currentlySelected = i;
      angular.forEach(_.omit($scope.userFiltered[i],['__v','_id','$$hashKey']), function(value, key) {
        console.log(key);
        $scope[key] = $scope.userFiltered[i][key];
      });
    }
  }

  $scope.deleteUser = function(){
    var currentUsername = $scope.userFiltered[$scope.currentlySelected].username;
    AuthService.deleteProfiles(currentUsername).success(function(updatedUser){
      $state.go($state.current, {}, {reload: true});
      MessageService.success(updatedUser.status);
    }).error(function(data, status){
      MessageService.error(data);
    });
  }

  $scope.saveUser = function(){
    var updateObj = {
      role: $scope.role,
    }
    var currentUsername = $scope.userFiltered[$scope.currentlySelected].username;
    AuthService.updateProfiles(currentUsername, updateObj).success(function(updatedUser){
      $state.go($state.current, {}, {reload: true});
      MessageService.success(updatedUser.status);
    }).error(function(data, status){
      MessageService.error(data);
    });
  }

}]);

function getRandom(n){
  return Math.floor(Math.random() * 100);
}

myApp.run(['$rootScope', 'SettingsService','$state', 'MessageService','$templateCache', '$window', '$location', function($rootScope, SettingsService, $state, MessageService, $templateCache, $window, $location){

  $window.ga('create', 'UA-80202800-2', 'auto');

  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    SettingsService.pageTitle = toState.data.title;
    SettingsService.banner = SettingsService.bannerDefault;
    $window.ga('send', 'pageview', $location.path());
  });
  
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if(toState.data.requireAuthentication && !SettingsService.isAuthenticated()){
      event.preventDefault();
      $state.go('login');
      MessageService.error("Auth user required");
    }
    if(toState.templateUrl === "/api/test/"){
      $templateCache.remove(toState.templateUrl);
    }
  });
}]);

myApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
});


myApp.factory('UtilityService', function($window){
  return {
    isEmpty: function(str){
      if(str == null || str == "")
        return true;
      else
        return false;
    },
    tokenData: function(){
      var token = $window.localStorage.token;
      return JSON.parse($window.atob(token.split(".")[1]));
    }
  };
});

myApp.config(function($stateProvider, $urlRouterProvider, $locationProvider){

  $locationProvider.html5Mode({ enabled: true, requireBase: false });

  $stateProvider
  .state('home', {
    url: '/',
    templateUrl: 'route/index.html',
    controller: 'indexController',
    data: {title: 'Home', requireAuthentication: false}
  })
  .state('hometag', {
    url: '/tag/{tag}',
    templateUrl: 'route/index.html',
    controller: 'indexController',
    data: {title: 'Home tags', requireAuthentication: false}
  })
  .state('tab', {
    url: '/tab',
    templateUrl: 'route/tab.html',
    controller: 'TabTestController',
    data: {title: 'Tab', requireAuthentication: true}
  })
  .state('login', {
    url: '/login',
    templateUrl: 'route/login.html',
    controller: 'LoginController',
    data: {title: 'Login', requireAuthentication: false}
  })
  .state('register', {
    url: '/register',
    templateUrl: 'route/register.html',
    controller: 'RegisterController',
    data: {title: 'Register', requireAuthentication: false}
  })
  .state('logout', {
    url: '/logout',
    controller: 'LogoutController',
    data: {title: 'Logout', requireAuthentication: true}
  })
  .state('profile', {
    url: '/profile',
    templateUrl: 'route/profile.html',
    controller: 'ProfileController',
    resolve: {
      userData: function(SettingsService, UtilityService, $window, AuthService, $state, MessageService){
        if ($window.localStorage.token) {
          var usr = UtilityService.tokenData().user;
          return AuthService.getUserProfile(usr).error(function(data, status){
            console.log(status+': '+data);
            $state.go("login");
            MessageService.error("User not logged in! " +data);
          });
        }
      }
    },
    data: {title: 'Profile', requireAuthentication: true}
  })
  .state('profileUser', {
    url: '/profile/{username}',
    templateUrl: 'route/profile.user.html',
    controller: 'ProfileUserController',
    data: {title: 'Profile', requireAuthentication: false}
  })
  .state('post', {
    url: '/post/{id}',
    templateUrl: 'route/post.html',
    controller: 'PostController',
    resolve: {
      postData: function(AuthService, $stateParams, $q, MessageService, $state){
        return AuthService.getPublicPost($stateParams.id).error(function(data, status){
          $state.go("home");
          MessageService.error("Error on retriving the post! " +data);
        });
      },
      metatag: function(postData, MetaTagService){
        postData.data.tag.forEach(function(key){
          MetaTagService.keywords += key.name + " ";
        });
      }
    },
    data: {title: 'Post', requireAuthentication: false}
  })
  .state('admin', {
      url: '/admin',
      templateUrl: '/api/admin/',
      controller: 'AdminController',
      resolve:{
        refreshSettings: function(AuthService){
          return AuthService.refreshSettingsFromDB();
        }
      },
      data: {title: 'Admin', requireAuthentication: true}

    })
  .state('admin.adminNewPost', {
            url: '/newPost',
    views: {
      'adminapp@admin': {
        templateUrl: '/api/admin/newPost',
        controller: 'AdminNewPostController',
      }
    },
    data: {title: 'Admin: New post', requireAuthentication: true}
  })
  .state('admin.adminEditPost', {
              url: '/editPost',
      views: {
        'adminapp@admin': {
          templateUrl: '/api/admin/editPost',
          controller: 'AdminEditPostController',
        }
      },
      data: {title: 'Admin: Manage posts', requireAuthentication: true}
    })
    .state('admin.adminUsers', {
                url: '/users',
        views: {
          'adminapp@admin': {
            templateUrl: '/api/admin/users',
            controller: 'AdminUsersController',
          }
        },
        data: {title: 'Admin: Users', requireAuthentication: true}
    })
    .state('about', {
      url: '/about',
      controller: 'AboutController',
      templateUrl: 'route/about.html',
      resolve:{
        refreshSettings: function(AuthService){
          return AuthService.refreshSettingsFromDB();
        }
      },
      data: {title: 'About', requireAuthentication: false}
    })
    .state('notfound', {
      url: '/404',
      controller: 'NotfoundController',
      templateUrl: 'route/404.html',
      data: {title: '404: Page not found', requireAuthentication: false}
    });

  $urlRouterProvider.otherwise("/404");

});
