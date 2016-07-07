/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

angular.module('testApp').factory('AuthService', AuthService);

function AuthService($http, $rootScope, Upload, SettingsService){

  return {
    signIn: function(user, pass){
      return $http.post('/api/authenticate', {username: user, password: pass});
    },
    register: function(registerObj){
      return Upload.upload({
                url: '/api/register',
                data: registerObj
            });
    },
    getUserProfile: function(user){
      return $http.get('/api/profile/self');
    },
    updateUserProfile: function(userObj){
      return $http.put('/api/profile/self', userObj);
    },
    getUsernameProfile: function(user){
      return $http.get('/api/profile/public/'+user);
    },
    getAllUsers: function(){
      return $http.get('/api/profile/');
    },
    updateProfiles: function(currentUsername, userObj){
      return $http.put('/api/profile/admin/'+currentUsername, userObj);
    },
    deleteProfiles: function(currentUsername, userObj){
      return $http.delete('/api/profile/admin/'+currentUsername);
    },
    getAllPost: function(){
      return $http.get('/api/post');
    },
    getAllPublicPost: function(){
      return $http.get('/api/post/public');
    },
    getPost: function(postid){
      return $http.get('/api/post/'+postid);
    },
    getPublicPost: function(postid){
      return $http.get('/api/post/public/'+postid);
    },
    savePost: function(postObj, file){
      //return $http.post('/api/post', postObj);
      return Upload.upload({
                url: '/api/post',
                data: postObj
            });
    },
    updatePost: function(postid, postObj){
      return $http.put('/api/post/'+postid, postObj);
    },
    deletePost: function(postid, postObj){
      return $http.delete('/api/post/'+postid);
    },
    getSettings: function(){
      return $http.get('/api/settings');
    },
    updateSettings: function(setObj){
      return $http.put('/api/settings', setObj);
    },
    refreshSettingsFromDB: function(){
      return this.getSettings().success(function(data){
        SettingsService.blogSettings = data.settings;
      });
    }
  };

}
