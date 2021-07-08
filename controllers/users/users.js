const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const fs = require('fs/promises');
const cloudinary = require('cloudinary').v2;
const shortid = require('shortid');
const { promisify } = require('util');
const { userService: service } = require('../../services');
const { httpCode } = require('../../helpers/constants');
const sendEmail = require('../../helpers/email');

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET_KEY;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = promisify(cloudinary.uploader.upload);

const signup = async (req, res, next) => {
  const { name, email, password, subscription, avatarURL } = req.body;

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

    const verificationToken = shortid();

    const newUser = await service.addUser({
      name,
      email,
      password,
      subscription,
      avatarURL,
      verificationToken,
    });

    await sendEmail(verificationToken, email, name);

    res.status(httpCode.CREATED).json({
      status: 'success',
      code: httpCode.CREATED,
      data: {
        user: {
          _id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          subscription: newUser.subscription,
          avatarURL: newUser.avatarURL,
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
        message: 'Invalid Credentials',
      });
    }

    const isValidPassport = await user.validPassword(password);

    if (user.validPassword(password) === null || !isValidPassport) {
      return res.status(httpCode.UNAUTHORIZED).json({
        status: 'error',
        code: httpCode.UNAUTHORIZED,
        message: 'Invalid Credentials!',
      });
    }

    if (!user.verify) {
      return res.status(httpCode.BAD_REQUEST).json({
        status: 'error',
        code: httpCode.BAD_REQUEST,
        message: 'Missing email verification',
      });
    }

    const id = user._id;
    const payload = { id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
    await service.updateToken(id, token);

    res.status(httpCode.OK).json({
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

    res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.NO_CONTENT,
      message: 'Success Logout',
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const getCurrentUser = async (req, res, next) => {
  const currentUser = req.user;

  try {
    res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.OK,
      data: {
        user: {
          name: currentUser.name,
          email: currentUser.email,
          subscription: currentUser.subscription,
          avatarURL: currentUser.avatarURL,
          verify: currentUser.verify,
          createdAt: currentUser.createdAt,
          updatedAt: currentUser.updatedAt,
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

    res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.OK,
      message: 'Subscription Updated',
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

const updateAvatar = async (req, res, next) => {
  const userId = req.user.id;
  const { file } = req;

  try {
    if (!file) {
      return res.status(httpCode.BAD_REQUEST).json({
        status: 'error',
        code: httpCode.BAD_REQUEST,
        message: 'Missing required field',
      });
    }

    const { idCloudAvatar, avatarURL } = await uploadAvatar(req);

    await service.updateAvatar(userId, avatarURL, idCloudAvatar);

    res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.OK,
      data: {
        avatarURL,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const uploadAvatar = async (req, res, next) => {
  const pathFile = req.file.path;

  try {
    const { public_id: idCloudAvatar, secure_url: avatarURL } =
      await uploadCloudinary(pathFile, {
        public_id: req.user.idCloudAvatar?.replace('avatars', ''),
        folder: 'avatars',
        transformation: {
          width: 250,
          height: 250,
          crop: 'fill',
        },
      });

    await fs.unlink(pathFile);

    return {
      idCloudAvatar,
      avatarURL,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const verifyEmail = async (req, res, next) => {
  const { verificationToken } = req.params;

  try {
    const user = await service.getUserByVerificationToken(verificationToken);

    if (!user) {
      return res.status(httpCode.BAD_REQUEST).json({
        status: 'error',
        code: httpCode.BAD_REQUEST,
        message: 'Invalid verification token. Contact to administration',
      });
    }

    await service.updateVerificationToken(user.id, true, null);

    res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.OK,
      message: 'Verification successful',
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const resendEmail = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(httpCode.BAD_REQUEST).json({
        status: 'error',
        code: httpCode.BAD_REQUEST,
        message: 'Missing required field email',
      });
    }

    const user = await service.getUserByEmail(email);

    if (!user) {
      return res.status(httpCode.NOT_FOUND).json({
        status: 'error',
        code: httpCode.NOT_FOUND,
        message: 'Not Found',
      });
    }

    if (user.verify) {
      return res.status(httpCode.BAD_REQUEST).json({
        status: 'error',
        code: httpCode.BAD_REQUEST,
        message: 'Verification has already been passed',
      });
    }

    await sendEmail(user.verificationToken, user.email, user.name);

    res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.OK,
      message: 'Verification email sent',
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
  updateAvatar,
  verifyEmail,
  resendEmail,
};
