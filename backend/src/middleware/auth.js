const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

module.exports = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next(new ApiError(401, 'Unauthorized'));
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new ApiError(401, 'Invalid token user'));
    req.user = user;
    return next();
  } catch (_err) {
    return next(new ApiError(401, 'Invalid token'));
  }
};
