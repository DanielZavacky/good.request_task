

const Sequelize = require('sequelize');
const crypto = require('crypto');

module.exports = (sequelize, type) => {
    let User = sequelize.define('users', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
        hooks: {
            beforeCreate: user => {
                const salt = crypto.randomBytes(16).toString('base64');
                const hash = crypto.createHmac('sha512', salt).update(user.password).digest("base64");
                user.password = salt + '$' + hash;
            }
        },
        timestamps: false
    });

    User.prototype.validPassword = function(passInput, passDB) {
        let passwordFields = passDB.split('$');
        let salt = passwordFields[0];
        let hash = crypto.createHmac('sha512', salt).update(passInput).digest("base64");
        if(hash === passwordFields[1]) {
            return true;
        }
        return false;
    }

    return User;
};

