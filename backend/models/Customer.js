import mongoose from 'mongoose';

const ecoImpactSchema = new mongoose.Schema({
  wasteReducedKg: { type: Number, default: 0 },
  plasticSavedUnits: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  pointsEarned: { type: Number, default: 0 },
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
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0,0]
    }
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  ecoImpact: { type: ecoImpactSchema, default: {} }
}, { timestamps: true });

customerSchema.index({ location: '2dsphere' });

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
export default Customer;