import mongoose from 'mongoose';

const managerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  profilePic: {
    type: String,
    default: 'https://placehold.co/40x40/cccccc/000000?text=Manager'
  },
}, { timestamps: true });

const Manager = mongoose.models.Manager || mongoose.model('Manager', managerSchema);
export default Manager;
