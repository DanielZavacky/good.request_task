// modules =======================================================================
    // | global
const express = require('express');
    const app = express();
    const router = express.Router();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');

    // | local
const GeneralConfig = require('./app/config/general.conf');
const Datab = require('./app/general/database');

const PageRouter = require('./app/general/page.router');
const AuthenticationRouter = require('./app/authentication/authentication.router');
const ActivityRouter = require('./app/activities/activity.router');

// initializing ==================================================================
const hostname = GeneralConfig.hostname;
const port = GeneralConfig.port;

Datab.connectionTest();

// configuration =================================================================
app.use(express.static('public'));
app.use(morgan('dev'));
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'ejs');

app.use(session({
    key: 'user_sid',
    secret: GeneralConfig.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: GeneralConfig.session_expiration
    }
}));

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});

// routes ========================================================================
app.use('', router);
PageRouter.doRoute(app, router);
AuthenticationRouter.doRoute(app, router);
ActivityRouter.doRoute(app, router);

router.route('*').all((req, res) => {
    res.render('missing404', 
    {
        page:'404',
        menuId: '404'
    });
});

// listen ========================================================================
app.listen(port);
console.log(`Server running at http://${hostname}:${port}/`);

