

const AuthenticationController = require('./authentication.controller');
const Navigator = require('../general/page.router');
const path = require('path');

//API AUTHENTICATION ROUTES --------------------------------------------------------
exports.doRoute = function(app, router) {
    router.route('/login')
        .get([
            AuthenticationController.sessionChecker,
            function(req, res) {
                res.render('login', { page:'Sigin In', menuId:'signIn' });
            }
        ])
        .post(
            AuthenticationController.login
        );

    router.route('/registration')
        .get([
            AuthenticationController.sessionChecker,
            function(req, res) {
                res.render('registration', { page:'SignUp', menuId:'signUp' });
            }
        ])
        .post(AuthenticationController.registration);

    router.route('/logout')
        .get([
            AuthenticationController.logout
        ]);
};