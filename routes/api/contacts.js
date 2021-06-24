const express = require('express');
const router = express.Router();
const { contacts: ctrl } = require('../../controllers');
const guard = require('../../helpers/guard');

const {
  validateCreateContact,
  validateUpdateContact,
  validateUpdateStatusContact,
} = require('../../validation/contacts');

router.get('/', guard, ctrl.getContacts);
router.get('/:contactId', guard, ctrl.getContactById);
router.post('/', guard, validateCreateContact, ctrl.addContact);
router.delete('/:contactId', guard, ctrl.removeContact);
router.put('/:contactId', guard, validateUpdateContact, ctrl.updateContact);
router.patch(
  '/:contactId/favorite',
  guard,
  validateUpdateStatusContact,
  ctrl.updateStatusContact
);

module.exports = router;
