const express = require('express');
const router = express.Router();
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync'); // Adjust path to your wrapAsync utility
const userController = require('../controllers/users');

// --- LOGIN ROUTES ---
router.route('/login')
  .get(userController.renderLogin)
  .post(
    passport.authenticate('local', { 
      failureRedirect: '/auth/login', 
      failureFlash: true 
    }),
    userController.login
  );

// --- REGISTER ROUTES ---
router.route('/register')
  .get(userController.renderRegister)
  .post(wrapAsync(userController.register));

// --- LOGOUT ROUTE ---
router.route('/logout')
  .get(userController.logout);

module.exports = router;