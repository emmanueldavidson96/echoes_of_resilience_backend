import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/echoes_of_resilience');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@echoesresilience.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@echoesresilience.com');
      console.log('You can use this email to login');
      process.exit(0);
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('Admin@123', salt);

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@echoesresilience.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      emailVerified: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('-----------------------------------');
    console.log('Email: admin@echoesresilience.com');
    console.log('Password: Admin@123');
    console.log('-----------------------------------');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdminUser();
