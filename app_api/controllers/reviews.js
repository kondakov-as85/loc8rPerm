var mongoose = require('mongoose');
var Loc = mongoose.model('Location');
var User = mongoose.model('User');

var getAuthor = function (req, res, callback) {
	if (req.payload && req.payload.email) {
		User
			.findOne({email : req.payload.email})
			.exec(function (err, user) {
				if (!user) {
					sendJsonResponse(res, 404, {
						"message": "Пользователь не найден"
					});
					return;
				} else if (err) {
					console.log(err);
					sendJsonResponse(res, 404, err);
					return;
				}
				callback(req, res, user.name);
			});
	} else {
		sendJsonResponse(res, 404, {
			"message": "Пользователь не найден"
		});
		return;
	}
};

var sendJsonResponse = function (res, status, content) {
	res.status(status);
	res.json(content);
};

var doAddReview = function (req, res, location, author) {
	if (!location) {
		sendJsonResponse(res, 404, {
			"message": "locationid не задан"
		});
	} else {
		location.reviews = location.reviews || [];
		location.reviews.push({
			author: author,
			rating: req.body.rating,
			reviewText: req.body.reviewText
		});
		location.save(function (err, location) {
			var thisReview;
			if (err) {
				sendJsonResponse(res, 400, err);
			} else {
				updateAverageRating(location._id);
				thisReview = location.reviews[location.reviews.length - 1];
				sendJsonResponse(res, 201, thisReview);
			}			
		});
	}
};

var updateAverageRating = function (locationid) {
	Loc
		.findById(locationid)
		.select('rating reviews')
		.exec(
			function (err, location) {
				if (!err) {
					doSetAverageRating(location);
				}
			});
};

var doSetAverageRating = function (location) {
	var i, reviewCount, ratingAverage, ratingTotal;
	if (location.reviews && location.reviews.length >0) {
		reviewCount = location.reviews.length;
		ratingTotal = 0;
		for (var i = 0; i < reviewCount; i++) {
			ratingTotal = ratingTotal + location.reviews[i].rating;			
		}
		ratingAverage = parseInt(ratingTotal / reviewCount, 10);
		location.rating = ratingAverage;
		location.save(function (err) {
			if (err) {
				console.log(err);
			} else {
				console.log("Average rating update to", ratingAverage);
			}
		});
	}
};

module.exports.reviewCreate = function (req, res) {
	getAuthor(req, res, function (req, res, userName) {
		var locationid = req.params.locationid;
		if (locationid) {
			Loc
				.findOne({ _id: locationid })
				.exec(
					function (err, location) {
						if (err) {
							sendJsonResponse(res, 400, err);
						} else {
							doAddReview(req, res, location, userName);
						}
					}

					);
		} else {
			sendJsonResponse(res, 404, {
				"message": "locationid обязательный параметр!"
			});
		}
	});
};

module.exports.reviewReadOne = function (req, res) {
	if (req.params && req.params.locationid && req.params.reviewid) {
		Loc
			.findById(req.params.locationid)
			.select('name reviews')
			.exec(
				function (err, location) {
					var response, review;
					if (!location) {
						sendJsonResponse(res, 404, {
							"message": "Локация не найдена!"
						});
						return;
					} else if (err) {
						sendJsonResponse(res, 400, err);						
						return;
					}
					if (location.reviews && location.reviews.length > 0) {
						review = location.reviews.id(req.params.reviewid);
						if (!review) {
							sendJsonResponse(res, 404, {
								"message": "Нет отзыва с таким идентификатором"
							});
						} else {
							response = {
								location : {
									name : location.name,
									id : req.params.locationid
								},
								review : review
							};
							sendJsonResponse(res, 200, response);
						}
					} else {
						 sendJsonResponse(res, 404, {
						 	"message": "Отзыв не найден"
						 });
					}
				}
				);
	} else {
		sendJsonResponse(res, 404, {
			"message": "Не найдена локация и отзыв!!!"
		});
	}	

};

module.exports.reviewUpdateOne = function (req, res) {
	if (!req.params.locationid || !req.params.reviewid) {
		sendJsonResponse(res, 404, {
			"message" : "Идентификатор локации и отзыва обязательны " 
		});	
		return;
	}
	Loc
		.findById(req.params.locationid)
		.select('reviews')
		.exec(
			function (err, location) {
				var thisReview;
				if (!location) {
					sendJsonResponse(res, 400, {
						"message: " : "Идентификатор локации не найден"
					});
					return;
				} else if (err) {
					sendJsonResponse(res, 400, err);
					return;
				}
				if (location.reviews && location.reviews.length > 0) {
					thisReview = location.reviews.id(req.params.reviewid);
					if (!thisReview) {
						sendJsonResponse(res, 404, {
							"message": "Идентификатор отзыва не найден"
						});
					} else {
						thisReview.author = req.body.author;
						thisReview.rating = req.body.rating;
						thisReview.reviewText = req.body.reviewText;
						location.save(function (err, location) {
							if (err) {
								sendJsonResponse(res, 404, err)
							} else {
								updateAverageRating(location._id);
								sendJsonResponse(res, 200, thisReview);
							}
						});
					}
				} else {
					sendJsonResponse(res, 404, {
						"message": "Нет отзыва для обновления"
					});
				}
			}
			);
};

module.exports.reviewDeleteOne = function (req, res) {
	if (!req.params.locationid || !req.params.reviewid) {
		sendJsonResponse(res, 404, {
			"message": "Не указаны обязательные параметры locationid и reviewid"
		});
		return;
	}
	Loc
		.findById(req.params.locationid)
		.select('reviews')
		.exec(
			function (err, location) {
				if (!location) {
					sendJsonResponse(res, 400, {
						"message": "идентификатор локации не найден"
					});
					return;
				} else if (err) {
					sendJsonResponse(res, 400, err);
					return;
				}
				if (location.reviews && location.reviews.length > 0) {
					if (!location.reviews.id(req.params.reviewid)) {
						sendJsonResponse(res, 404, {
							"message": "Идентификатор отзыва не найден"
						});
					} else {
						location.reviews.id(req.params.reviewid).remove();
						location.save(function (err) {
							if (err) {
								sendJsonResponse(res, 404, err);
							} else {
								updateAverageRating(location._id);
								sendJsonResponse(res, 204, null);
							}
						});
					}
				} else {
					sendJsonResponse(res, 404, {
						"message": "Нет отзыва для удаления"
					});
				}
			}
			);
};