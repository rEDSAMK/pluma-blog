/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

angular.module('testApp').factory('TokenInterceptor', ['$q', '$window', '$location', '$injector', 'SettingsService', 'MessageService', function ($q, $window, $location,$injector, SettingsService, MessageService) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.localStorage.token) {
                config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
            }
            return config;
        },

        requestError: function(rejection) {
            return $q.reject(rejection);
        },

        /* Set Authentication.isAuthenticated to true if 200 received
        response: function (response) {
            if (response != null && response.status == 200 && $window.sessionStorage.token) {
                //AuthenticationService.isAuthenticated = true;
            }
            return response || $q.when(response);
        },
*/
        /* Revoke client authentication if 401 is received */
        responseError: function(rejection) {
            if (rejection != null && rejection.status === 401) {
                console.log("401");
                delete $window.localStorage.token;
                SettingsService.authenticated(false);
                SettingsService.currentUser = {};
                MessageService.error("Not authenticated, you must Log In");
                $injector.get('$state').transitionTo('login');
            }
            if (rejection != null && rejection.status === 403) {
                console.log("403");
                $injector.get('$state').transitionTo('home');
                MessageService.error(rejection.data.status);
            }
            return $q.reject(rejection);
        }
    };
}]);
