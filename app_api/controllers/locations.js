var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var sendJsonResponse = function (res, status, content) {
	res.status(status);
	res.json(content);
};

var meterConversion = (function() {
    var mToKm = function(distance) {
        return parseFloat(distance / 1000);
    };
    var kmToM = function(distance) {
        return parseFloat(distance * 1000);
    };
    return {
        mToKm : mToKm,
        kmToM : kmToM
    };
})();


module.exports.locationsListByDistance = function (req, res) {
	var lng = parseFloat(req.query.lng);
	var lat = parseFloat(req.query.lat);
	var maxDistance = parseFloat(req.query.maxDistance);
	var point = {
		type: "Point",
		coordinates: [lng, lat]
	};
	var geoOptions = {
		spherical: true,
		maxDistance: meterConversion.kmToM(maxDistance),
		num: 10
	};
	if ((!lng && lng!==0) || (!lat && lat!==0) || !maxDistance) {	
		console.log('Отсутствуют параметры широты, долгоды или дистанции');
		sendJsonResponse(res, 404, {
			"message": "широта, долгота и дистанция обязательные параметры"
		});
		return;
	}
	Loc.geoNear(point, geoOptions, function (err, results, stats) {
		var locations;
		if (err) {
			console.log('geoNear error:', err);
			sendJsonResponse(res, 404, err);
		} else {
			locations = buildLocationList(req, res, results, stats);      
			sendJsonResponse(res, 200, locations);
		}
	});
};

var buildLocationList = function(req, res, results, stats) {
  var locations = [];
  results.forEach(function(doc) {
    locations.push({
      distance: meterConversion.mToKm(doc.dis),
      name: doc.obj.name,
      address: doc.obj.address,
      rating: doc.obj.rating,
      facilities: doc.obj.facilities,
      _id: doc.obj._id
    });
  });
  return locations;
};

module.exports.locationsReadOne = function (req, res) {
	console.log('Finding location details', req.params);
	if (req.params && req.params.locationid) {
	Loc
		.findById(req.params.locationid)
		.exec(function (err, location) {
			if (!location) {
				sendJsonResponse(res, 404, {
					"message": "Локация не найдена!!!"
				});
				return;
			} else if (err) {
				console.log(err);
				sendJsonResponse(res, 400, err);
				return;
			}
			sendJsonResponse(res, 200, location);
		});	
	}else {
		console.log('No locationid specified');
		sendJsonResponse(res, 404, {
					"message": "Отсутствует параметр locationid в запросе!!!"
				});
	}
};

module.exports.locationsCreate = function (req, res) {
	Loc.create({
		name: req.body.name,
		address: req.body.address,
		facilities: req.body.facilities.split(","),
		coords: [parseFloat(req.body.lng),
				 parseFloat(req.body.lat)],
		openingTimes: [{
			days: req.body.days1,
			opening: req.body.opening1,
			closing: req.body.closing1,
			closed: req.body.closed1
		}, {
			days: req.body.days2,
			opening: req.body.opening2,
			closing: req.body.closing2,
			closed: req.body.closed2 
		}]
		}, function (err, location) {
			if (err) {
				sendJsonResponse(res, 400, err);
			} else {
				sendJsonResponse(res, 201, location);		
			}
		});	
};



module.exports.locationsUpdateOne = function (req, res) {
	if (!req.params.locationid) {
		sendJsonResponse(res, 400, {
			"message" : "Не найден идентификатор локации " + locationid
		});	
		return;
	}
	Loc
		.findById(req.params.locationid)
		.select('-reviews -rating')
		.exec(
			function (err, location) {
				if (!location) {
					sendJsonResponse(res, 404, {
						"message": "Идентификатор " + locationid + " не найден"
					});
					return;
				} else if (err) {
					sendJsonResponse(res, 400, err);
					return;
				}
				location.name = req.body.name;
				location.address = req.body.address;
				location.facilities = req.body.facilities.split(",");
				location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
				location.openingTimes = [{
					days: req.body.days1,
					opening: req.body.opening1,
					closing: req.body.closing1,
					closed: req.body.closed1
				}, {
					days: req.body.days2,
					opening: req.body.opening2,
					closing: req.body.closing2,
					closed: req.body.closed2
				}];
				location.save(function (err, location) {
					if (err) {
						sendJsonResponse(res, 404, err);
					} else {
						sendJsonResponse(res, 200, location);
					}
				});
			}
			);
};

module.exports.locationsDeleteOne = function (req, res) {
	var locationid = req.params.locationid;
	if (locationid) {
		Loc
			.findByIdAndRemove(locationid)
			.exec(function (err, location) {
				if (err) {
					sendJsonResponse(res, 404, err);
					return;
				}
				sendJsonResponse(res, 204, null);
			});
	} else {
		sendJsonResponse(res, 404, {
			"message": "Нет локации"
		});
	}
	
};