// controllers/assignmentController.js
// Handles all business logic for CRUD operations, filtering, sorting, and stats

const Assignment = require('../models/Assignment');

/**
 * GET /assignments
 * Fetches and displays all assignments on the dashboard.
 * Supports filtering by status and sorts by deadline ascending.
 */
exports.getDashboard = async (req, res) => {
  try {
    const { filter } = req.query; // 'all' | 'pending' | 'completed'

    // Build query based on active filter
    let query = {};
    if (filter === 'pending') query.status = 'pending';
    else if (filter === 'completed') query.status = 'completed';

    // Fetch assignments sorted by deadline (earliest first)
    const assignments = await Assignment.find(query).sort({ deadline: 1 });

    // ── Dashboard Statistics ──────────────────────────────────────
    const allAssignments = await Assignment.find({});
    const totalCount = allAssignments.length;
    const completedCount = allAssignments.filter(
      (a) => a.status === 'completed'
    ).length;
    const now = new Date();
    const overdueCount = allAssignments.filter(
      (a) => a.status === 'pending' && new Date(a.deadline) < now
    ).length;
    const pendingCount = totalCount - completedCount;

    // Render dashboard view with all data
    res.render('dashboard', {
      assignments,
      activeFilter: filter || 'all',
      stats: { totalCount, completedCount, overdueCount, pendingCount },
      now,         // pass current time to the view for overdue comparison
      error: null,
    });
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).render('dashboard', {
      assignments: [],
      activeFilter: 'all',
      stats: { totalCount: 0, completedCount: 0, overdueCount: 0, pendingCount: 0 },
      now: new Date(),
      error: 'Failed to load assignments. Please try again.',
    });
  }
};

/**
 * POST /assignments
 * Creates a new assignment from the submitted form data.
 */
exports.createAssignment = async (req, res) => {
  try {
    const { title, subject, deadline, status } = req.body;

    // Basic server-side validation
    if (!title || !title.trim()) {
      return res.redirect('/assignments?error=Title+is+required');
    }
    if (!deadline) {
      return res.redirect('/assignments?error=Deadline+is+required');
    }

    // Create and save the new assignment document
    await Assignment.create({
      title: title.trim(),
      subject: subject ? subject.trim() : 'General',
      deadline: new Date(deadline),
      status: status || 'pending',
    });

    res.redirect('/assignments');
  } catch (err) {
    console.error('Error creating assignment:', err);
    res.redirect('/assignments?error=Failed+to+create+assignment');
  }
};

/**
 * PUT /assignments/:id
 * Toggles the status of an assignment between 'pending' and 'completed'.
 */
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status value
    if (!['pending', 'completed'].includes(status)) {
      return res.redirect('/assignments?error=Invalid+status');
    }

    await Assignment.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    res.redirect('/assignments');
  } catch (err) {
    console.error('Error updating assignment:', err);
    res.redirect('/assignments?error=Failed+to+update+assignment');
  }
};

/**
 * DELETE /assignments/:id
 * Permanently deletes an assignment by its MongoDB _id.
 */
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    await Assignment.findByIdAndDelete(id);
    res.redirect('/assignments');
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.redirect('/assignments?error=Failed+to+delete+assignment');
  }
};
