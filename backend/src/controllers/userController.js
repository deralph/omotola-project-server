const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary } = require('../services/fileService');

exports.getProfile = asyncHandler(async (req, res) => res.json({ user: req.user }));
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true }).select('-password');
  res.json({ user });
});
exports.updatePreferences = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, { preferences: req.body }, { new: true }).select('preferences');
  res.json({ preferences: user.preferences });
});
exports.updatePicture = asyncHandler(async (req, res) => {
  const upload = await uploadToCloudinary(req.file.path, 'profile-pictures');
  await User.findByIdAndUpdate(req.user._id, { profilePicture: upload.secure_url });
  res.json({ profilePicture: upload.secure_url });
});
