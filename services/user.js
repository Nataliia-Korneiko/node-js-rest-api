const { User } = require('../models');

const getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const getUserById = async (id) => {
  // return await User.findById(id);
  return await User.findOne({ _id: id });
};

const addUser = async (body) => {
  const user = new User(body);
  // user.setPassword(password);
  return await user.save();
};

const updateToken = async (id, token) => {
  return await User.updateOne({ _id: id }, { token });
};

const userService = {
  getUserByEmail,
  getUserById,
  addUser,
  updateToken,
};

module.exports = userService;
