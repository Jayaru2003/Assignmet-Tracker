// routes/assignmentRoutes.js
// Defines RESTful routes for the Assignment resource

const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

/**
 * GET /assignments
 * Dashboard — list all assignments (with optional ?filter=pending|completed)
 */
router.get('/', assignmentController.getDashboard);

/**
 * POST /assignments
 * Create a new assignment from form submission
 */
router.post('/', assignmentController.createAssignment);

/**
 * PUT /assignments/:id
 * Update status of a specific assignment (via method-override from form POST)
 */
router.put('/:id', assignmentController.updateAssignment);

/**
 * DELETE /assignments/:id
 * Delete a specific assignment (via method-override from form POST)
 */
router.delete('/:id', assignmentController.deleteAssignment);

module.exports = router;
