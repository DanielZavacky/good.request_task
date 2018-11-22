

const typeValues = ['running', 'walking', 'crossfit', 'workout', 'yoga'];

function createModel(sequelize, type) {
    let Activity = sequelize.define('activities', {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        type: {
            type: type.STRING,
            //type: type.ENUM
            //values: typeValues,
            allowNull: false
        },
        description: {
            type: type.TEXT,
            allowNull: true
        },
        duration: {
            type: type.TIME,
            allowNull: false
        },
        date_time: {
            type: type.DATE,
            allowNull: false,
            validate: {
                isDate: true
            }
        },
        place: {
            type: type.STRING,
            allowNull: true
        }
    }, {
        timestamps: false
    });

    Activity.getActivityCount = function(params, callback) {
        let options = getOptionsOject(params);
        delete options.limit;
        delete options.offset;
        delete options.where.activityId;
        delete options.where.id;
        options.col = 'id';

        this.count(options).then(function(count) {
            callback( { status: 'OK', data: count });
        }).catch(err => {
            callback( { status: 'err', data: err });
        });
    }

    Activity.getAllActivities = function(params, callback) {
        let options = getOptionsOject(params);
        delete options.where.id;
        
        this.findAll(options).then(activities => {
            callback( { status: 'OK', data: activities });
        })
        .catch(err => {
            callback( { status: 'err', data: err });
        });
    };

    Activity.getActivityById = function(params, callback) {
        let options = getOptionsOject(params);

        this.findOne(options)
        .then(activity => {
            callback( { status: 'OK', data: activity });
        })
        .catch(err => {
            callback( { status: 'err', data: err });
        });
    }

    Activity.addActivity = function(params, columns, callback) {
        //let options = getOptionsOject(params);

        this.create(columns)
        .then(activity => {
            callback( { status: 'OK', data: activity });
        })
        .catch(err => {
            callback( { status: 'err', data: err });
        });
    }

    Activity.updateActivity = function(params, columns, callback) {
        let options = getOptionsOject(params);

        this.update(columns, options)
        .then(activity => {
            callback( { status: 'OK', data: activity });
        })
        .catch(err => {
            callback( { status: 'err', data: err });
        });
    }

    Activity.deleteActivity = function(params, callback) {
        let options = getOptionsOject(params);
        delete options.limit;
        delete options.offset;

        this.destroy(options)
        .then(activity => {
            callback( { status: 'OK', data: activity });
        })
        .catch(err => {
            callback( { status: 'err', data: err });
        });
    }

    return Activity;
};

function getOptionsOject(params) {
    let options = { where: {} };

    //where clauses
    if(params.userId != null) {
        options.where.userId = params.userId;
    }

    if(params.activityId != null) {
        options.where.id = params.activityId;
    }

    if(params.typeFilter != null && params.typeFilter != 'All types') {
        options.where.type = params.typeFilter;
    }

    //options
    if(params.offset != null) {
        options.offset = params.offset;
    }

    if(params.limit != null) {
        options.limit = params.limit;
    }

    if(params.returning != null) {
        options.returning = params.returning;
    }

    return options;
}

module.exports = {
    model: createModel,
    typeValues
};

