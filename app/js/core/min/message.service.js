/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

MessageService.$inject = ['$rootScope'];
angular.module('testApp').factory('MessageService', MessageService);

function MessageService($rootScope){

  var service = {};
  service.success = success;
  service.error = error;

  function success(msg){
    $rootScope.message = {
      text: msg,
      type: 'success',
      show: true
    };
  }

  function error(msg){
    $rootScope.message = {
      text: msg,
      type: 'danger',
      show: true
    };
  }

  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                delete $rootScope.message;
  });

  return service;
}
