// app.js
// Express application entry point — wires up middleware, routes, and MongoDB

const express        = require('express');
const mongoose       = require('mongoose');
const methodOverride = require('method-override');
const cookieParser   = require('cookie-parser');
const path           = require('path');
require('dotenv').config();

const authRoutes       = require('./routes/authRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const apiRoutes        = require('./routes/apiRoutes');

const app      = express();
const PORT     = process.env.PORT     || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/assignment_tracker';

// ── View Engine ──────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Middleware ───────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true })); // parse HTML form bodies
app.use(express.json());                          // parse JSON bodies (API)
app.use(cookieParser());                          // parse JWT from cookies
app.use(methodOverride('_method'));               // allow PUT/DELETE from forms
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ───────────────────────────────────────────────────────
// Root → redirect to dashboard (protect middleware will bounce to login if not authed)
app.get('/', (req, res) => res.redirect('/assignments'));

// Auth routes  (register / login / logout)
app.use('/auth', authRoutes);

// Protected web dashboard routes
app.use('/assignments', assignmentRoutes);

// REST JSON API routes
app.use('/api/assignments', apiRoutes);

// ── 404 handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send(`
    <h2 style="font-family:sans-serif;text-align:center;margin-top:4rem;color:#6c63ff">404 — Page Not Found</h2>
    <p style="text-align:center;font-family:sans-serif"><a href="/">← Back to Dashboard</a></p>
  `);
});

// ── Global error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// ── Connect to MongoDB then start the server ─────────────────────
if (require.main === module) {
  // Only connect/listen when run directly (not during testing)
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('✅  Connected to MongoDB');
      app.listen(PORT, () => console.log(`🚀  Server running at http://localhost:${PORT}`));
    })
    .catch((err) => {
      console.error('❌  MongoDB connection failed:', err.message);
      process.exit(1);
    });
}

// Export for testing
module.exports = app;
