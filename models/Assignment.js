// models/Assignment.js
// Defines the Assignment schema — now includes a userId reference for user isolation

const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    // Title of the assignment — required
    title: {
      type:      String,
      required:  [true, 'Title is required'],
      trim:      true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },

    // Subject the assignment belongs to
    subject: {
      type:      String,
      trim:      true,
      default:   'General',
      maxlength: [100, 'Subject cannot exceed 100 characters'],
    },

    // Deadline date — required
    deadline: {
      type:     Date,
      required: [true, 'Deadline is required'],
    },

    // Current status of the assignment
    status: {
      type:    String,
      enum:    ['pending', 'completed'],
      default: 'pending',
    },

    // Reference to the owning User — ensures each user sees only their own assignments
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * Virtual: isOverdue
 * True if deadline has passed and assignment is still pending.
 */
assignmentSchema.virtual('isOverdue').get(function () {
  return this.status === 'pending' && new Date(this.deadline) < new Date();
});

assignmentSchema.set('toJSON',   { virtuals: true });
assignmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
