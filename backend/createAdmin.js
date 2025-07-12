// createAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js'; // ✅ adjust the path if needed

dotenv.config();

// ✅ Replace with your Admin details:
const adminData = {
  fullName: 'Super Admin',
  email: 'admin@example.com',
  password: 'Admin@123'
};

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    const newAdmin = await Admin.create({
      fullName: adminData.fullName,
      email: adminData.email,
      password: hashedPassword
    });

    console.log('🎉 Admin created successfully:');
    console.log(newAdmin);
    process.exit();
  } catch (err) {
    console.error('❌ Error creating Admin:', err);
    process.exit(1);
  }
};

createAdmin();
