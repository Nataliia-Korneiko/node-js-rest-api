const passport = require('passport');
const dotenv = require('dotenv');
const { Strategy, ExtractJwt } = require('passport-jwt');
const { userService: service } = require('../services');

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY;

const params = {
  secretOrKey: SECRET_KEY,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  passReqToCallback: true,
};

passport.use(
  new Strategy(params, async (payload, done) => {
    console.log('payload.id:', payload.id);
    console.log('done:', done);

    try {
      const user = await service.getUserById(payload.id);

      console.log('payload.id:', payload.id);

      if (!user) {
        return done(new Error('User not found'));
      }

      if (!user.token) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      done(new Error(error.message));
    }
  })
);
