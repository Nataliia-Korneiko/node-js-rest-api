const express = require('express');
const router = express.Router();
const { httpCode } = require('../../helpers/constants');

const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
} = require('../../model/index');

const {
  validateCreateContact,
  validateUpdateContact,
} = require('../../validation/contacts');

router.get('/', async (_req, res, next) => {
  try {
    const contacts = await listContacts();

    res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.OK,
      data: {
        contacts,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:contactId', async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.contactId);

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
    next(error);
  }
});

router.post('/', validateCreateContact, async (req, res, next) => {
  try {
    const contact = await addContact(req.body);

    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(httpCode.BAD_REQUEST).json({
        status: 'error',
        code: httpCode.BAD_REQUEST,
        message: 'Missing required name field',
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
    next(error);
  }
});

router.delete('/:contactId', async (req, res, next) => {
  try {
    const contact = await removeContact(req.params.contactId);

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
    next(error);
  }
});

router.put('/:contactId', validateUpdateContact, async (req, res, next) => {
  try {
    const contact = await updateContact(req.params.contactId, req.body);

    const { name, email, phone } = req.body;

    if (!contact) {
      return res.status(httpCode.NOT_FOUND).json({
        status: 'error',
        code: httpCode.NOT_FOUND,
        message: 'Not Found',
      });
    }

    if (!name || !email || !phone) {
      return res.status(httpCode.BAD_REQUEST).json({
        status: 'error',
        code: httpCode.BAD_REQUEST,
        message: 'Missing Fields',
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
    next(error);
  }
});

module.exports = router;
