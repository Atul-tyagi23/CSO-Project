const express = require('express'),
      router = express.Router(),
      mongoose =  require("mongoose"),
      passport =  require('passport'),
      User  =   require('../models/user'),
      localStrategy =  require('passport-local'),
      userModule = require('../controllers/user'), 
      { model } = require('../models/user');


      
// All users 
router.get('/', userModule.getAllUsers);

// Sign up route
router.post('/register', userModule.newUser);

// Login route
router.post('/login', userModule.doLogin ); 

// Logout route
router.get("/logout",userModule.doLogout);





module.exports = router ; 