const { User } = require('../models');

const getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const getUserById = async (id) => {
  return await User.findOne({ _id: id });
};

const addUser = async (body) => {
  const user = new User(body);
  return await user.save();
};

const updateToken = async (id, token) => {
  return await User.updateOne({ _id: id }, { token });
};

const updateSubscription = async (id, subscription) => {
  return await User.findByIdAndUpdate(
    { _id: id },
    { subscription },
    { new: true }
  );
};

const userService = {
  getUserByEmail,
  getUserById,
  addUser,
  updateToken,
  updateSubscription,
};

module.exports = userService;
