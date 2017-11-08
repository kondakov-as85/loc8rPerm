(function () {
	angular
		.module('loc8rApp')
		.controller('aboutCtrl', aboutCtrl);

	function aboutCtrl() {
		var vm = this;
		vm.pageHeader = {
			title: 'О нас.',
		};
		vm.main = {
			content: 'dddw w w w w  e e\n  eeeeeeeee  e e e '
		};
	}
})();