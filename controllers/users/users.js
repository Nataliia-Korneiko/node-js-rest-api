const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { userService: service } = require('../../services');
const { httpCode } = require('../../helpers/constants');

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET_KEY;

const signup = async (req, res, next) => {
  const { name, email, password, subscription } = req.body;

  try {
    const user = await service.getUserByEmail(email);

    if (user) {
      return res.status(httpCode.CONFLICT).json({
        status: 'error',
        code: httpCode.CONFLICT,
        message: 'Email in use',
      });
    }

    if (!email || !password) {
      return res.status(httpCode.BAD_REQUEST).json({
        status: 'error',
        code: httpCode.BAD_REQUEST,
        message: 'Missing required field',
      });
    }

    const newUser = await service.addUser({
      name,
      email,
      password,
      subscription,
    });

    return res.status(httpCode.CREATED).json({
      status: 'success',
      code: httpCode.CREATED,
      data: {
        user: {
          _id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          subscription: newUser.subscription,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await service.getUserByEmail(email);

    if (!user) {
      return res.status(httpCode.UNAUTHORIZED).json({
        status: 'error',
        code: httpCode.UNAUTHORIZED,
        message: 'Invalid credentials',
      });
    }

    const isValidPassport = await user.validPassword(password);

    if (user.validPassword(password) === null || !isValidPassport) {
      return res.status(httpCode.UNAUTHORIZED).json({
        status: 'error',
        code: httpCode.UNAUTHORIZED,
        message: 'Invalid credentials!',
      });
    }

    const id = user._id;
    const payload = { id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
    await service.updateToken(id, token);

    return res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.OK,
      data: {
        token,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const logout = async (req, res, next) => {
  const userId = req.user.id;

  try {
    await service.updateToken(userId, null);

    return res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.NO_CONTENT,
      message: 'Success logout',
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const getCurrentUser = async (req, res, next) => {
  const userId = req.user.id;
  const token = req.user.token;

  try {
    const currentUser = await service.getUserById(userId);

    if (!currentUser || !token) {
      return res.status(httpCode.UNAUTHORIZED).json({
        status: 'error',
        code: httpCode.UNAUTHORIZED,
        message: 'Not Authorized',
      });
    }

    return res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.OK,
      data: {
        user: {
          email: currentUser.email,
          subscription: currentUser.subscription,
        },
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateSubscription = async (req, res, next) => {
  const userId = req.user.id;
  const { subscription } = req.body;

  try {
    const user = await service.updateSubscription(userId, subscription);

    if (!user) {
      return res.status(httpCode.NOT_FOUND).json({
        status: 'error',
        code: httpCode.NOT_FOUND,
        message: 'Not Found',
      });
    }

    if (!subscription) {
      return res.status(httpCode.NOT_FOUND).json({
        status: 'error',
        code: httpCode.NOT_FOUND,
        message: 'Missing field subscription',
      });
    }

    res.json({
      status: 'success',
      code: 200,
      message: 'Status contact updated',
      data: {
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser,
  updateSubscription,
};
