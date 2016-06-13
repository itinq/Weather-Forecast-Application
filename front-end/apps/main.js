(function () {
    'use strict';

    var app = angular
        .module('app', ['ngRoute', 'ngCookies', 'ngAnimate', 'ngAria'])
        .config(config)
        .run(run);

    config.$inject = ['$routeProvider', '$locationProvider', '$httpProvider'];
    function config($routeProvider, $locationProvider, $httpProvider) {
        $routeProvider
            .when('/', {
                controller: 'HomeController',
                templateUrl: 'apps/home.view.html',
                controllerAs: 'home'
            });
    }

    run.$inject = ['$rootScope', '$location', '$cookieStore', '$http'];
    function run($rootScope, $location, $cookieStore, $http) {

        $rootScope.title = 'Weather Forecast Application';
        $rootScope.server = 'http://localhost/server/public/api/';
        
        if ( !$cookieStore.get('recent') ) {
            $rootScope.recent = [];
        } else {
            $rootScope.recent = $cookieStore.get('recent');
        }
    }

    app.directive('selectOnClick', function() {
        return function (scope, element, attrs) {
            element.bind('click', function () {
                this.select();
            });
        };
    });

})();