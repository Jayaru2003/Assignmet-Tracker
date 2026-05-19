// models/Assignment.js
// Defines the Mongoose schema and model for an Assignment document in MongoDB

const mongoose = require('mongoose');

/**
 * Assignment Schema
 * Represents a student assignment with title, subject, deadline, and status
 */
const assignmentSchema = new mongoose.Schema(
  {
    // Title of the assignment — required
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },

    // Subject the assignment belongs to
    subject: {
      type: String,
      trim: true,
      default: 'General',
      maxlength: [100, 'Subject cannot exceed 100 characters'],
    },

    // Deadline date — required
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },

    // Current status of the assignment
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
  },
  {
    // Automatically adds createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Virtual property: isOverdue
 * Returns true if the deadline has passed and the assignment is still pending
 */
assignmentSchema.virtual('isOverdue').get(function () {
  return this.status === 'pending' && new Date(this.deadline) < new Date();
});

// Ensure virtuals are included when converting to JSON (used in templates)
assignmentSchema.set('toJSON', { virtuals: true });
assignmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
