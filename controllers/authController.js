const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { generateToken } = require('../utils/tokenUtils');

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.OAUTH_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists with Google ID
    let user = await User.findOne({
      where: {
        provider: 'google',
        providerUserId: profile.id
      }
    });

    if (user) {
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({
      where: { email: profile.emails[0].value }
    });

    if (user) {
      // Link Google account to existing user
      user.provider = 'google';
      user.providerUserId = profile.id;
      user.isVerified = true; // Google accounts are pre-verified
      await user.save();
      return done(null, user);
    }

    // Create new user
    user = await User.create({
      email: profile.emails[0].value,
      name: profile.displayName,
      provider: 'google',
      providerUserId: profile.id,
      isVerified: true
    });

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name
    });

    // Generate email verification token
    const verificationToken = jwt.sign(
      { userId: user.id, type: 'email_verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // In production, send verification email
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
    console.log(`Email verification link for ${email}: ${verificationLink}`);

    // Generate login token
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful. Please check your email for verification.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified
      },
      // Remove this in production
      verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during registration', error: error.message });
  }
}; exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};

exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Authentication failed', error: err.message });
    }

    const token = generateToken(user);
    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  // For JWT, client-side token removal is sufficient
  res.json({ message: 'Logged out successfully' });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In production, send email with reset link
    // For now, return the token (remove this in production)
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    console.log(`Password reset link for ${email}: ${resetLink}`);

    res.json({
      message: 'If the email exists, a reset link has been sent',
      // Remove this in production
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing password reset', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Find user
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Update password (will be hashed by the beforeSave hook)
    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify email verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'email_verification') {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    // Find user
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.json({ message: 'Email already verified' });
    }

    // Verify email
    user.isVerified = true;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    res.status(500).json({ message: 'Error verifying email', error: error.message });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.json({ message: 'Email is already verified' });
    }

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user.id, type: 'email_verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // In production, send verification email
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;

    console.log(`Email verification link for ${email}: ${verificationLink}`);

    res.json({
      message: 'Verification email sent',
      // Remove this in production
      verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending verification email', error: error.message });
  }
};