// routes/assignmentRoutes.js
// Protected web routes for the dashboard

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/assignmentController');
const { protect } = require('../middleware/auth');

// All routes here require a valid JWT (protect middleware)
router.use(protect);

// GET  /assignments          — dashboard view
router.get('/',     ctrl.getDashboard);

// POST /assignments          — create assignment
router.post('/',    ctrl.createAssignment);

// PUT  /assignments/:id      — update status (via method-override)
router.put('/:id',  ctrl.updateAssignment);

// DELETE /assignments/:id   — delete (via method-override)
router.delete('/:id', ctrl.deleteAssignment);

module.exports = router;
