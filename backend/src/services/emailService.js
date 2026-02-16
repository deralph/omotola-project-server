const { sendEmail } = require('../utils/helpers');

module.exports = {
  sendReminderEmail: (to, title, description) => sendEmail(to, `Study Reminder: ${title}`, `<p>${description || 'Time to study.'}</p>`)
};
