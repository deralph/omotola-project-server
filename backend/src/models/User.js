const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true, select: false },
  university: String,
  department: String,
  yearOfStudy: Number,
  profilePicture: String,
  preferences: {
    studyTimes: [String],
    difficultyPreference: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    notificationsEnabled: { type: Boolean, default: true },
    lowBandwidthMode: { type: Boolean, default: false },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' }
  },
  studyStreak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastStudyDate: Date
  },
  isVerified: { type: Boolean, default: false },
  bookmarkedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
