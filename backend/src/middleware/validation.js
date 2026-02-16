const ApiError = require('../utils/ApiError');

module.exports = (schema, property = 'body') => (req, _res, next) => {
  const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
  if (error) return next(new ApiError(400, error.details.map((d) => d.message).join(', ')));
  req[property] = value;
  return next();
};
