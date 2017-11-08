(function () {

	angular
		.module('loc8rApp')
		.controller('homeCtrl', homeCtrl);

	homeCtrl.$inject = ['$scope', 'loc8rData', 'geolocation'];
	function homeCtrl($scope, loc8rData, geolocation) {
		var vm = this;
		vm.pageHeader = {
			title: 'loc8r',
			strapline: 'Найдите, неподалеку, место для работы с ВиФи'
		};
		vm.siderbar = {
			content: "Ищете место, где бы поработать с бесплатным доступом в интернет? Loc8r поможет вам в этом. Данный ресурс отображает ближайшие забегаловки с бесплатным ВиФИ."
		};
		vm.message = "Проверка вашего местоположения";
		vm.getData = function (position) {	
			var lat = position.coords.latitude,
				lng = position.coords.longitude;
			vm.message = "Поиск ближайщего места";
			loc8rData.locationByCoords(lat, lng)
				.success(function (data) {
					vm.message = data.length > 0 ? "" : "Локации не найдены";
					vm.data = { locations: data };				
				})
				.error(function (e) {
					vm.message = "Упс! У нас что-то случилось ((";
					console.log(e);
				});
		};
		vm.showError = function (error) {
			$scope.$apply(function () {
				vm.message = error.message;
			});	
		};

		vm.noGeo = function () {
			$scope.$apply(function () {
				vm.message = "Геолокация не поддерживается вашим браузером.";
			});	
		};
		geolocation.getPosition(vm.getData, vm.showError, vm.noGeo);
	}

})();