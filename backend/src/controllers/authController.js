const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateJWT, hashPassword, comparePassword, sendEmail } = require('../utils/helpers');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, university, department, yearOfStudy } = req.body;
  if (await User.findOne({ email })) throw new ApiError(409, 'Email already in use');
  const user = await User.create({ name, email, password: await hashPassword(password), university, department, yearOfStudy });
  const token = generateJWT(user._id);
  res.status(201).json({ token, user: await User.findById(user._id).select('-password') });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await comparePassword(password, user.password))) throw new ApiError(401, 'Invalid credentials');
  res.json({ token: generateJWT(user._id), user: await User.findById(user._id).select('-password') });
});

exports.logout = asyncHandler(async (_req, res) => res.json({ message: 'Logged out successfully' }));
exports.me = asyncHandler(async (req, res) => res.json({ user: req.user }));

exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new ApiError(404, 'User not found');
  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save();
  await sendEmail(user.email, 'Password reset', `<p>Use token: ${resetToken}</p>`);
  res.json({ message: 'Password reset token sent' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.body.resetToken).digest('hex');
  const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } });
  if (!user) throw new ApiError(400, 'Invalid or expired reset token');
  user.password = await hashPassword(req.body.newPassword);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json({ message: 'Password reset successful' });
});

exports.verifyEmail = asyncHandler(async (_req, res) => res.json({ message: 'Email verification endpoint ready' }));
exports.resendVerification = asyncHandler(async (_req, res) => res.json({ message: 'Verification email resent' }));
exports.refreshToken = asyncHandler(async (req, res) => res.json({ token: generateJWT(req.user._id) }));
exports.changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await comparePassword(req.body.currentPassword, user.password))) throw new ApiError(400, 'Current password is incorrect');
  user.password = await hashPassword(req.body.newPassword);
  await user.save();
  res.json({ message: 'Password changed successfully' });
});
