(function () {
    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController)

    HomeController.$inject = ['$rootScope', '$scope', '$http', '$cookieStore'];
    function HomeController($rootScope, $scope, $http, $cookieStore) {

        var getFullDate = function(time) {
            var dateTime = new Date(time * 1000);
            var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
            return days[dateTime.getDay()];
        }

        var getShortDate = function(time) {
            var dateTime = new Date(time * 1000);
            var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
            return days[dateTime.getDay()];
        }

        var getShortTime = function(time) {
            var dateTime = new Date(time * 1000);
            var hours = dateTime.getHours();
            var minutes = dateTime.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            return hours + ':' + minutes + ' ' + ampm;
        }

        var temperatureConversion = function(fahrenheit) { //To Celsius
            return (parseFloat(fahrenheit) - 32) * 5 / 9;
        }

        $scope.getPlaceName = function(lat, lng) { //Find place name
            var reverseGeocodingURL = 'http://maps.googleapis.com/maps/api/geocode/json?sensor=false&language=en&latlng=' + lat + ',' + lng;
            $.get(reverseGeocodingURL, function(response) {
                $scope.placeName = response['results'][2]['address_components'][2]['long_name'] + ', ' + response['results'][2]['address_components'][3]['long_name'];
            });
        }

        $scope.getCurrentLocation = function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition($scope.getLocationSuccess); //Call getLocationSuccess function if user allowed
            } else { 
                console.log("Geolocation is not supported :(");
            }
        }

        $scope.getLocationSuccess = function(position) {
            $scope.getPlaceName(position.coords.latitude, position.coords.longitude);
            $scope.currentLatitude = position.coords.latitude;
            $scope.currentLongitude = position.coords.longitude;
            $scope.renderData();
        }

        $scope.renderData = function() {
            var apiURL = $rootScope.server + $scope.currentLatitude +','+ $scope.currentLongitude;
            $http.get(apiURL).success(function(response) {
                $scope.rawData = response;
                $scope.forecast = [{ //Currently
                    id: 0,
                    fullDate      : getFullDate($scope.rawData[0]['time']),
                    shortDate     : getShortDate($scope.rawData[0]['time']),
                    time          : getShortTime($scope.rawData[0]['time']),
                    summary       : $scope.rawData[0]['summary'],
                    icon          : $scope.rawData[0]['icon'],
                    temperature   : temperatureConversion($scope.rawData[0]['temperature']),
                    temperatureMin: temperatureConversion($scope.rawData[0]['temperature']),
                    temperatureMax: temperatureConversion($scope.rawData[0]['temperature']),
                }];

                var icons = new Skycons({"color": "black"});
                icons.set('canvas-0', $scope.rawData[0]['icon']);

                for (var i = 1; i <= $scope.rawData.length - 1; i++) {
                    $scope.forecast.push({
                        id: i,
                        fullDate      : getFullDate($scope.rawData[i]['time']),
                        shortDate     : getShortDate($scope.rawData[i]['time']),
                        time          : '',
                        summary       : $scope.rawData[i]['summary'],
                        icon          : $scope.rawData[i]['icon'],
                        temperature   : temperatureConversion($scope.rawData[i]['temperatureMax']),
                        temperatureMin: temperatureConversion($scope.rawData[i]['temperatureMin']),
                        temperatureMax: temperatureConversion($scope.rawData[i]['temperatureMax']),
                    });
                    icons.set('canvas-' + i, $scope.rawData[i]['icon']);
                }

                $scope.collection = angular.copy($scope.forecast);

                icons.play();

            });

            /*setTimeout(function(){
                console.log("Location: " + $scope.placeName);
                console.log("Latitude: " + $scope.currentLatitude + ", Longitude: " + $scope.currentLongitude);
                console.log($scope.rawData);
                console.log($scope.forecast);
            }, 1000);*/

        }

        $scope.otherDay = function(i) {
            $scope.forecast[0] = $scope.collection[i];
        }

        $scope.getCurrentLocation(); //Initial

        $scope.geolocate = function() { //When search
            var input = document.getElementById('location');
            var autocomplete = new google.maps.places.Autocomplete(input);
            google.maps.event.addListener(autocomplete, 'place_changed', function () {
                var place = autocomplete.getPlace();
                $scope.placeName = place.formatted_address;
                $scope.currentLatitude = place.geometry.location.lat();
                $scope.currentLongitude = place.geometry.location.lng();

                $scope.renderData();

                $rootScope.recent.push({ //Keep search in cookie
                    plc: place.formatted_address,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                });
                if ( $rootScope.recent.length > 5 ) $rootScope.recent.splice(0, 1);
                $cookieStore.put('recent', $rootScope.recent);

            });
        }
        google.maps.event.addDomListener(window, 'load', $scope.geolocate);

        $scope.recentLocation = function(i) { //Recent location
            $scope.placeName = $rootScope.recent[i]['plc'];
            $scope.currentLatitude = $rootScope.recent[i]['lat'];
            $scope.currentLongitude = $rootScope.recent[i]['lng'];
            $scope.renderData();
        }

        //Card Link Active
        $scope.select= function(item) {
            $scope.selected = item;
        };
        $scope.isActive = function(item) {
            return $scope.selected === item;
        };

    }
})();