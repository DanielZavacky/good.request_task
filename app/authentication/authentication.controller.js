

const UserModel = require('../general/database').User; 

exports.sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }    
};

exports.login = function(req, res) {
    if(!req.body.email || !req.body.password) {
        sendSimpleMessage(res, 400, 'All fields required');
        return;
    }

    UserModel.findOne({
        where: {
            email: req.body.email 
        } 
    })
    .then(user => {
        if(!user) {
            res.redirect('/login');
        } else if (!user.validPassword(req.body.password, user.dataValues.password)) {
            res.redirect('/login');
        } else {
            req.session.user = { user: user.dataValues.email, id: user.dataValues.id };
            res.redirect('/dashboard');
        }
    })
    .catch(err => {
        sendSimpleMessage(res, 500, 'Server error');
    });
};

exports.registration = function(req, res) {
    if(!req.body.email || !req.body.password) {
        sendSimpleMessage(res, 400, 'All fields required');
        return;
    }
    
    UserModel.create({
        email: req.body.email,
        password: req.body.password
    })
    .then(user => {
        req.session.user = { user: user.dataValues.email, id: user.dataValues.id };
        res.redirect('/dashboard');
    })
    .catch(error => {
        res.redirect('/registration');
    });
};

exports.logout = function(req, res) {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
};

function sendSimpleMessage(res, code, message) {
    res.status(code).send({
        code: code,
        message: message
    });
}

