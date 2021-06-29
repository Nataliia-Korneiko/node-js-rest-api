const Joi = require('joi');
const { httpCode } = require('../helpers/constants');

const schemaSignup = Joi.object({
  name: Joi.string().alphanum().min(2).max(30).optional(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net', 'ua'] },
    })
    .required(),
  password: Joi.string().min(8).max(20).required(),
  subscription: Joi.any().valid('starter', 'pro', 'business').optional(),
});

const schemaLogin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const schemaUpdateSubscription = Joi.object({
  subscription: Joi.any().valid('starter', 'pro', 'business').required(),
});

const validate = (schema, body, next) => {
  const { error } = schema.validate(body);

  if (error) {
    const [{ message }] = error.details;

    return next({
      status: httpCode.BAD_REQUEST,
      message: `Field: ${message.replace(/"/g, '')}`,
    });
  }
  next();
};

module.exports.validateSignup = (req, _res, next) => {
  return validate(schemaSignup, req.body, next);
};

module.exports.validateLogin = (req, _res, next) => {
  return validate(schemaLogin, req.body, next);
};

module.exports.validateUpdateSubscription = (req, _res, next) => {
  return validate(schemaUpdateSubscription, req.body, next);
};
