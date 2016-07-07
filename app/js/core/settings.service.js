/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

angular.module('testApp').factory('SettingsService', SettingsService);

function SettingsService($rootScope){
  var settings = {
    pageTitle: 'AngularJS Home',
    banner: '../desk.jpg',
    bannerDefault: '../desk.jpg',
    blogSettings: {
      navBrand: '',
      signupEnabled: true
    },
    authenticated: function(isBool){
      $rootScope.authenticated = isBool;
    },

    isAuthenticated: function(){
      return $rootScope.authenticated;
    },
    currentUser: {}
  };

  return settings;
}
