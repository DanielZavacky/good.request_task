

const ActivityModel = require('../general/database').Activity;
const typeValues = require('./activity.model').typeValues;

exports.getAllActivities = function(req, res) {
    let params = {
        
    };

    if(req.query.type != null) {
        params.type = req.query.type;
    }

    let page = 0;
    if(req.query.page) {
        req.query.page = parseInt(req.query.page);
        if(Number.isInteger(req.query.page)) {
            page = req.query.page;
            page--;
        }
    }
    let offset = (page * 10);
    params.offset = offset;
    params.limit = 10;

    ActivityModel.getAllActivities(params, resultActivities => {
        if(resultActivities.status == 'OK') {
            sendMessage(res, 200, 'OK', resultActivities.data);
        } else {
            sendMessage(res, 500, 'err', 'Server error');
        }
    });
};

exports.addActivity = function(req, res) {
    if(!req.body.type || !req.body.duration || !req.body.dateTime) {
        sendMessage(res, 400, 'err', 'All necessary fields required');
        return;
    }

    if(!typeValues.includes(req.body.type)) {
        sendMessage(res, 400, 'err', 'Wrong value of type');
        return;
    }

    let columns = {
        type: req.body.type,
        description: req.body.description,
        duration: req.body.duration,
        dateTime: req.body.dateTime,
        place: req.body.place,
        userId: req.session.user.id
    };

    ActivityModel.addActivity(params, columns, result => {
        if(result.status == 'OK') {
            sendMessage(res, 200, 'OK', result.data.dataValues);
        } else {
            sendMessage(res, 500, 'err', 'Server error');
        }
    });
};

exports.getActivityById = function(req, res) {
    let params = {
        activityId: req.params.activityId
    };

    ActivityModel.getActivityById(params, result => {
        if(result.status == 'OK') {
            sendMessage(res, 200, 'OK', result.data);
        } else {
            sendMessage(res, 500, 'err', 'Server error');
        }
    });
};

exports.updateActivity = function(req, res) {
    if(!req.body.type || !req.body.description || !req.body.duration || !req.body.dateTime || !req.body.place) {
        sendMessage(res, 400, 'err', 'All fields required');
        return;
    }

    if(!typeValues.includes(req.body.type)) {
        sendMessage(res, 400, 'err', 'Wrong type');
        return;
    }

    let columns = {
        type: req.body.type,
        description: req.body.description,
        duration: req.body.duration,
        dateTime: req.body.dateTime,
        place: req.body.place,
        userId: req.session.user.id
    };

    let params = {
        activityId: req.params.activityId,
        returning: true
    };

    ActivityModel.updateActivity(params, columns, result => {
        if(result.status == 'OK') {
            sendMessage(res, 200, 'OK', result.data[1]);
        } else {
            sendMessage(res, 500, 'err', 'Server error');
        }
    });
};

exports.deleteActivity = function(req, res) {
    let params = {
        activityId: req.params.activityId
    };

    ActivityModel.deleteActivity(params, result => {
        if(result.status == 'OK') {
            sendMessage(res, 200, 'OK', result.data.dataValues);
        } else {
            sendMessage(res, 500, 'err', 'Server error');
        }
    });
};

function sendMessage(res, code, status, data) {
    res.status(code).send({
        status: status,
        data: data
    });
}
