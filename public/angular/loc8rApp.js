angular.module('loc8rApp', []);

var _isNumeric = function (n) {
	return !isNaN(parseFloat(n) && isFinite(n));
};

var formatDistance = function () {
  return function (distance) {
    var numDistance, unit;
    if (distance && _isNumeric(distance)) {
      if (distance > 1) {
        numDistance = parseFloat(distance / 1000, 10).toFixed(1);
        unit = 'km';
      } else {
        numDistance = parseInt(distance * 1000, 10);
        unit = 'm';
      }
      return numDistance + unit;
    } else {
      return "?";
    }
  };
};

var locationListCtrl = function ($scope, loc8rData, geolocation) {
	$scope.message = "Проверка вашего местоположения1";

	$scope.getData = function (position) {	
		var lat = position.coords.latitude,
			lng = position.coords.longitude;
		$scope.message = "Поиск ближайщего места";
		


		loc8rData.locationByCoords(lat, lng)
			.success(function (data) {
				$scope.message = data.length > 0 ? "" : "Локации не найдены";
				$scope.data = { locations: data };
			})
			.error(function (e) {
				$scope.message = "Упс! У нас что-то случилось ((";
				console.log(e);
			});		


			
	};
	$scope.showError = function (error) {
		$scope.$apply(function (e) {
			$scope.message = error.message;
		});	
	};

	$scope.noGeo = function () {
		$scope.$apply(function () {
			$scope.message = "Геолокация не поддерживается вашим браузером.";
		});	
	};
	geolocation.getPosition($scope.getData, $scope.showError, $scope.noGeo);
};

var geolocation = function () {
	var getPosition = function (cbSuccess, cbError, cbNoGeo) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
		} else {
			cbNoGeo();
		}	
	};
	return {
		getPosition : getPosition
	};
}

var ratingStars = function () {
	return {
		scope: {
			thisRating : '=rating'
		},
		templateUrl: '/angular/rating-stars.html'		
	};
};

var loc8rData = function ($http) {
  var locationByCoords = function (lat, lng) {
    return $http.get('/api/locations?lng=' + lng + '&lat=' + lat + '&maxDistance=20');
  };
  return {
    locationByCoords : locationByCoords
  };
};

// var loc8rData = function ($http) {
// 	var locationByCoords = function (lat, lng) {
// 		return $http.get('/api/locations?lng=' + lng + '&lat=' + lat + '&maxDistance=20');
// 	};
// 	return {
// 		locationByCoords : locationByCoords
// 	};
// 	// return[{
// 	// 		name : "Суши wok",
//  //        	address : "Бульвар Гагарина, дом 85",
//  //        	rating : 3,
//  //        	facilities : [
//  //                "Сушки всякие",
//  //                "Напитки",
//  //                "wifi"
//  //        	],
// 	// 		distance: '0.78654',
// 	// 		_id: '111'
// 	// 	},
// 	// 	{
// 	// 		name : "Пироги С Пылу С Жару",
//  //        	address : "Бульвар Гагарина, дом 79",
//  //        	rating : 4,
//  //        	facilities : [
//  //                "Пирожки",
//  //                "Чай",
//  //                "Кофе",
//  //                "Потанцуем?",
//  //                "wifi"
//  //        	],
// 	// 		distance: '0.78654',
// 	// 		_id: '111'
// 	// 	},
// 	// 	{
// 	// 		name : "Столовка от технаря Пермь-нефть",
//  //        	address : "Бульвар Гагарина, дом 65",
//  //        	rating : 4,
//  //        	facilities : [
//  //                "Еда",
//  //                "Чай",
//  //                "Копот"
//  //        	],
// 	// 		distance: '0.78654',
// 	// 		_id: '111'
// 	// 	}];

// // lng : 56.2896306,		//долгота
// // 			lat : 58.0044448,		//широта
// // 			maxDistance : 20

	
// };

angular
  .module('loc8rApp')
  .controller('locationListCtrl', locationListCtrl)
  .filter('formatDistance', formatDistance)
  .directive('ratingStars', ratingStars)
  .service('loc8rData', loc8rData)
  .service('geolocation', geolocation);