// middleware/auth.js
// JWT authentication middleware — protects routes that require login

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect
 * Reads the JWT from the 'token' cookie, verifies it, and attaches
 * the authenticated user object to req.user.
 * If the token is missing or invalid, redirects to /auth/login.
 */
const protect = async (req, res, next) => {
  try {
    // Read token from signed cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.redirect('/auth/login');
    }

    // Verify signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the authenticated user (excluding password) to the request
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      // Token valid but user deleted — clear cookie and redirect
      res.clearCookie('token');
      return res.redirect('/auth/login');
    }

    next();
  } catch (err) {
    // Token expired or tampered with
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
};

/**
 * redirectIfLoggedIn
 * Used on login/register pages — sends already-authenticated users
 * straight to the dashboard.
 */
const redirectIfLoggedIn = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return next();

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.redirect('/assignments');
  } catch {
    next();
  }
};

module.exports = { protect, redirectIfLoggedIn };
