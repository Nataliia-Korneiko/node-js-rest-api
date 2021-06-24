const { signup, login, logout, getCurrentUser } = require('./users');

const users = {
  signup,
  login,
  logout,
  getCurrentUser,
};

module.exports = users;
