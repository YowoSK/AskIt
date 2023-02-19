const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { response } = require('express');
const {
  requireAuth,
  checkUser,
  isAdmin,
} = require("../middleware/authMiddleware");
let alert = require('alert'); 

//hangle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '', confirmPassword: '' };

// incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'that email is not registered';
}    

    // incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'that password is incorrect';
}  
    //duplicate error code
    if (err.code === 11000) {
        errors.email = 'that email is already registered.';
        return errors;        
    }
    // // confirm password fails
    // if (err.message === 'password not confirmed') {
    //     errors.confirmPassword = 'that password is incorrect';
    // }  
    
    

    //validation errors, moze tiez marek pouzit
    if (err.message.includes('user validation failed')) {
        console.log(Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        }));
    }
    return errors;
}
const maxAge = 2 * 60 * 60; //2hours in seconds!
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET,{
        expiresIn: maxAge
    })
}

module.exports.signup_get = checkUser, requireAuth, isAdmin,(req, res) => {
    res.render('signup');
}
module.exports.login_get = (req, res) => {
    res.render('login');
}
module.exports.signup_post = async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    if (password == confirmPassword) {
        try {
            const user = await User.create({
                email, password
            });
            // const token = createToken(user._id);
            // res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }); //maxage is in seconds so must be * 1000 to have days
            res.status(201).json({ user: user._id });
            alert('user created');
        } catch (err) {
            const errors = handleErrors(err);
            res.status(400).json({ errors });
        }
    } else {
        console.log('passwords do not match')
        alert('Passwords do NOT match. Try again.')
 
    }
}
module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }) //maxage is in seconds so must be * 1000 to have days
        res.status(200).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}
module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/login');
}
