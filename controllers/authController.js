const User = require('../models/User');
const generateOTP = require('../utils/otpGenerator'); // ✅ Fixed import
const { sendOTPEmail } = require('../utils/emailSender');
const jwt = require('jsonwebtoken');

exports.sendOTP = async (req, res) => {
  const { email, role = 'user', name = '' } = req.body;

  try {
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with role and name
      user = new User({ email, otp, otpExpires, role, name });
    } else {
      // Update OTP fields only for existing user
      user.otp = otp;
      user.otpExpires = otpExpires;

      // Optionally: update name/role if changed
      if (!user.role && role) user.role = role;
      if (!user.name && name) user.name = name;
    }

    await user.save();
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
