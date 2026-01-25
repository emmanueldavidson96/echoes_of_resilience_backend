import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Coach from '../src/models/Coach.js';
import dotenv from 'dotenv';

dotenv.config();

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

const deleteUser = async (email) => {
  try {
    await connectDB();
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    // Delete coach profile if exists
    if (user.role === 'coach') {
      await Coach.deleteOne({ userId: user._id });
    }

    // Delete user
    await User.deleteOne({ _id: user._id });
    console.log(`✅ User ${email} (${user.role}) deleted successfully`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
    process.exit(1);
  }
};

const emails = process.argv.slice(2);
if (emails.length === 0) {
  console.log('❌ Please provide email address(es) to delete');
  console.log('Usage: node scripts/deleteUser.js email1@example.com email2@example.com');
  process.exit(1);
}

// Delete first email, then recursively delete others
const deleteRecursive = async (emailList) => {
  if (emailList.length === 0) {
    process.exit(0);
  }
  
  const email = emailList[0];
  const user = await User.findOne({ email });
  
  if (user) {
    if (user.role === 'coach') {
      await Coach.deleteOne({ userId: user._id });
    }
    await User.deleteOne({ _id: user._id });
    console.log(`✅ Deleted: ${email}`);
  } else {
    console.log(`⏭️  Not found: ${email}`);
  }
  
  deleteRecursive(emailList.slice(1));
};

await connectDB();
await deleteRecursive(emails);
