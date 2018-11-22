

const ActivityController = require('./activity.controller');

//API ACTIVITY ROUTES --------------------------------------------------------
exports.doRoute = function(app, router) {

    router.route('/api/activities')
        .get([
            ActivityController.getAllActivities
        ])

        .post([
            ActivityController.addActivity
        ]);

    router.route('/api/activities/:activityId([0-9]+)')
        .get([
            ActivityController.getActivityById
        ])

        .patch([
            ActivityController.updateActivity
        ])

        .delete([
            ActivityController.deleteActivity
        ])
};

