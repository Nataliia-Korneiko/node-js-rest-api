const { contact: service } = require('../../services');
const { httpCode } = require('../../helpers/constants');

const getContacts = async (req, res, _next) => {
  const { query } = req;

  try {
    const contacts = await service.getContacts(query);

    if (!contacts) {
      return res.status(httpCode.NOT_FOUND).json({
        status: 'error',
        code: httpCode.NOT_FOUND,
        message: 'Not Found',
      });
    }

    res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.OK,
      data: {
        contacts,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const getContactById = async (req, res, _next) => {
  const { contactId: id } = req.params;

  try {
    const contact = await service.getContactById(id);

    if (!contact) {
      return res.status(httpCode.NOT_FOUND).json({
        status: 'error',
        code: httpCode.NOT_FOUND,
        message: 'Not Found',
      });
    }

    res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.OK,
      data: {
        contact,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const addContact = async (req, res, _next) => {
  const { body } = req;
  const { name, email, phone } = body;

  try {
    const contact = await service.addContact(body);

    if (!name || !email || !phone) {
      return res.status(httpCode.BAD_REQUEST).json({
        status: 'error',
        code: httpCode.BAD_REQUEST,
        message: 'Missing required field',
      });
    }

    res.status(httpCode.CREATED).json({
      status: 'success',
      code: httpCode.CREATED,
      data: {
        contact,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const removeContact = async (req, res, _next) => {
  const { contactId: id } = req.params;

  try {
    const contact = await service.removeContact(id);

    if (!contact) {
      return res.status(httpCode.NOT_FOUND).json({
        status: 'error',
        code: httpCode.NOT_FOUND,
        message: 'Not Found',
      });
    }

    res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.OK,
      message: 'Contact Deleted',
      data: {
        contact,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateContact = async (req, res, _next) => {
  const { contactId: id } = req.params;
  const { body } = req;

  try {
    const contact = await service.updateContact(id, body);

    if (!contact) {
      return res.status(httpCode.NOT_FOUND).json({
        status: 'error',
        code: httpCode.NOT_FOUND,
        message: 'Not Found',
      });
    }

    if (!id) {
      return res.status(httpCode.NOT_FOUND).json({
        status: 'error',
        code: httpCode.NOT_FOUND,
        message: 'Not Found',
      });
    }

    res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.OK,
      message: 'Contact Updated',
      data: {
        contact,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateStatusContact = async (req, res, next) => {
  const { contactId: id } = req.params;
  const { favorite } = req.body;

  try {
    const contact = await service.updateStatusContact(id, favorite);

    if (!contact) {
      return res.status(httpCode.NOT_FOUND).json({
        status: 'error',
        code: httpCode.NOT_FOUND,
        message: 'Not Found',
      });
    }

    if (!favorite) {
      return res.status(httpCode.NOT_FOUND).json({
        status: 'error',
        code: httpCode.NOT_FOUND,
        message: 'Missing field favorite',
      });
    }

    res.json({
      status: 'success',
      code: 200,
      message: 'Status contact updated',
      data: {
        contact,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
};
