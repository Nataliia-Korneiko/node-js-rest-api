const rateLimit = require('express-rate-limit');
const { httpCode } = require('./constants');
const { accountLimit } = require('../config/rate-limit.json');

const createAccountLimiter = rateLimit({
  windowMs: accountLimit.windowMs,
  max: accountLimit.max,

  handler: (req, res, next) => {
    res.status(httpCode.BAD_REQUEST).json({
      status: 'error',
      code: httpCode.BAD_REQUEST,
      message:
        'С вашего IP-адреса исчерпан лимит создания аккаунтов. Попробуйте позже!',
    });
  },
});

module.exports = {
  createAccountLimiter,
};
