// routes/authRoutes.js
// Authentication routes: register, login, logout

const express    = require('express');
const router     = express.Router();
const authCtrl   = require('../controllers/authController');
const { redirectIfLoggedIn } = require('../middleware/auth');

// GET  /auth/register — show registration form (redirect if already logged in)
router.get('/register', redirectIfLoggedIn, authCtrl.getRegister);

// POST /auth/register — process registration form
router.post('/register', redirectIfLoggedIn, authCtrl.postRegister);

// GET  /auth/login — show login form (redirect if already logged in)
router.get('/login', redirectIfLoggedIn, authCtrl.getLogin);

// POST /auth/login — process login form
router.post('/login', redirectIfLoggedIn, authCtrl.postLogin);

// GET  /auth/logout — clear cookie and redirect to login
router.get('/logout', authCtrl.logout);

module.exports = router;
