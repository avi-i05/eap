const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const { register, login } = require('../controllers/authController');

// User Registration
router.post('/register', register);

// User Login
router.post('/login', login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign({ id: req.user.id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.redirect(`http://localhost:5173/social-login?token=${token}`);
    }
);


router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub Callback
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign({ id: req.user.id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.redirect(`http://localhost:5173/social-login?token=${token}`);
    }
);


module.exports = router;
