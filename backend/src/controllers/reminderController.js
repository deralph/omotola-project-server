const Reminder = require('../models/Reminder');
const asyncHandler = require('../utils/asyncHandler');

exports.listReminders = asyncHandler(async (req, res) => {
  const reminders = await Reminder.find({ user: req.user._id }).sort({ scheduledTime: 1 }).lean();
  res.json({ reminders });
});
exports.createReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.create({ ...req.body, user: req.user._id });
  res.status(201).json({ reminder });
});
exports.updateReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
  res.json({ reminder });
});
exports.deleteReminder = asyncHandler(async (req, res) => {
  await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Reminder deleted' });
});
