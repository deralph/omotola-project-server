const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { sendReminderEmail } = require('../services/emailService');
const { logger } = require('../middleware/logger');

function startReminderScheduler() {
  cron.schedule('0 * * * *', async () => {
    try {
      const due = await Reminder.find({ isActive: true, scheduledTime: { $lte: new Date() } });
      for (const reminder of due) {
        const user = await User.findById(reminder.user);
        if (user?.email) await sendReminderEmail(user.email, reminder.title, reminder.description);
        reminder.lastTriggered = new Date();
        if (reminder.recurrence === 'once') reminder.isActive = false;
        await reminder.save();
      }
    } catch (error) {
      logger.error('Reminder scheduler error', { error: error.message });
    }
  });
}

module.exports = { startReminderScheduler };
