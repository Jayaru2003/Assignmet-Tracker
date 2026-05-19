// controllers/apiController.js
// REST API endpoints — returns JSON (used by fetch / external clients)

const Assignment = require('../models/Assignment');

/**
 * GET /api/assignments
 * Returns the current user's assignments as JSON.
 * Supports ?filter=all|pending|completed|overdue and ?search=<term>
 */
exports.getAssignments = async (req, res) => {
  try {
    const { filter = 'all', search = '' } = req.query;
    const userId = req.user._id;
    const now    = new Date();

    let query = { userId };
    if (filter === 'pending')   query.status = 'pending';
    if (filter === 'completed') query.status = 'completed';

    if (search.trim()) {
      query.$or = [
        { title:   { $regex: search.trim(), $options: 'i' } },
        { subject: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    let assignments = await Assignment.find(query).sort({ deadline: 1 });

    if (filter === 'overdue') {
      assignments = assignments.filter(
        (a) => a.status === 'pending' && new Date(a.deadline) < now
      );
    }

    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/assignments
 * Create a new assignment — accepts JSON body.
 */
exports.createAssignment = async (req, res) => {
  try {
    const { title, subject, deadline, status } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!deadline) {
      return res.status(400).json({ success: false, message: 'Deadline is required' });
    }

    const assignment = await Assignment.create({
      title:    title.trim(),
      subject:  subject?.trim() || 'General',
      deadline: new Date(deadline),
      status:   status || 'pending',
      userId:   req.user._id,
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/assignments/:id
 * Update status of an assignment — must belong to current user.
 */
exports.updateAssignment = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/assignments/:id
 * Delete an assignment — must belong to current user.
 */
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user._id,
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.status(200).json({ success: true, message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
