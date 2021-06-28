const passport = require('passport');
require('../config/passport');
const { httpCode } = require('./constants');

const guard = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user) => {
    const [, token] = req.get('Authorization').split(' ');

    if (error || !user || token !== user.token) {
      return res.status(httpCode.UNAUTHORIZED).json({
        status: 'error',
        code: httpCode.UNAUTHORIZED,
        message: 'Not Authorized',
      });
    }

    req.user = user;
    return next();
  })(req, res, next);
};

module.exports = guard;
