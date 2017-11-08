(function () {

	angular
		.module('loc8rApp')
		.controller('reviewModalCtrl', reviewModalCtrl);
	
	reviewModalCtrl.$inject = ['$uibModalInstance', 'loc8rData', 'locationData']; 
	function reviewModalCtrl($uibModalInstance, loc8rData, locationData) {	
		var vm = this;
		vm.locationData = locationData;
		
		vm.onSubmit = function () {
			vm.formError = "";			
			if (!vm.formData.rating || !vm.formData.reviewText) {				//!vm.formData.name || 
				vm.formError = "Все поля обязательны для заполнения"				
				return false;
			} else {
				vm.doAddReview(vm.locationData.locationid, vm.formData);				
			}
		};
		vm.doAddReview = function (locationid, formData) {
			loc8rData.addReviewById(locationid, {
				//author : formData.name,
				rating : formData.rating,
				reviewText : formData.reviewText
			})
			.success(function (data) {
				vm.modal.close(data);				
			})
			.error(function (data) {
				vm.formError = "Ваш отзыв не был сохранен, повторите попытку";
			})
			return false;
		};

		vm.modal = {
			close : function (result) {
				$uibModalInstance.close(result);				
			},
			cancel : function () {				
				$uibModalInstance.dismiss('cancel')					
			}
		};
	}

})();