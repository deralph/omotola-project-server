const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  university: Joi.string().allow('', null),
  department: Joi.string().allow('', null),
  yearOfStudy: Joi.number().integer().min(1).max(10)
});

const loginSchema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });
const objectIdSchema = Joi.string().hex().length(24).required();
const paginationSchema = Joi.object({ page: Joi.number().integer().min(1), limit: Joi.number().integer().min(1).max(50) });

module.exports = { registerSchema, loginSchema, objectIdSchema, paginationSchema };
