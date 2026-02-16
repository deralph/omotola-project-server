const FILE_TYPES = ['pdf', 'docx', 'txt', 'image'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const ACTIVITIES = ['studying', 'quiz', 'chatting', 'browsing'];

module.exports = {
  FILE_TYPES,
  DIFFICULTIES,
  ACTIVITIES,
  PAGINATION: { defaultPage: 1, defaultLimit: 10, maxLimit: 50 },
  RATE_LIMIT: { windowMs: 15 * 60 * 1000, max: 100, aiMax: 20, aiWindowMs: 60 * 60 * 1000 }
};
