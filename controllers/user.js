const express = require('express'),
      mongoose =  require("mongoose"),
      passport =  require('passport'),
      User  =   require('../models/user'),
      localStrategy =  require('passport-local'),
      userModule = require('../controllers/user'); 
       

// Handling Signup
exports.newUser = (req, res)=> {
     const newUser = new User({username: req.body.username, 
        name: req.body.name,
        email: req.body.email,
     });
     if(req.body.adminCode == 'adarsh_noob'){
        newUser.isAdmin = true;

     }

     User.findOne({email: req.body.email}).exec((err, sameUser)=>{
        if (err) {
			return res.status(500).json({ message: 'Server error' });
		} // checking if same email exists in DB or not 
		if (sameUser) {
			return res.status(404).json({ message: `Email address already registered please login with different email.` });
        }
        else {
            User.register(newUser, req.body.password, (err, user)=>{
                if(err) { 
                   return res.status(500).json({ message: err.message});
                    }
                else {
                     passport.authenticate("local")(req, res, ()=>{
                     return res.status(200).json({message: 'Welcome to website: ' + req.body.username});
                    });
                 }
            });
        }
    });
    
};


 // Handling login
exports.doLogin = (req, res, next) =>{
    passport.authenticate('local', function(err, user, info) {
      if (err) {   return res.status(500).json({ message: err.message}); }

      if (!user) { return res.status(404).json({ message: 'Incorrect username or password'}); }
      
      req.logIn(user, function(err) {
        if (err) { return res.status(404).json({ message:err}) }
        return  res.status(200).json({ message:'Successfully loggen In!!'}) ;
      });
    })(req, res, next);
};

// Handling logout

exports.doLogout =  (req, res)=>{
    // clear req.user and clear the login session (if any)
    req.logOut();
    return res.status(200).json({ message: 'Logged you out!'});
};
