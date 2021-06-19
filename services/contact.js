const { Contact } = require('../models');

const getContacts = (query) => {
  return Contact.find(query);
};

const getContactById = (id) => {
  return Contact.findById(id);
};

const addContact = (body) => {
  return Contact.create(body);
};

const removeContact = (id) => {
  return Contact.findByIdAndDelete(id);
};

const updateContact = (id, body) => {
  return Contact.findByIdAndUpdate(id, body, { new: true });
};

const updateStatusContact = (id, favorite) => {
  return Contact.findByIdAndUpdate(id, { favorite }, { new: true });
};

const service = {
  getContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
};

module.exports = service;
