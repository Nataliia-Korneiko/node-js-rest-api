const fs = require('fs/promises');
const path = require('path');
const shortid = require('shortid');
const contactsPath = path.join(__dirname, './contacts.json');

const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath, 'utf-8');

    return JSON.parse(data);
  } catch (error) {
    throw new Error(error.message);
  }
};

const getContactById = async (contactId) => {
  try {
    const data = await fs.readFile(contactsPath, 'utf-8');

    return JSON.parse(data).find(({ id }) => String(id) === contactId);
  } catch (error) {
    throw new Error(error.message);
  }
};

const addContact = async ({ name, email, phone }) => {
  try {
    const id = shortid();
    const newContact = {
      id,
      name,
      email,
      phone,
    };
    const data = await fs.readFile(contactsPath, 'utf-8');
    const contacts = JSON.parse(data);
    const contactsUpdated = JSON.stringify([...contacts, newContact]);

    await fs.writeFile(contactsPath, contactsUpdated);

    return newContact;
  } catch (error) {
    throw new Error(error.message);
  }
};

const removeContact = async (contactId) => {
  try {
    const data = await fs.readFile(contactsPath, 'utf-8');
    const contacts = JSON.parse(data);
    const contactDeleted = contacts.find(({ id }) => String(id) === contactId);

    if (!contactDeleted) {
      return;
    }

    const contactsFiltered = contacts.filter(
      ({ id }) => String(id) !== contactId
    );
    const contactsUpdated = JSON.stringify(contactsFiltered);

    await fs.writeFile(contactsPath, contactsUpdated);
    return contactDeleted;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateContact = async (contactId, body) => {
  try {
    const data = await fs.readFile(contactsPath, 'utf-8');
    const contacts = JSON.parse(data);
    const contact = contacts.find(({ id }) => String(id) === String(contactId));

    if (!contact) {
      return;
    }

    const contactUpdated = {
      ...contact,
      ...body,
    };

    const contactsFiltered = contacts.filter(
      ({ id }) => String(id) !== String(contactId)
    );
    const contactsUpdated = JSON.stringify([
      ...contactsFiltered,
      contactUpdated,
    ]);

    await fs.writeFile(contactsPath, contactsUpdated);
    return contactUpdated;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
};
