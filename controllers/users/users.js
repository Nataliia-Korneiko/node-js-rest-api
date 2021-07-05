const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const fs = require('fs/promises');
// const path = require('path');
// const Jimp = require('jimp');
const cloudinary = require('cloudinary').v2;
const { promisify } = require('util');
const { userService: service } = require('../../services');
const { httpCode } = require('../../helpers/constants');

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET_KEY;
// const AVATARS_DIR = process.env.AVATARS_DIR;

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

    const newUser = await service.addUser({
      name,
      email,
      password,
      subscription,
      avatarURL,
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
      message: 'Success Logout',
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const getCurrentUser = async (req, res, next) => {
  const currentUser = req.user;

  try {
    return res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.OK,
      data: {
        user: {
          email: currentUser.email,
          subscription: currentUser.subscription,
          avatarURL: currentUser.avatarURL,
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

    return res.status(httpCode.OK).json({
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

// Update and upload avatar to Public folder
// const updateAvatar = async (req, res, next) => {
//   const userId = req.user.id;

//   try {
//     const avatarURL = await uploadAvatar(req);
//     await service.updateAvatar(userId, avatarURL);

//     return res.status(httpCode.OK).json({
//       status: 'success',
//       code: httpCode.OK,
//       data: {
//         avatarURL,
//       },
//     });
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// const uploadAvatar = async (req) => {
//   const pathFile = req.file.path;
//   const oldAvatar = req.user.avatarURL;
//   const newAvatarName = `${Date.now().toString()}-${req.file.originalname}`;

//   try {
//     const tmp = await Jimp.read(pathFile);

//     await tmp
//       .autocrop()
//       .cover(
//         250,
//         250,
//         Jimp.HORIZONTAL_ALIGN_CENTER || Jimp.VERTICAL_ALIGN_MIDDLE
//       )
//       .writeAsync(pathFile);

//     await fs.rename(
//       pathFile,
//       path.join(process.cwd(), 'public', AVATARS_DIR, newAvatarName)
//     );

//     if (oldAvatar.includes(`${AVATARS_DIR}/`)) {
//       await fs.unlink(path.join(process.cwd(), 'public', oldAvatar));
//     }

//     return path.join(AVATARS_DIR, newAvatarName).replace('\\', '/');
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// Update and upload avatar to Cloudinary
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

    return res.status(httpCode.OK).json({
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

const uploadAvatar = async (req, res) => {
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

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser,
  updateSubscription,
  updateAvatar,
};
