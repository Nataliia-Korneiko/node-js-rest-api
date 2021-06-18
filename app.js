const fs = require('fs');
const path = require('path');
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const contactsRouter = require('./routes/api/contacts');
const { httpCode } = require('./helpers/constants');

dotenv.config();

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

app.use(logger('combined', { stream: accessLogStream }, formatsLogger));

app.use(cors());
app.use(express.json());

app.use('/api/contacts', contactsRouter);

app.use((req, res, _next) => {
  res.status(httpCode.NOT_FOUND).json({
    status: 'error',
    code: httpCode.NOT_FOUND,
    message: `Use api on routes: ${req.baseUrl}/api/contacts`,
    data: 'Not Found',
  });
});

app.use((error, _req, res, _next) => {
  const status = error.status ? error.status : httpCode.INTERNAL_SERVER_ERROR;

  res.status(status).json({
    status: status === 500 ? 'fail' : 'error',
    code: status,
    message: error.message,
    data: status === 500 ? 'Internal Server Error' : error.data,
  });
});

module.exports = app;
