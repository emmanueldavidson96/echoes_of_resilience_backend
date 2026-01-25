import jwt from 'jsonwebtoken';

export const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message: 'User authenticated successfully',
    token,
    user: user.toJSON()
  });
};

export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
};

export const getAgeGroup = (age) => {
  if (age <= 7) return '5-7';
  if (age <= 10) return '8-10';
  if (age <= 13) return '11-13';
  if (age <= 16) return '14-16';
  return '17+';
};
