const express = require('express');
const router = express.Router();
const { contacts: ctrl } = require('../../controllers');

const {
  validateCreateContact,
  validateUpdateContact,
  validateUpdateStatusContact,
} = require('../../validation/contacts');

router.get('/', ctrl.getContacts);

router.get('/:contactId', ctrl.getContactById);

router.post('/', validateCreateContact, ctrl.addContact);

router.delete('/:contactId', ctrl.removeContact);

router.put('/:contactId', validateUpdateContact, ctrl.updateContact);

router.patch(
  '/:contactId/favorite',
  validateUpdateStatusContact,
  ctrl.updateStatusContact
);

module.exports = router;
