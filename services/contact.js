const { Contact } = require('../models');

const getContacts = async (
  userId,
  { page = 1, limit = 5, offset = 0, sortBy, sortByDesc, filter }
) => {
  try {
    const data = await Contact.paginate(
      { owner: userId },
      {
        page,
        limit,
        offset,
        sort: {
          ...(sortBy ? { [`${sortBy}`]: 1 } : {}),
          ...(sortByDesc ? { [`${sortByDesc}`]: -1 } : {}),
        },
        select: filter ? filter.split('|').join(' ') : '',
        populate: {
          path: 'owner',
          select: 'name email subscription -_id',
        },
      }
    );

    const {
      docs: contacts,
      totalDocs: total,
      page: pageNumber,
      totalPages: allPages,
    } = data;

    return {
      total: Number(total),
      page: Number(pageNumber),
      totalPages: Number(allPages),
      limit,
      offset,
      contacts,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getContactById = async (id, userId) => {
  try {
    const data = await Contact.findById({ _id: id, owner: userId }).populate({
      path: 'owner',
      select: 'name email subscription -_id',
    });
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const addContact = async (body) => {
  try {
    const newContact = await Contact.create(body);
    return newContact;
  } catch (error) {
    throw new Error(error.message);
  }
};

const removeContact = async (id, userId) => {
  try {
    const contact = await Contact.findByIdAndDelete({
      _id: id,
      owner: userId,
    });

    return contact;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateContact = async (id, userId, body) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      { _id: id, owner: userId },
      { ...body },
      { new: true }
    );

    return contact;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateStatusContact = async (id, userId, favorite) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      { _id: id, owner: userId },
      { favorite },
      { new: true }
    );
    return contact;
  } catch (error) {
    throw new Error(error.message);
  }
};

const contactService = {
  getContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
};

module.exports = contactService;
