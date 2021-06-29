const { Contact } = require('../models');

const getContacts = async (userId, query) => {
  const params = { owner: userId };
  const {
    page = 1,
    limit = 20,
    favorite = null,
    sortBy,
    sortByDesc,
    filter,
  } = query;

  try {
    if (favorite !== null) {
      params.favorite = favorite;
    }
    const data = await Contact.paginate(params, {
      page,
      limit,
      sort: {
        ...(sortBy ? { [`${sortBy}`]: 1 } : {}),
        ...(sortByDesc ? { [`${sortByDesc}`]: -1 } : {}),
      },
      select: filter ? filter.split('|').join(' ') : '',
      populate: {
        path: 'owner',
        select: 'name email subscription -_id',
      },
    });

    const {
      totalDocs: total,
      totalPages,
      page: currentPage,
      docs: contacts,
    } = data;

    return {
      total: Number(total),
      limit: Number(limit),
      totalPages: Number(totalPages),
      currentPage: Number(currentPage),
      contacts,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getContactById = async (userId, id) => {
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

const removeContact = async (userId, id) => {
  try {
    const contact = await Contact.findByIdAndDelete({
      owner: userId,
      _id: id,
    }).populate({
      path: 'owner',
      select: 'name email subscription -_id',
    });

    return contact;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateContact = async (userId, id, body) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      { _id: id, owner: userId },
      { ...body },
      { new: true }
    ).populate({
      path: 'owner',
      select: 'name email subscription -_id',
    });

    return contact;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateStatusContact = async (userId, id, favorite) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      { _id: id, owner: userId },
      { favorite },
      { new: true }
    ).populate({
      path: 'owner',
      select: 'name email subscription -_id',
    });
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
