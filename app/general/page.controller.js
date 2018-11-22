

const fs = require('fs');
const ejs = require('ejs');

const ActivityModel = require('../general/database').Activity;
const typeValues = require('../activities/activity.model').typeValues;
const ActivitiesOnPage = 10;

exports.showActivities = function(req, res) {
    let params = {
        userId: req.session.user.id
    };

    if(req.query.typeFilter != null) {
        params.typeFilter = req.query.typeFilter;
    }

    let page = getPageAsNumber(req.query.page);
    params.offset = (page * ActivitiesOnPage);
    params.limit = ActivitiesOnPage;

    let promises = [];
    if(page != null) {
        promises.push(getActivityTable(params, 'html'));
        promises.push(getPaginator(params, page, 'html'));
        Promise.all(promises)
        .then(result => {
            sendMessage(res, 200, 'OK', { htmlTable: result[0].data, htmlPaginator: result[1].data });
        })
        .catch(err => {
            sendMessage(res, 500, 'err', 'Server error: ' + err);
        });
    } else {
        promises.push(getActivityTable(params, 'object'));
        promises.push(getPaginator(params, page, 'number'));
        Promise.all(promises)
        .then(result => {
            pag_disabled = getDisabledPagButtons(result[1].data, 1);
            res.render('dashboard', {
                page:'Dashboard', menuId:'dashboard',
                activityTypes: typeValues, activitiesData: result[0].data, activityNO: params.offset,
                pag_count: result[1].data, pag_disabled: pag_disabled, pag_active: 1
            });
        })
        .catch(err => {
            sendMessage(res, 500, 'err', 'Server error: ' + err);
        });
    }
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
        date_time: req.body.dateTime,
        place: req.body.place,
        userId: req.session.user.id
    };

    let params = {
        userId: req.session.user.id, //pri insert nepouzivat, pri select ano
        //returning: true
    };

    if(req.query.typeFilter != null) {
        params.typeFilter = req.query.typeFilter;
    }

    let page = getPageAsNumber(req.body.actualPage, res);
    params.offset = (page * ActivitiesOnPage);
    params.limit = ActivitiesOnPage;

    if(page != null) {
        ActivityModel.addActivity(params, columns, result => {
            if(result.status == 'OK') {
                let promises = [];
                promises.push(getActivityTable(params, 'html'));
                promises.push(getPaginator(params, page, 'html'));
                Promise.all(promises)
                .then(result => {
                    sendMessage(res, 200, 'OK', { htmlTable: result[0].data, htmlPaginator: result[1].data });
                })
                .catch(err => {
                    sendMessage(res, 500, 'err', 'Server error: ' + err);
                });
            } else {
                sendMessage(res, 500, 'err', 'Server error- ' + result.data);
            }
        });
    } else {
        sendMessage(res, 500, 'err', 'actualPage field required');
    }
};

exports.deleteActivity = function(req, res) {
    let params = {
        activityId: req.params.activityId,
        userId: req.session.user.id, //pri insert nepouzivat, pri select ano
        //returning: true
    };

    if(req.query.typeFilter != null) {
        params.typeFilter = req.query.typeFilter;
    }

    let page = getPageAsNumber(req.body.actualPage, res);
    params.offset = (page * ActivitiesOnPage);
    params.limit = ActivitiesOnPage;

    if(page != null) {
        ActivityModel.deleteActivity(params, result => {
            if(result.status == 'OK') {
                getPaginator(params, null, 'number').then(result => {
                    if(result.data <= page) {
                        page--;
                        params.offset = (page * ActivitiesOnPage);
                    }
                    let promises = [];
                    promises.push(getActivityTable(params, 'html'));
                    promises.push(getPaginator(params, page, 'html'));
                    Promise.all(promises)
                    .then(result => {
                        sendMessage(res, 200, 'OK', { htmlTable: result[0].data, htmlPaginator: result[1].data });
                    })
                    .catch(err => {
                        sendMessage(res, 500, 'err', 'Server error: ' + err);
                    });
                })
                .catch(err => {
                    sendMessage(res, 500, 'err', 'Server error: ' + err);
                });
            } else {
                sendMessage(res, 500, 'err', 'Server error- ' + result.data);
            }
        });
    } else {
        sendMessage(res, 500, 'err', 'actualPage field required');
    }
};

function getActivityTable(params, resultType) {
    return new Promise(function(resolve, reject) {
        ActivityModel.getAllActivities(params, result => {
            if(result.status == 'OK') {
                if(resultType == 'object') {
                    resolve({ status: 'OK', data: result.data });
                } else if(resultType == 'html') {
                    createHtmlTable(result, params)
                    .then(htmlTable => 
                        resolve({ status: 'OK', data: htmlTable.data }))
                    .catch(function(err) {
                        reject({ status: 'err', data: err });
                    });
                } else {
                    reject({ status: 'err', data: 'wrong resultType' });
                }
            } else {
                reject({ status: 'err', data: result.data });
            }
        });
    });
}

function getPaginator(params, page, resultType) {
    return new Promise(function(resolve, reject) {
        ActivityModel.getActivityCount(params, result => {
            if(result.status == 'OK') {
                let pageCount = getPageCount(result.data);
                if(resultType == 'number') {
                    resolve({ status: 'OK', data: pageCount });
                } else if(resultType == 'html') {
                    createHtmlPaginator(pageCount, page)
                    .then(htmlPaginator =>
                        resolve({ status: 'OK', data: htmlPaginator.data }))
                    .catch(function(err) {
                        reject({ status: 'err', data: err });
                    });
                } else {
                    reject({ status: 'err', data: 'wrong resultType' });
                }
            } else {
                reject({ status: 'err', data: result.data });
            }
        });
    });
}

function getDisabledPagButtons(pageCount, page) {
    if(pageCount == 1) {
        return ['prev', 'next'];
    }

    if(page == 1) {
        return ['prev', null];
    }

    if(page == pageCount) {
        return [null, 'next'];
    }
}

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

function createHtmlTable(resultActivities, params) {
    return new Promise(function(resolve, reject) {
        getPartialHtmlFile('./views/partials/table.ejs')
        .then(function(result) {
            let htmlTable = ejs.render(result,
                { activitiesData: resultActivities.data, activityNO: params.offset },
                { client: true }
            );

            resolve({ status: 'OK', data: htmlTable });
        }).catch(function(err) {
            reject({ status: 'err', data: err });
        });
    });
}

function createHtmlPaginator(pageCount, page) {
    return new Promise(function(resolve, reject) {
        getPartialHtmlFile('./views/partials/paginator.ejs')
        .then(function(result) {
            page++;
            pag_disabled = getDisabledPagButtons(pageCount, page);
            let htmlPaginator = ejs.render(result,
                { pag_count: pageCount, pag_disabled: pag_disabled, pag_active: page },
                { client: true }
            );

            resolve({ status: 'OK', data: htmlPaginator });
        }).catch(function(err) {
            reject({ status: 'err', data: err });
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

function getPageAsNumber(actualPage) {
    let page = null;
    if(actualPage != null) {
        page = parseInt(actualPage);
        if(Number.isInteger(page)) {
            page--;
        } else {
            page = null;
        }
    }
    return page;
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

