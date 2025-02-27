const Joi = require('joi');
const { httpCode } = require('../helpers/constants');

const schemaCreateContact = Joi.object({
  name: Joi.string().alphanum().min(2).max(30).required(),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net', 'ua'] },
    })
    .required(),

  phone: Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/)
    .required(),

  favorite: Joi.boolean().optional(),
});

const schemaUpdateContact = Joi.object({
  name: Joi.string().alphanum().min(2).max(30).optional(),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net', 'ua'] },
    })
    .optional(),

  phone: Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/)
    .optional(),

  favorite: Joi.boolean().optional(),
}).min(1);

const schemaUpdateStatusContact = Joi.object({
  favorite: Joi.boolean().required(),
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

module.exports.validateCreateContact = (req, _res, next) => {
  return validate(schemaCreateContact, req.body, next);
};

module.exports.validateUpdateContact = (req, _res, next) => {
  return validate(schemaUpdateContact, req.body, next);
};

module.exports.validateUpdateStatusContact = (req, _res, next) => {
  return validate(schemaUpdateStatusContact, req.body, next);
};
