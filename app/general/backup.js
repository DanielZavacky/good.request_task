

const fs = require('fs');
const ejs = require('ejs');

const ActivityModel = require('../general/database').Activity;
const activityTypes = require('../activities/activity.model').typeValues;
const ActivitiesOnPage = 10;

exports.showActivities = function(req, res) {
    let params = {
        userId: req.session.user.id
    };

    if(req.query.type != null) {
        params.type = req.query.type;
    }

    let page = null;
    if(req.query.page != null) {
        page = parseInt(req.query.page);
        if(Number.isInteger(page)) {
            page--;
        } else {
            page = null;
        }
    }
    let offset = (page * ActivitiesOnPage);
    params.offset = offset;
    params.limit = ActivitiesOnPage;

    ActivityModel.getActivityCount(params, resultCount => {
        if(resultCount.status == 'OK') {
            ActivityModel.getAllActivities(params, resultActivities => {
                if(resultActivities.status == 'OK') {

                    let pageCount = getPageCount(resultCount.data);
                    if(page != null) {
                        getPartialHtmlFile('./views/partials/table.ejs')
                        .then(function(result) {
                            let htmlTable = ejs.render(result,
                                { activitiesData: resultActivities.data, activityNO: offset },
                                { client: true }
                            );
                            getPartialHtmlFile('./views/partials/paginator.ejs')
                            .then(function(result) {
                                let pag_disabled = '';
                                if((page + 1) <= 1) {
                                    pag_disabled = 'prev';
                                } else if((page + 1) >= pageCount) {
                                    pag_disabled = 'next';
                                }

                                let htmlParinator = ejs.render(result,
                                    { pag_count: pageCount, pag_disabled: pag_disabled, pag_active: (page + 1) },
                                    { client: true }
                                );

                                sendMessage(res, 200, 'OK', { htmlTable: htmlTable, htmlParinator: htmlParinator });
                            }).catch(function(err) {
                                sendMessage(res, 500, 'err', 'Server error');
                            });
                        }).catch(function(err) {
                            sendMessage(res, 500, 'err', 'Server error');
                        });
                    } else {
                        res.render('dashboard', {
                            page:'Dashboard',
                            menuId:'dashboard',
                            activityTypes: activityTypes,
                            activitiesData: resultActivities.data,
                            activityNO: offset,
                            pag_count: pageCount,
                            pag_disabled: 'prev',
                            pag_active: 1
                        });
                    }
                } else {
                    sendMessage(res, 500, 'err', 'Server error');
                }
            });
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
        place: req.body.place
    };

    let params = {
        userId: req.session.user.id
        //returning: true
    };

    let page = null;
    if(req.body.actualPage != null) {
        page = parseInt(req.body.actualPage);
        if(Number.isInteger(page)) {
            page--;
        } else {
            page = null;
        }
    }
    let offset = (page * ActivitiesOnPage);
    params.offset = offset;
    params.limit = ActivitiesOnPage;

    ActivityModel.addActivity(params, columns, result => {
        if(result.status == 'OK') {
            ActivityModel.getActivityCount(params, resultCount => {
                if(resultCount.status == 'OK') {
                    ActivityModel.getAllActivities(params, resultActivities => {
                        if(resultActivities.status == 'OK') {
                            
                            let pageCount = getPageCount(resultCount.data);
                            getPartialHtmlFile('./views/partials/table.ejs')
                            .then(function(result) {
                                let htmlTable = ejs.render(result,
                                    { activitiesData: resultActivities.data, activityNO: offset },
                                    { client: true }
                                );
                                getPartialHtmlFile('./views/partials/paginator.ejs')
                                .then(function(result) {
                                    let pag_disabled = '';
                                    if((page + 1) <= 1) {
                                        pag_disabled = 'prev';
                                    } else if((page + 1) >= pageCount) {
                                        pag_disabled = 'next';
                                    }

                                    let htmlParinator = ejs.render(result,
                                        { pag_count: pageCount, pag_disabled: pag_disabled, pag_active: (page + 1) },
                                        { client: true }
                                    );

                                    sendMessage(res, 200, 'OK', { htmlTable: htmlTable, htmlParinator: htmlParinator });
                                }).catch(function(err) {
                                    sendMessage(res, 500, 'err', 'Server error');
                                });
                            }).catch(function(err) {
                                sendMessage(res, 500, 'err', 'Server error');
                            });
        
                        } else {
                            sendMessage(res, 500, 'err', 'Server error');
                        }
                    });
                } else {
                    sendMessage(res, 500, 'err', 'Server error');
                }
            });
        } else {
            sendMessage(res, 500, 'err', 'Server error');
        }
    });
};

function getPartialHtmlFile(path) {
    return new Promise(function(resolve, reject) {
        fs.readFile(path, 'utf8', function(err, data) {
            if(err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

function getPageCount(activityCount) {
    if((activityCount % ActivitiesOnPage) == 0) {
        return ((activityCount - (activityCount % ActivitiesOnPage)) / ActivitiesOnPage);
    } else {
        return (((activityCount - (activityCount % ActivitiesOnPage)) / ActivitiesOnPage) + 1);
    }
}

function createGroupTP(callback) {
    if((activityCount % ActivitiesOnPage) == 0 && activityCount != 0) {
        return true;
    } else {
        return false;
    }
}

exports.sessionCheck = function(req, res, next) {
    if(req.session.user && req.cookies.user_sid) {
        next();
    } else {
        res.redirect('/login');
    }
};

function sendMessage(res, code, status, data) {
    res.status(code).send({
        status: status,
        data: data
    });
}

