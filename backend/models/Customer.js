import mongoose from 'mongoose';

const ecoImpactSchema = new mongoose.Schema({
  wasteReducedKg: { type: Number, default: 0 },
  plasticSavedUnits: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  badges: [{ type: String }],
  milestones: [
    {
      name: { type: String, required: true },
      achieved: { type: Boolean, default: false },
      achievedDate: { type: Date }
    }
  ]
}, { _id: false });

const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: {
    type: String,
    default: 'https://placehold.co/40x40/cccccc/000000?text=Customer'
  },
  ecoImpact: { type: ecoImpactSchema, default: {} }
}, { timestamps: true });

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
export default Customer;
