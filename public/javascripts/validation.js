$('#addReview').submit(function (e) {
	$('.alert.alert-dange').hide(); 
	if (!$('input#name').val() || !$('select#rating').val() || !$('textarea#review').val()) {
		if ($('.alert.alert-danger').length) {
			$('.alert.alert-danger').show();
		} else {
			$(this).prepend('<div role="alert" class="alert alert-danger">Все поля формы обязательны</div>');
		}
		return false;
	}
});