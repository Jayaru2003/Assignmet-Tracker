// models/User.js
// Defines the User schema — stores credentials for authentication

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Display name shown in the dashboard
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },

    // Unique email used as login identifier
    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,
      trim:     true,
      lowercase: true,
      match:    [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    // Hashed password — never stored in plain text
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
  },
  { timestamps: true }
);

/**
 * Pre-save hook: hash the password before saving to the database.
 * Only runs when the password field has been modified.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance method: compare a plain-text candidate password
 * against the stored hash.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
