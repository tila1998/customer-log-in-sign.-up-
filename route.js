const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Render sign-up form
router.get('/signup', (req, res) => {
  res.render('signup');
});

// Handle sign-up
router.post('/signup', [
  check('name').not().isEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Email is invalid'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  check('phone').isNumeric().withMessage('Phone number must be numeric')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('signup', { errors: errors.array() });
  }

  const { name, email, password, phone } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.render('signup', { errors: [{ msg: 'User already exists' }] });
    }

    user = new User({ name, email, password, phone });
    await user.save();
    res.redirect('/users/login');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Render login form
router.get('/login', (req, res) => {
  res.render('login');
});

// Handle login
router.post('/login', [
  check('email').isEmail().withMessage('Email is invalid'),
  check('password').not().isEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('login', { errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { errors: [{ msg: 'Invalid credentials' }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { errors: [{ msg: 'Invalid credentials' }] });
    }

    res.send('Login successful');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
