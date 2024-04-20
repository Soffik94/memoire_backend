const express = require('express');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const path = './data/users.json';
const SECRET_KEY = 'JWTkey';

// Get User by id
router.get('/:id', (req, res) => {
  const users = JSON.parse(fs.readFileSync(path, 'utf8'));
  const user = users.find(user => user.id === parseInt(req.params.id));
  if (user) {
    res.json({ email: user.email, id: user.id });
  } else {
    res.status(404).send("User not found");
  }
});

// Register User
router.post('/register', async (req, res) => {
  const users = JSON.parse(fs.readFileSync(path, 'utf8'));
  const { email, password, isAdmin } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    userId: users.length + 1,
    email,
    passwordHash: hashedPassword,
    isAdmin: isAdmin || false
  };
  users.push(newUser);
  fs.writeFileSync(path, JSON.stringify(users, null, 2));
  res.status(201).json({ email: newUser.email, id: newUser.id, isAdmin: newUser.isAdmin });
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = JSON.parse(fs.readFileSync(path, 'utf8'));
  const user = users.find(user => user.email === email);
  if (user && await bcrypt.compare(password, user.passwordHash)) {
    const token = jwt.sign({ userId: user.userId, isAdmin: user.isAdmin }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ message: "Logged in successfully", userId: user.userId, token });
  } else {
    res.status(401).send("Invalid credentials");
  }
});

module.exports = router;
