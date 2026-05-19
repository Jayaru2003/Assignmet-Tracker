// routes/apiRoutes.js
// RESTful JSON API routes — all protected by JWT (via Authorization header or cookie)

const express  = require('express');
const router   = express.Router();
const apiCtrl  = require('../controllers/apiController');
const { protect } = require('../middleware/auth');

// All API endpoints require authentication
router.use(protect);

// GET    /api/assignments       — list assignments (with filter/search)
router.get('/',      apiCtrl.getAssignments);

// POST   /api/assignments       — create assignment
router.post('/',     apiCtrl.createAssignment);

// PUT    /api/assignments/:id   — update assignment status
router.put('/:id',  apiCtrl.updateAssignment);

// DELETE /api/assignments/:id   — delete assignment
router.delete('/:id', apiCtrl.deleteAssignment);

module.exports = router;
