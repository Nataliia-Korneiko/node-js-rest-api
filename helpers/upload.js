const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const { httpCode } = require('./constants');
const { fileSizeLimit } = require('../config/rate-limit.json');

dotenv.config();

const UPLOAD_DIR = path.join(process.cwd(), process.env.UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: fileSizeLimit },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('image')) {
      cb(null, true);
      return;
    }

    const error = new Error();
    error.status = httpCode.BAD_REQUEST;
    error.message = 'Invalid file type';
    cb(error);
  },
});

module.exports = upload;
