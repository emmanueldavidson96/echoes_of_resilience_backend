import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from '../src/models/User.js';
import Coach from '../src/models/Coach.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Create user based on role
const createUser = async (userData) => {
  try {
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log(`❌ User with email ${userData.email} already exists!`);
      process.exit(1);
    }

    // Create user - DO NOT hash password here, let the model pre-hook do it
    const user = await User.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password, // Will be hashed by pre-save hook
      role: userData.role,
      isActive: true,
      emailVerified: true,
    });

    // Create role-specific profile if needed
    if (userData.role === 'coach') {
      await Coach.create({
        userId: user._id,
        specializations: userData.specializations || [],
        certifications: userData.certifications || [],
        bio: userData.bio || '',
      });
      console.log('✅ Coach profile created');
    }

    console.log(`\n✅ ${userData.role.toUpperCase()} account created successfully!\n`);
    console.log('📧 Email:', user.email);
    console.log('🔑 Password:', userData.password);
    console.log('👤 Role:', user.role);
    console.log('🆔 User ID:', user._id);
    console.log('\n🔗 You can now login at: http://localhost:3000/sign-in\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    process.exit(1);
  }
};

// Get user data from command line arguments or use defaults
const getUserData = () => {
  const args = process.argv.slice(2);
  const role = args[0] || 'admin'; // Default to admin

  if (role === 'admin') {
    return {
      firstName: args[1] || 'Admin',
      lastName: args[2] || 'User',
      email: args[3] || 'admin@echoes.com',
      password: args[4] || 'admin123',
      role: 'admin',
    };
  } else if (role === 'coach') {
    return {
      firstName: args[1] || 'Coach',
      lastName: args[2] || 'User',
      email: args[3] || 'coach@echoes.com',
      password: args[4] || 'coach123',
      role: 'coach',
      specializations: ['Mental Health', 'Youth Counseling'],
      certifications: ['Licensed Counselor'],
      bio: 'Experienced youth mental health coach',
    };
  } else {
    console.log('❌ Invalid role. Use "admin" or "coach"');
    process.exit(1);
  }
};

// Main execution
const userData = getUserData();
createUser(userData);
