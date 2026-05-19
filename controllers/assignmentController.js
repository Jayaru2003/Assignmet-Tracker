// controllers/assignmentController.js
// Handles CRUD for assignments — scoped to the authenticated user

const Assignment = require('../models/Assignment');

// ── Helper: build overdue/pending/completed stats ─────────────────
const buildStats = async (userId) => {
  const all = await Assignment.find({ userId });
  const now = new Date();
  return {
    totalCount:     all.length,
    completedCount: all.filter((a) => a.status === 'completed').length,
    pendingCount:   all.filter((a) => a.status === 'pending').length,
    overdueCount:   all.filter(
      (a) => a.status === 'pending' && new Date(a.deadline) < now
    ).length,
  };
};

/**
 * GET /assignments
 * Dashboard — list the current user's assignments.
 * Supports:
 *   ?filter=all|pending|completed|overdue
 *   ?search=<term>   (matches title or subject, case-insensitive)
 */
exports.getDashboard = async (req, res) => {
  try {
    const { filter = 'all', search = '' } = req.query;
    const userId = req.user._id;
    const now    = new Date();

    // ── Build Mongoose query ──────────────────────────────────────
    let query = { userId };

    if (filter === 'pending')   query.status = 'pending';
    if (filter === 'completed') query.status = 'completed';

    // Search: title or subject (case-insensitive regex)
    if (search.trim()) {
      query.$or = [
        { title:   { $regex: search.trim(), $options: 'i' } },
        { subject: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Fetch, sorted by earliest deadline first
    let assignments = await Assignment.find(query).sort({ deadline: 1 });

    // Overdue filter is a post-query operation (virtual field)
    if (filter === 'overdue') {
      assignments = assignments.filter(
        (a) => a.status === 'pending' && new Date(a.deadline) < now
      );
    }

    const stats = await buildStats(userId);

    res.render('dashboard', {
      assignments,
      activeFilter: filter,
      search,
      stats,
      user: req.user,
      now,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).render('dashboard', {
      assignments: [],
      activeFilter: 'all',
      search: '',
      stats: { totalCount: 0, completedCount: 0, pendingCount: 0, overdueCount: 0 },
      user: req.user,
      now: new Date(),
      error: 'Failed to load assignments.',
    });
  }
};

/**
 * POST /assignments
 * Create a new assignment for the logged-in user.
 */
exports.createAssignment = async (req, res) => {
  try {
    const { title, subject, deadline, status } = req.body;

    if (!title?.trim())  return res.redirect('/assignments?error=Title+is+required');
    if (!deadline)       return res.redirect('/assignments?error=Deadline+is+required');

    await Assignment.create({
      title:   title.trim(),
      subject: subject?.trim() || 'General',
      deadline: new Date(deadline),
      status:  status || 'pending',
      userId:  req.user._id,
    });

    res.redirect('/assignments');
  } catch (err) {
    console.error('Create error:', err);
    res.redirect('/assignments?error=Failed+to+create+assignment');
  }
};

/**
 * PUT /assignments/:id
 * Toggle assignment status — only if it belongs to the current user.
 */
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed'].includes(status)) {
      return res.redirect('/assignments?error=Invalid+status');
    }

    // Scoped to userId to prevent cross-user tampering
    await Assignment.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { status },
      { new: true, runValidators: true }
    );

    res.redirect('/assignments');
  } catch (err) {
    console.error('Update error:', err);
    res.redirect('/assignments?error=Failed+to+update');
  }
};

/**
 * DELETE /assignments/:id
 * Delete an assignment — only if it belongs to the current user.
 */
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    await Assignment.findOneAndDelete({ _id: id, userId: req.user._id });
    res.redirect('/assignments');
  } catch (err) {
    console.error('Delete error:', err);
    res.redirect('/assignments?error=Failed+to+delete');
  }
};
