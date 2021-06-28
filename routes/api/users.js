const express = require('express');
const router = express.Router();
const { users: ctrl } = require('../../controllers');
const guard = require('../../helpers/guard');
const { createAccountLimiter } = require('../../helpers/rate-limit');
const {
  validateSignup,
  validateLogin,
  validateUpdateSubscription,
} = require('../../validation/users');

router.post('/signup', createAccountLimiter, validateSignup, ctrl.signup);
router.post('/login', validateLogin, ctrl.login);
router.post('/logout', guard, ctrl.logout);
router.get('/current', guard, ctrl.getCurrentUser);
router.patch('/', guard, validateUpdateSubscription, ctrl.updateSubscription);

module.exports = router;
