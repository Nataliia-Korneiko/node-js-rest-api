const {
  signup,
  login,
  logout,
  getCurrentUser,
  updateSubscription,
} = require('./users');

const users = {
  signup,
  login,
  logout,
  getCurrentUser,
  updateSubscription,
};

module.exports = users;
