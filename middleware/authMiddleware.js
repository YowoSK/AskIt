const jwt = require('jsonwebtoken');
const User = require('../models/User');

//protecting routes
const isAdmin = (req, res, next) => {
    const role = res.locals.user.role;
    if (role != 'admin') {
        console.log('get out of here!')
        //depreciated
        // res.send(401, 'You are not authorised to be here')
        res.status(401)
        res.sendFile('/public/img/401.jpg', { root: '.' })
        // res.redirect('/login')
    } else {
        next();
        // res.render('test')
        console.log('you are admin, enter pls')
    }
}


const requireAuth = (req, res, next) => {
    
    const token = req.cookies.jwt;

    //check json web token exists and is verified
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/login');
            } else {
                console.log(decodedToken);
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
}

//check current user
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        })
    } else {
        res.locals.user = null;
        next();
    }
}

module.exports = { requireAuth, checkUser, isAdmin };