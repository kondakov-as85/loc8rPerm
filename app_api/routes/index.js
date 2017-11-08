var express = require('express')
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
	secret: process.env.JWT_SECRET,
	userProperty: 'payload'
});
var ctrlLocations = require('../controllers/locations');
var ctrlReviews = require('../controllers/reviews');
var ctrlAuth = require('../controllers/authentication');

//местоположения
router.get('/locations', ctrlLocations.locationsListByDistance);
router.post('/locations', ctrlLocations.locationsCreate);
router.get('/locations/:locationid', ctrlLocations.locationsReadOne);
router.put('/locations/:locationid', ctrlLocations.locationsUpdateOne);
router.delete('/locations/:locationid', ctrlLocations.locationsDeleteOne);

//отзывы
router.post('/locations/:locationid/review', auth, ctrlReviews.reviewCreate);
router.get('/locations/:locationid/review/:reviewid', ctrlReviews.reviewReadOne);
router.put('/locations/:locationid/review/:reviewid', auth, ctrlReviews.reviewUpdateOne);
router.delete('/locations/:locationid/review/:reviewid', auth, ctrlReviews.reviewDeleteOne);

//работа с пользователями
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;