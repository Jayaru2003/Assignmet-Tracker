// controllers/authController.js
// Handles user registration, login, and logout

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper: sign a JWT and set it as an HTTP-only cookie ──────────
const signTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }   // token valid for 7 days
  );

  // HTTP-only cookie prevents client-side JS from reading the token
  res.cookie('token', token, {
    httpOnly: true,
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
    sameSite: 'strict',
  });
};

/**
 * GET /auth/register
 * Render the registration page.
 */
exports.getRegister = (req, res) => {
  res.render('register', { error: null, values: {} });
};

/**
 * POST /auth/register
 * Create a new user account.
 */
exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // ── Validation ────────────────────────────────────────────────
    if (!name || !email || !password || !confirmPassword) {
      return res.render('register', {
        error:  'All fields are required.',
        values: { name, email },
      });
    }
    if (password !== confirmPassword) {
      return res.render('register', {
        error:  'Passwords do not match.',
        values: { name, email },
      });
    }
    if (password.length < 6) {
      return res.render('register', {
        error:  'Password must be at least 6 characters.',
        values: { name, email },
      });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.render('register', {
        error:  'An account with that email already exists.',
        values: { name, email },
      });
    }

    // Create the user (password is hashed via pre-save hook in model)
    const user = await User.create({ name, email, password });

    // Issue JWT and redirect to dashboard
    signTokenAndSetCookie(res, user._id);
    res.redirect('/assignments');
  } catch (err) {
    console.error('Register error:', err);
    res.render('register', {
      error:  'Registration failed. Please try again.',
      values: {},
    });
  }
};

/**
 * GET /auth/login
 * Render the login page.
 */
exports.getLogin = (req, res) => {
  const message = req.query.message || null;
  res.render('login', { error: null, message, values: {} });
};

/**
 * POST /auth/login
 * Authenticate user credentials and issue a JWT.
 */
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validation ────────────────────────────────────────────────
    if (!email || !password) {
      return res.render('login', {
        error:   'Email and password are required.',
        message: null,
        values:  { email },
      });
    }

    // Find user and explicitly select the hashed password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.render('login', {
        error:   'Invalid email or password.',
        message: null,
        values:  { email },
      });
    }

    // Compare provided password against stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', {
        error:   'Invalid email or password.',
        message: null,
        values:  { email },
      });
    }

    // Issue JWT and redirect to dashboard
    signTokenAndSetCookie(res, user._id);
    res.redirect('/assignments');
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', {
      error:   'Login failed. Please try again.',
      message: null,
      values:  {},
    });
  }
};

/**
 * GET /auth/logout
 * Clear the JWT cookie and redirect to login.
 */
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/auth/login?message=You+have+been+logged+out');
};
