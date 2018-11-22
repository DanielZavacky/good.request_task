

const Sequelize = require('sequelize');
const DatabaseConf = require('../config/database.conf');

const UserModel = require('../authentication/user.model');
const ActivityModel = require('../activities/activity.model').model;

const sequelize = new Sequelize(DatabaseConf.connection.database,
    DatabaseConf.connection.user,
    DatabaseConf.connection.password,
    {
        host: DatabaseConf.connection.host,
        dialect: 'postgres',
        operatorsAliases: false,
        logging: false,
        pool: {
            max: DatabaseConf.connection.connectionLimit,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
});

const User = UserModel(sequelize, Sequelize);
const Activity = ActivityModel(sequelize, Sequelize);

User.hasMany(Activity, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

sequelize.sync( {force: false} )
    .then(() => {
        console.log('Tables created!');
    })
    .catch(err => {
        console.error('Error while creating tables');
        process.exit(1);
    });

function connectionTest() {
    sequelize.authenticate()
        .then(() => {
        })
        .catch(err => {
            console.error('Database connection error');
            process.exit(1);
    });
}

module.exports = {
    User,
    Activity,
    connectionTest
};

