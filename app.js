// app.js
// Entry point — sets up Express, connects to MongoDB, registers middleware & routes

const express      = require('express');
const mongoose     = require('mongoose');
const methodOverride = require('method-override'); // allows PUT/DELETE from HTML forms
const path         = require('path');
require('dotenv').config();                        // load environment variables from .env

const assignmentRoutes = require('./routes/assignmentRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/assignment_tracker';

// ── View Engine ──────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Middleware ───────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));  // parse form data
app.use(express.json());                           // parse JSON bodies
app.use(methodOverride('_method'));                // override POST with PUT/DELETE via ?_method=
app.use(express.static(path.join(__dirname, 'public'))); // serve static assets

// ── Routes ───────────────────────────────────────────────────────
// Redirect root to /assignments (the dashboard)
app.get('/', (req, res) => res.redirect('/assignments'));

// Mount assignment routes
app.use('/assignments', assignmentRoutes);

// ── 404 handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send(`
    <h1 style="font-family:sans-serif;text-align:center;margin-top:4rem;color:#6c63ff">
      404 — Page Not Found
    </h1>
    <p style="text-align:center"><a href="/assignments">← Back to Dashboard</a></p>
  `);
});

// ── Global error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).send('Something went wrong. Please try again.');
});

// ── Connect to MongoDB, then start server ────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀  Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });
