const Context = require('../models/Context');
const asyncHandler = require('../utils/asyncHandler');
const { normalizeContext } = require('../services/contextProcessor');

exports.updateContext = asyncHandler(async (req, res) => {
  const payload = normalizeContext(req.body);
  const context = await Context.findOneAndUpdate({ user: req.user._id }, { ...payload, user: req.user._id, lastActive: new Date(), sessionStart: payload.sessionStart || new Date() }, { new: true, upsert: true });
  res.json({ context });
});
exports.currentContext = asyncHandler(async (req, res) => {
  const context = await Context.findOne({ user: req.user._id }).lean();
  res.json({ context: context || null });
});
