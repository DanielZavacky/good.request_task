

const PageController = require('./page.controller');

//PAGE NAVIGATION ROUTES --------------------------------------------------------
exports.doRoute = function(app, router) {

    router.get('/', (req, res) => {
        res.redirect('/login');
    });

    router.route('/dashboard')
        .get([
            PageController.sessionCheck,
            PageController.showActivities
        ])

        .post([
            PageController.sessionCheck,
            PageController.addActivity
        ]);

    router.route('/dashboard/:activityId([0-9]+)')
        .delete([
            PageController.sessionCheck,
            PageController.deleteActivity
        ])
}

