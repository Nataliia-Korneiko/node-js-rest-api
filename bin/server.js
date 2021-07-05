const app = require('../app');
const db = require('../db/index.js');
const dotenv = require('dotenv');
const createFolder = require('../helpers/create-folder');

dotenv.config();

const PORT = process.env.PORT || 8080;
const UPLOAD_DIR = process.env.UPLOAD_DIR;

db.then(() => {
  app.listen(PORT, async () => {
    await createFolder(UPLOAD_DIR);
    console.log(`Server is running. Use our API on the port: ${PORT}`);
  });
}).catch((error) => {
  console.log(`Server is not running. Error message: ${error.message}`);
  process.exit(1);
});
