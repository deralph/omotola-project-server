const Resource = require('../models/Resource');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.listResources = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const filter = ['subject', 'type', 'difficulty'].reduce((acc, key) => (req.query[key] ? { ...acc, [key]: req.query[key] } : acc), {});
  const [resources, total] = await Promise.all([Resource.find(filter).skip((page - 1) * limit).limit(limit).lean(), Resource.countDocuments(filter)]);
  res.json({ resources, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.bookmarkResource = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { bookmarkedResources: req.params.id } });
  res.json({ message: 'Resource bookmarked' });
});

exports.getBookmarked = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('bookmarkedResources');
  res.json({ resources: user?.bookmarkedResources || [] });
});
