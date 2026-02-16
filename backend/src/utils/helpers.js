const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const generateJWT = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
const hashPassword = (password) => bcrypt.hash(password, 10);
const comparePassword = (plainText, hash) => bcrypt.compare(plainText, hash);

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return;
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
  });
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
};

const calculateStudyStreak = (lastStudyDate) => {
  if (!lastStudyDate) return 1;
  const diff = Math.floor((Date.now() - new Date(lastStudyDate).getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 1) return 1;
  return 0;
};

const calculateDifficulty = (percentage) => {
  if (percentage >= 80) return 'hard';
  if (percentage >= 50) return 'medium';
  return 'easy';
};

module.exports = { generateJWT, hashPassword, comparePassword, sendEmail, calculateStudyStreak, calculateDifficulty };
